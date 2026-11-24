/**
 * EduConnect - Mock HTTP genérico para los cuatro servicios.
 * Un solo código, parametrizado por SERVICE_NAME y PORT.
 * Sin dependencias externas: solo módulos nativos de Node.js.
 */
"use strict";

const http = require("node:http");
const { URL } = require("node:url");

const SERVICE_NAME = process.env.SERVICE_NAME || "desconocido";
const PORT = Number.parseInt(process.env.PORT || "3001", 10);

// Respuestas ficticias y estáticas. El campo "servicio" y la cabecera
// X-Service permiten comprobar de forma objetiva qué backend respondió.
const PAYLOADS = {
  estudiantes: {
    id: 101,
    nombre: "Ana Perez",
    carrera: "Ingenieria de Software",
    servicio: "estudiantes",
  },
  matriculas: {
    id: 501,
    estudianteId: 101,
    periodo: "2026-1",
    estado: "ACTIVA",
    servicio: "matriculas",
  },
  pagos: {
    id: 701,
    matriculaId: 501,
    valor: 150.0,
    moneda: "USD",
    estado: "PENDIENTE",
    servicio: "pagos",
  },
  certificados: {
    id: 901,
    estudianteId: 101,
    tipo: "CERTIFICADO_ACADEMICO",
    estado: "EMITIDO",
    servicio: "certificados",
  },
};

if (!PAYLOADS[SERVICE_NAME]) {
  console.error(`[${SERVICE_NAME}] SERVICE_NAME inválido. Use uno de: ${Object.keys(PAYLOADS).join(", ")}`);
  process.exit(1);
}

const RESOURCE_PATH = `/${SERVICE_NAME}`;

function logRequest(req, status, startedAt) {
  const entry = {
    ts: new Date().toISOString(),
    servicio: SERVICE_NAME,
    metodo: req.method,
    ruta: req.url,
    estado: status,
    duracionMs: Date.now() - startedAt,
    cliente: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    consumidorKong: req.headers["x-consumer-username"] || null,
    apiKeyRecibidaEnBackend: Boolean(req.headers["apikey"]),
  };
  // Registro estructurado en consola: evidencia de solicitudes recibidas.
  console.log(JSON.stringify(entry));
}

function sendJson(req, res, status, body, startedAt) {
  const json = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(json),
    "X-Service": SERVICE_NAME,
    "X-Mock-Port": String(PORT),
    "Cache-Control": "no-store",
  });
  res.end(json);
  logRequest(req, status, startedAt);
}

const server = http.createServer((req, res) => {
  const startedAt = Date.now();
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  // Normaliza la barra final que puede agregar Kong al unir service.path + ruta.
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(req, res, 405, { mensaje: "Método no permitido en el mock", servicio: SERVICE_NAME }, startedAt);
  }

  if (path === "/health") {
    return sendJson(req, res, 200, { estado: "ok", servicio: SERVICE_NAME, puerto: PORT }, startedAt);
  }

  // Acepta la ruta interna directa (/pagos) y también /api/pagos, útil al
  // diagnosticar el mock por dentro de la red sin pasar por Kong.
  if (path === RESOURCE_PATH || path === `/api${RESOURCE_PATH}` || path === "/") {
    return sendJson(req, res, 200, PAYLOADS[SERVICE_NAME], startedAt);
  }

  return sendJson(
    req,
    res,
    404,
    {
      mensaje: "Recurso no encontrado en el mock",
      servicio: SERVICE_NAME,
      rutaSolicitada: url.pathname,
    },
    startedAt
  );
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[${SERVICE_NAME}] mock escuchando en 0.0.0.0:${PORT} (ruta ${RESOURCE_PATH})`);
});

function shutdown(signal) {
  console.log(`[${SERVICE_NAME}] recibida señal ${signal}, cerrando...`);
  server.close(() => process.exit(0));
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
