# Decisiones arquitectónicas de la PoC EduConnect

## Propósito y arquitectura

La PoC valida un punto de entrada común para Estudiantes, Matrículas, Pagos y Certificados, y comprueba políticas básicas de acceso y consumo. Kong Gateway 3.9.5 se ejecuta en modo DB-less dentro de Docker Compose. El cliente envía solicitudes a `http://localhost:8000`; Kong valida la solicitud y la reenvía por la red `educonnect-net` a uno de cuatro mocks independientes. Los backends no publican puertos al host. La configuración declarativa en `kong/kong.yml` y el DNS interno de Docker permiten reproducir el entorno sin direcciones IP fijas.

Un **Service** describe el destino backend, por ejemplo `http://pagos:3003/pagos`. Una **Route** identifica la combinación pública de ruta y método, por ejemplo `GET /api/pagos`. Con `strip_path: true`, Kong retira `/api` antes de enviar la solicitud. Si cambia el nombre interno o el puerto, se actualiza el Service; el contrato público puede mantenerse.

## Identidad y control de consumo

El plugin `key-auth` busca una clave ficticia en la cabecera `apikey` e identifica un Consumer. `hide_credentials: true` evita que Kong reenvíe esa clave al mock. La ausencia o invalidez devuelve `401`; una clave válida permite que la solicitud continúe. Esto comprueba **autenticación (AuthN)**: quién presenta la credencial. No implementa **autorización (AuthZ)**: si un usuario puede leer un pago, matrícula o certificado específico. La autorización necesita contexto de usuario, recurso, acción y políticas de negocio.

Rate Limiting usa `policy: local` y `limit_by: consumer`: cinco solicitudes por minuto para las rutas originales y dos para Certificados. En la suite local se observaron las secuencias `200 × 5 + 429` y `200 × 2 + 429`. El contador local no se comparte entre varias instancias; por tanto, esta prueba no representa una cuota global distribuida.

## Límites y decisiones productivas pendientes

La solución usa datos estáticos, no dispone de alta disponibilidad, persistencia de negocio, TLS, identidad final, autorización por recurso ni trazabilidad distribuida completa. Kong centraliza políticas y desacopla al consumidor de los backends, pero también se vuelve un componente crítico.

Antes de producción se recomienda añadir OAuth2/OIDC y políticas RBAC/ABAC; TLS y gestión/rotación de secretos; Redis o un almacenamiento compartido para cuotas distribuidas; varias réplicas detrás de un balanceador; y métricas, trazas, alertas, auditoría y pruebas de carga y recuperación.

## Fuentes consultadas

[Kong Gateway](https://developer.konghq.com/gateway/) · [DB-less](https://developer.konghq.com/gateway/db-less-mode/) · [Key Authentication](https://developer.konghq.com/plugins/key-auth/) · [Rate Limiting](https://developer.konghq.com/plugins/rate-limiting/) · [Docker Compose](https://docs.docker.com/compose/) · [Postman](https://learning.postman.com/docs/) · [OWASP API Security](https://owasp.org/API-Security/)
