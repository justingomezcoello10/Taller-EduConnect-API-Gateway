# Taller EduConnect API Gateway

Prueba de concepto reproducible para centralizar cuatro APIs simuladas con Kong Gateway 3.9.5, Docker Compose, autenticación API Key y límites de solicitudes.

## Qué se implementó

- Kong en modo DB-less, configurado en [`kong/kong.yml`](kong/kong.yml).
- Cuatro servicios HTTP independientes: Estudiantes, Matrículas, Pagos y Certificados.
- Un único proxy público en `http://localhost:8000`; los backends usan DNS de la red Docker `educonnect-net` y no publican puertos al host.
- API Key mediante la cabecera `apikey`; rate limiting de 5 solicitudes/min por consumidor en las tres rutas originales y 2/min en Certificados.
- Solicitudes Postman con variables de colección y descripciones por caso en [`Postman_EduConnect_API_Gateway.postman_collection.json`](Postman_EduConnect_API_Gateway.postman_collection.json).

## Requisitos

Docker Desktop o Docker Engine en ejecución, Docker Compose v2 y Postman (o `curl.exe`). Python 3.10 o posterior es opcional para ejecutar la suite de verificación; no se requieren instalaciones de paquetes Python.

## Iniciar y comprobar el entorno

Desde esta carpeta:

```powershell
docker compose up -d --build
docker compose ps
```

El primer comando construye los mocks, crea la red y arranca Kong y los cuatro backends. El segundo muestra si cada contenedor está en estado `healthy`. El proxy público escucha en el puerto `8000`. La Admin API se limita a `127.0.0.1:8001` para diagnóstico local.

## Configurar y enviar solicitudes en Postman

Abre la colección **EduConnect API Gateway - Grupo 3**. Define o confirma las variables:

| Variable | Valor de laboratorio | Uso |
|---|---|---|
| `baseUrl` | `http://localhost:8000` | Dirección común de Kong |
| `apiKey` | `educonnect-poc-key-2026` | Rutas positivas y solicitudes comunes |
| `rateKey` | `educonnect-rate-key-2026` | Consumidor dedicado a la prueba 5/min |
| `certKey` | `educonnect-cert-key-2026` | Consumidor dedicado a Certificados, 2/min |

Las claves son ficticias y se incluyen solo para el laboratorio. Cada solicitud es `GET`; las rutas positivas envían la cabecera `apikey` con la variable correspondiente. Usa **Send** para enviar una solicitud y lee el estado HTTP y el JSON en el panel Response. La clave se valida en Kong y `hide_credentials: true` evita reenviarla a los mocks.

Para repetir la ráfaga de Pagos, envía `GET {{baseUrl}}/api/pagos` seis veces seguidas con `rateKey`: se esperan cinco `200` y un `429`. Para Certificados envía tres veces con `certKey`: se esperan dos `200` y un `429`. Los contadores son locales y caducan por ventana de minuto; si el primer resultado es `429`, espera una ventana completa o reinicia Kong para limpiar el contador de esta PoC.

## Ejecutar la suite de verificación

```powershell
python scripts/verify.py
```

La suite ejecuta rutas positivas, credenciales ausentes e inválidas, ruta inexistente y ambas ráfagas. Guarda la respuesta, el estado y la hora de cada intento en [`evidencia/resultados-pruebas.json`](evidencia/resultados-pruebas.json). Un resultado satisfactorio muestra `11/11`.

## Probar un backend no disponible

Esta prueba detiene temporalmente solo Pagos. Desde la raíz del repositorio:

```powershell
docker compose stop pagos
```

Envía desde Postman `GET {{baseUrl}}/api/pagos` con `apikey: {{apiKey}}`. El código depende del estado del proxy; en la ejecución documentada Kong devolvió `503 Service Temporarily Unavailable` mientras resolvía el nombre del backend. Recupera el mock y espera su healthcheck:

```powershell
docker compose start pagos
docker compose ps
```

Si Kong conserva temporalmente el error de DNS tras recrearse el mock, reinicia el gateway y espera a que aparezca `healthy`; después repite la solicitud en Postman:

```powershell
docker compose restart kong
docker compose ps
```

La prueba registrada terminó con `200 OK` tras esa recuperación. La evidencia y explicación están en [`evidencia/backend-no-disponible.json`](evidencia/backend-no-disponible.json).

## Rutas públicas

| Método y ruta | Backend interno | Política |
|---|---|---|
| `GET /api/estudiantes` | `estudiantes:3001/estudiantes` | API Key; 5/min por consumidor |
| `GET /api/matriculas` | `matriculas:3002/matriculas` | API Key; 5/min por consumidor |
| `GET /api/pagos` | `pagos:3003/pagos` | API Key; 5/min por consumidor |
| `GET /api/certificados` | `certificados:3004/certificados` | API Key; 2/min por consumidor |

La configuración usa `strip_path: true`: Kong elimina el prefijo público `/api` y solicita la ruta interna del Service. Un **Service** identifica el destino backend; una **Route** identifica la URL y el método que el consumidor puede invocar.

## Evidencias y documentos

- Informe de práctica con pasos, resultados, capturas reales y análisis: `INFORME_EDUCONNECT.docx` y `INFORME_EDUCONNECT.pdf`.
- Matriz por reto con predicción, decisión, prueba, observación, evidencia y limitación: [`evidencia/matriz-evidencias.md`](evidencia/matriz-evidencias.md).
- Resumen de decisiones arquitectónicas, AuthN/AuthZ, límites y mejoras (máximo dos páginas): `DECISIONES_ARQUITECTONICAS.docx` y `DECISIONES_ARQUITECTONICAS.pdf`.
- Capturas tomadas en Docker Desktop y Postman: [`evidencia/capturas-reales/`](evidencia/capturas-reales/).

## Detener el entorno

```powershell
docker compose down
```

Esto detiene y elimina contenedores y red de Compose. Los archivos de configuración y evidencia permanecen en el repositorio.

## Declaración de IA y fuentes

Se utilizó IA generativa como apoyo para ordenar documentación y preparar verificaciones. El equipo contrastó la configuración ejecutándola en Docker Desktop, Kong y Postman. Referencias técnicas: [Kong Gateway](https://developer.konghq.com/gateway/), [DB-less](https://developer.konghq.com/gateway/db-less-mode/), [Key Authentication](https://developer.konghq.com/plugins/key-auth/), [Rate Limiting](https://developer.konghq.com/plugins/rate-limiting/), [Docker Compose](https://docs.docker.com/compose/), [Postman](https://learning.postman.com/docs/) y [OWASP API Security](https://owasp.org/API-Security/).
