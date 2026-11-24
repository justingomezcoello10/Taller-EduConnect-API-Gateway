#!/usr/bin/env python3
"""
Verificación reproducible de la PoC EduConnect API Gateway.

Ejecuta los casos de aceptación de los Retos 1-4 y del reto de transferencia
(Certificados) contra el gateway, sin dependencias externas (solo stdlib).
Guarda la evidencia completa en evidencia/resultados-pruebas.json.

Uso:
    python scripts/verify.py
    GATEWAY_URL=http://localhost:8000 python scripts/verify.py
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE_URL = os.environ.get("GATEWAY_URL", "http://localhost:8000").rstrip("/")
API_KEY = "educonnect-poc-key-2026"
RATE_KEY = "educonnect-rate-key-2026"
CERT_KEY = "educonnect-cert-key-2026"
INVALID_KEY = "clave-invalida-de-prueba"

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "evidencia"
OUT_FILE = OUT_DIR / "resultados-pruebas.json"

HEADERS_OF_INTEREST = (
    "HTTP-Status",
    "Content-Type",
    "Server",
    "X-Kong-Request-Id",
    "X-Kong-Response-Latency",
    "RateLimit-Limit-Minute",
    "RateLimit-Remaining-Minute",
    "Retry-After",
    "X-Service",
    "WWW-Authenticate",
)


def call(path: str, api_key: str | None = None, method: str = "GET") -> dict:
    """Realiza una solicitud y devuelve estado, cabeceras y cuerpo."""
    url = f"{BASE_URL}{path}"
    headers = {}
    if api_key is not None:
        headers["apikey"] = api_key

    request = urllib.request.Request(url, headers=headers, method=method)
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            status = response.status
            raw = response.read()
            response_headers = dict(response.headers.items())
    except urllib.error.HTTPError as error:
        status = error.code
        raw = error.read()
        response_headers = dict(error.headers.items())
    except urllib.error.URLError as error:
        return {
            "url": url,
            "metodo": method,
            "estado": None,
            "error": str(error.reason),
            "duracionMs": round((time.perf_counter() - started) * 1000, 1),
        }

    elapsed = round((time.perf_counter() - started) * 1000, 1)
    text = raw.decode("utf-8", errors="replace")
    try:
        body = json.loads(text)
    except json.JSONDecodeError:
        body = text

    selected_headers = {k: v for k, v in response_headers.items() if k in HEADERS_OF_INTEREST}
    selected_headers["HTTP-Status"] = status
    return {
        "url": url,
        "metodo": method,
        "apiKeyEnviada": api_key,
        "estado": status,
        "duracionMs": elapsed,
        "cabeceras": selected_headers,
        "cuerpo": body,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def check(name: str, path: str, expected: int | set[int], api_key: str | None, note: str = "") -> dict:
    result = call(path, api_key)
    expected_set = {expected} if isinstance(expected, int) else expected
    passed = result.get("estado") in expected_set
    record = {
        "caso": name,
        "solicitud": f"GET {path}",
        "apiKey": "(sin cabecera apikey)" if api_key is None else api_key,
        "esperado": sorted(expected_set),
        "observado": result.get("estado"),
        "aprobado": passed,
        "nota": note,
        "respuesta": result,
    }
    icon = "OK " if passed else "FALLO"
    print(f"[{icon}] {name:<46} esperado={sorted(expected_set)} observado={result.get('estado')}")
    return record


def burst(name: str, path: str, api_key: str, count: int) -> dict:
    """Envía N solicitudes consecutivas y registra la secuencia de estados."""
    print(f"\n--- {name}: {count} solicitudes consecutivas a {path} ---")
    attempts = []
    for index in range(1, count + 1):
        result = call(path, api_key)
        attempts.append(
            {
                "numero": index,
                "estado": result.get("estado"),
                "timestamp": result.get("timestamp"),
                "rateLimitRemaining": result.get("cabeceras", {}).get("RateLimit-Remaining-Minute"),
                "retryAfter": result.get("cabeceras", {}).get("Retry-After"),
                "cuerpo": result.get("cuerpo"),
            }
        )
        print(
            f"  #{index}: HTTP {result.get('estado')} | remaining="
            f"{result.get('cabeceras', {}).get('RateLimit-Remaining-Minute')}"
        )
        time.sleep(0.25)

    statuses = [item["estado"] for item in attempts]
    record = {
        "caso": name,
        "solicitud": f"GET {path} x{count}",
        "apiKey": api_key,
        "secuenciaEstados": statuses,
        "primerEstado": statuses[0] if statuses else None,
        "ultimoEstado": statuses[-1] if statuses else None,
        "intentos": attempts,
    }
    print(f"  Secuencia: {statuses}\n")
    return record


def main() -> int:
    print(f"Gateway: {BASE_URL}")
    print(f"Inicio:  {datetime.now(timezone.utc).isoformat()}\n")

    results = []

    print("=== Reto 1 - Punto de acceso único ===")
    for resource, service in (
        ("estudiantes", "estudiantes"),
        ("matriculas", "matriculas"),
        ("pagos", "pagos"),
    ):
        record = check(
            f"Reto 1 - GET /api/{resource} con API Key válida",
            f"/api/{resource}",
            200,
            API_KEY,
            f"Debe responder el mock {service}",
        )
        body = record["respuesta"].get("cuerpo")
        record["servicioEsperado"] = service
        record["servicioObservado"] = body.get("servicio") if isinstance(body, dict) else None
        record["aprobado"] = record["aprobado"] and record["servicioObservado"] == service
        results.append(record)

    print("\n=== Reto 2 - Autenticación por API Key ===")
    results.append(
        check("Reto 2 - Sin API Key", "/api/estudiantes", 401, None, "Kong debe rechazar la solicitud")
    )
    results.append(
        check(
            "Reto 2 - API Key incorrecta",
            "/api/estudiantes",
            401,
            INVALID_KEY,
            "Credencial inexistente",
        )
    )
    results.append(
        check("Reto 2 - API Key válida", "/api/estudiantes", 200, API_KEY, "Credencial registrada")
    )

    print("\n=== Reto 4 - Casos negativos ===")
    results.append(
        check(
            "Reto 4 - Ruta no registrada",
            "/api/desconocido",
            404,
            API_KEY,
            "Kong no encuentra Route coincidente",
        )
    )

    print("\n=== Reto de transferencia - Certificados ===")
    results.append(
        check(
            "Certificados - API Key válida",
            "/api/certificados",
            200,
            API_KEY,
            "Cuarto mock expuesto y protegido",
        )
    )
    results.append(
        check(
            "Certificados - Sin API Key",
            "/api/certificados",
            401,
            None,
            "La nueva ruta también exige credencial",
        )
    )

    print("\n=== Reto 3 - Límite de consumo (5/min) ===")
    burst_record = burst("Reto 3 - Ráfaga de 6 solicitudes", "/api/pagos", RATE_KEY, 6)
    burst_record["aprobado"] = (
        burst_record["primerEstado"] == 200
        and burst_record["secuenciaEstados"].count(200) == 5
        and burst_record["ultimoEstado"] == 429
    )
    print(f"[{'OK ' if burst_record['aprobado'] else 'FALLO'}] Secuencia esperada: 200 x5 y 429 en la sexta")
    if not burst_record["aprobado"] and burst_record["primerEstado"] != 200:
        print("  Aviso: la ventana de un minuto pudo reiniciarse. Reinicie Kong y repita la prueba.")
    results.append(burst_record)

    print("\n=== Reto de transferencia - Límite propio de Certificados (2/min) ===")
    cert_record = burst("Certificados - Ráfaga de 3 solicitudes", "/api/certificados", CERT_KEY, 3)
    cert_record["aprobado"] = (
        cert_record["primerEstado"] == 200
        and cert_record["secuenciaEstados"].count(200) == 2
        and cert_record["ultimoEstado"] == 429
    )
    print(f"[{'OK ' if cert_record['aprobado'] else 'FALLO'}] Secuencia esperada: 200 x2 y 429 en la tercera")
    results.append(cert_record)

    summary = {
        "proyecto": "EduConnect API Gateway - Grupo 3",
        "gateway": BASE_URL,
        "versionKong": "3.9.5",
        "fechaEjecucion": datetime.now(timezone.utc).isoformat(),
        "totalCasos": len(results),
        "casosAprobados": sum(1 for item in results if item.get("aprobado")),
        "casosFallidos": sum(1 for item in results if not item.get("aprobado")),
        "resultados": results,
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n" + "=" * 62)
    print(f"Casos aprobados: {summary['casosAprobados']}/{summary['totalCasos']}")
    print(f"Evidencia JSON:  {OUT_FILE}")
    print("=" * 62)

    return 0 if summary["casosFallidos"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
