# Decisiones arquitectónicas

**Universidad de las Américas — Facultad de Ingeniería y Ciencias Aplicadas**  
**Taller EduConnect API Gateway — Grupo 3**

## Diseño elegido

La PoC expone cuatro servicios simulados detrás de Kong Gateway 3.9.5, ejecutado en Docker Compose y modo DB-less. Se fijó la versión 3.9.5 porque está disponible como imagen oficial, facilita despliegues reproducibles y permite almacenamiento declarativo en `kong.yml`. El cliente accede únicamente por `localhost:8000`; los backends viven en una red Docker privada y se resuelven por nombres de servicio.

Un `Service` representa el destino interno y una `Route` representa el criterio público de coincidencia. Por ello, cambiar la dirección interna puede exiguir actualizar el Service; cambiar una URL pública puede implicar modificar o añadir una Route. El prefijo `/api` se elimina antes de reenviar al backend.

## Autenticación y autorización

Key Authentication distingue consumidores ficticios. Sin API Key o con una clave incorrecta, Kong responde HTTP 401. Una clave válida demuestra únicamente que el consumidor fue reconocido, no que pueda leer una matrícula concreta, emitir un certificado o ejecutar una operación de negocio. AuthN identifica quién llama; AuthZ decide qué puede hacer. La autorización debería implementarse por identidad de usuario, rol, alcance y política, en Kong o en los backends.

## Límite de consumo

Se aplicó `minute: 5` por consumidor a las rutas principales y `minute: 2` a Certificados. Se confirmó una secuencia 200×5 + 429 y 200×2 + 429. `policy: local` mantiene contadores dentro de cada proceso/instancia de Kong. Es simple y válido para una sola instancia, pero puede permitir excedentes si existen múltiples réplicas.

## Limitaciones de la PoC

No implementa identidad de usuarios finales, autorización de recursos, persistencia, observabilidad distribuida, TLS ni alta disponibilidad. Las API Keys son ficticias y los datos son estáticos. Las respuestas ante backend caído dependen del momento y estado del proxy.

## Mejoras productivas

Antes de producción se debe usar base de datos o control de configuración seguro, secretos administrados, TLS mutuo o OAuth2/OIDC según el riesgo, políticas RBAC/ABAC, Redis compartido para rate limiting, múltiples réplicas de Kong y balanceador externo, healthchecks activos, circuit breakers, timeouts, reintentos controlados, trazas distribuidas, métricas y alertas. También se requieren auditoría, rotación de claves, pruebas de carga y respaldo.

## Preguntas de cierre

La PoC reduce el acceso directo a APIs, ofrece un punto único de política y mejora visibilidad básica. No resuelve identidad de usuarios finales, autorización de datos, persistencia, disponibilidad ni monitoreo distribuido. Centralizar crea consistencia operacional, pero concentra riesgo, acopla a los consumidores con Kong y exige alta disponibilidad, seguridad de administración y operación profesional.
