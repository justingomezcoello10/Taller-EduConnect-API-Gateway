#!/usr/bin/env python3
"""
Prueba del caso "backend no disponible" (Reto 4).

Detiene temporalmente el mock de Pagos, consulta /api/pagos a través de Kong,
registra el código observado y vuelve a levantar el contenedor.

Uso (Docker debe estar en ejecución):
    python scripts/test-backend-down.py
"""

from __future__ import annotations

import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE_URL = "http://localhost:8000"
API_KEY = "educonnect-poc-key-2026"
ROOT = Path(__file__).resolve().parents[1]
OUT_FILE = ROOT / "evidencia" / "backend-no-disponible.json"


def run(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(args, cwd=ROOT, text=True, capture_output=True, check=False)


def request_pagos() -> dict:
    url = f"{BASE_URL}/api/pagos"
    request = urllib.request.Request(url, headers={"apikey": API_KEY})
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return {
                "estado": response.status,
                "cuerpo": response.read().decode("utf-8", errors="replace"),
                "cabeceras": dict(response.headers.items()),
            }
    except urllib.error.HTTPError as error:
        return {
            "estado": error.code,
            "cuerpo": error.read().decode("utf-8", errors="replace"),
            "cabeceras": dict(error.headers.items()),
        }


def main() -> int:
    print("1) Deteniendo el mock de Pagos (educonnect-pagos)...")
    stop = run("docker", "compose", "stop", "pagos")
    print(stop.stdout.strip() or stop.stderr.strip())
    time.sleep(2)

    print("2) Consultando el gateway: GET /api/pagos")
    result = request_pagos()
    print(f"   HTTP observado: {result['estado']}")
    print(f"   Cuerpo: {result['cuerpo'][:300]}")

    print("3) Levantando nuevamente el mock de Pagos...")
    start = run("docker", "compose", "start", "pagos")
    print(start.stdout.strip() or start.stderr.strip())
    time.sleep(3)

    print("4) Verificando recuperación: GET /api/pagos")
    recovered = request_pagos()
    print(f"   HTTP observado: {recovered['estado']}")

    evidence = {
        "caso": "Reto 4 - Backend no disponible",
        "fechaEjecucion": datetime.now(timezone.utc).isoformat(),
        "accion": "docker compose stop pagos",
        "solicitud": "GET /api/pagos con API Key válida",
        "estadoConBackendDetenido": result["estado"],
        "cuerpoConBackendDetenido": result["cuerpo"],
        "estadoTrasRecuperacion": recovered["estado"],
        "aprobado": result["estado"] in (500, 502, 503, 504) and recovered["estado"] == 200,
    }
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nEvidencia: {OUT_FILE}")
    print(f"Resultado: {'OK' if evidence['aprobado'] else 'REVISAR'}")
    return 0 if evidence["aprobado"] else 1


if __name__ == "__main__":
    sys.exit(main())
