# Matriz de evidencias — Taller EduConnect API Gateway

**Universidad de las Américas**  
**Facultad de Ingeniería y Ciencias Aplicadas**  
**Asignatura:** Taller EduConnect API Gateway  
**Grupo 3**  
**Integrantes:** Jhoel Suarez, Mauricio Mora, Stefan Jativa y Justin Gomezcoello

## Reto 0 — Comprender y desplegar Kong

| Campo | Registro |
|---|---|
| Hipótesis | Si se levantan Kong y los cuatro mocks en una red Docker con nombres DNS, Kong podrá resolver cada backend sin configurar IPs rígidas. |
| Decisión | Kong `3.9.5` en modo DB-less. Se fijó una versión compatible y se utilizó `kong.yml` declarativo. |
| Prueba | `docker compose up -d --build` y `docker compose ps`. |
| Resultado | Los cinco contenedores quedaron operativos y el mock de estudiantes pasó el healthcheck. |
| Evidencia | `contenedores.txt`, salida de `docker compose ps` y registros de Kong. |
| Limitación | DB-less ofrece buena reproducibilidad local, pero no conserva una administración central dinámica ni estado de datos fuera del archivo declarativo. |

### Comando exacto

```powershell
docker compose ps --format "table {{.Name}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

## Reto 1 — Unificar el punto de acceso

| Campo | Registro |
|---|---|
| Hipótesis | Las rutas públicas `/api/estudiantes`, `/api/matriculas`, `/api/pagos` y `/api/certificados`, con API Key válida, llegarán a sus servicios correspondientes y devolverán 200. |
| Decisión | Se creó un `Service` por backend y una `Route` por URL pública; `strip_path: true` elimina el prefijo público. |
| Prueba | Suite `python scripts/verify.py`; pruebas individuales con `curl.exe -i`. |
| Resultado | Las cuatro rutas fueron observadas con HTTP 200 en la ejecución de la suite. |
| Evidencia | `resultados-pruebas.json`. |
| Limitación | `Service` y `Route` son independientes: cambiar la IP interna no afecta al cliente si se conserva el nombre DNS, pero sí debe actualizarse la URL del Service si cambia el puerto o nombre DNS real. |

## Reto 2 — API Key

| Campo | Registro |
|---|---|
| Hipótesis | Sin credencial o con una credencial inexistente, key-auth responderá 401; una credencial registrada permitirá una ruta válida. |
| Decisión | Cabecera ficticia `apikey`, plugin key-auth en cada ruta. |
| Prueba | Sin key, key inválida y key válida; respuestas observadas `401`, `401` y `200`. |
| Resultado | Coincide con la hipótesis. |
| Evidencia | `resultados-pruebas.json`. |
| Limitación | API Key demuestra autenticación del consumidor, no autorización sobre matrícula, persona, operación o recurso. No cifra por sí sola las solicitudes ni sustituye identidad de usuario final ni autorización RBAC/ABAC. |

## Reto 3 — Controlar consumo

| Campo | Registro |
|---|---|
| Hipótesis | Un consumidor nuevo recibirá cinco respuestas 200 y la sexta en la misma ventana recibirá 429. |
| Decisión | `rate-limiting`, `minute: 5`, `policy: local`, `limit_by: consumer`, aplicado a las rutas del laboratorio. |
| Prueba | Seis solicitudes consecutivas con `educonnect-rate-key-2026` a `/api/pagos`. |
| Resultado observado | Secuencia `[200, 200, 200, 200, 200, 429]`. |
| Evidencia | `resultados-pruebas.json`. |
| Limitación | El contador local no se comparte entre instancias. En producción se debe usar una política distribuida con Redis o una solución aprobada, además de identidad y límites por consumidor, ruta y entorno. |

## Reto 4 — Comportamiento y evidencias

| Campo | Registro |
|---|---|
| Hipótesis | Una ruta inexistente responderá 404. Si se detiene un mock, Kong devolverá un error de proxy (normalmente 500/502/503/504 según el estado de la conexión). |
| Decisión | Se probó `/api/desconocido` y se detuvo temporalmente el contenedor de Pagos. |
| Prueba | `curl.exe` y `python scripts/test-backend-down.py`. |
| Resultado | Ruta desconocida: 404. Backend detenido: HTTP 500. Tras reiniciar el contenedor volvió a iniciarse el mock; también se registró 503 durante su arranque/heatlhcheck. |
| Evidencia | `backend-no-disponible.json` y `docker compose ps`. |
| Limitación | Los códigos varían según el momento exacto de desconexión y configuración del balanceador/proxy; la prueba registra el estado real y no una cifra predeterminada. |

## Desafío de transferencia — Certificados

| Campo | Registro |
|---|---|
| Hipótesis | Una cuarta ruta `/api/certificados` estará protegida con key-auth y aplicará un límite distinto de 2/min para su consumidor dedicado. |
| Decisión | Nuevo mock independiente, puerto interno 3004, Service/Route/Kong declarativos y `minute: 2`. |
| Prueba | Dos solicitudes 200 seguidas y una tercera 429 con la key dedicada. También se verificó API Key válida y ausencia de credencial. |
| Resultado | Secuencia válida `[200, 200, 429]`; la prueba sin key fue 401 y con key general fue 200. |
| Evidencia | `resultados-pruebas.json`. |
| Limitación | El límite 2/min es local, no distribuido. La key general de app no demuestra autorización específica para certificados. |
