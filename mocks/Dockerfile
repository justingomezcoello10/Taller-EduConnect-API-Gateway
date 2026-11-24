FROM node:20-alpine

WORKDIR /app
COPY server.js .

# El proceso no necesita escribir en disco: se ejecuta como usuario sin privilegios.
USER node

CMD ["node", "server.js"]
