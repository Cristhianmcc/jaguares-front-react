# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias (cachea capa si package.json no cambia)
COPY package*.json ./
RUN npm ci

# Copiar fuente y compilar con variables de producción
# (usa .env.production automáticamente con vite build)
COPY . ./
RUN npm run build
# Resultado en /app/dist (incluye public/ automáticamente)

# ── Stage 2: Serve ──────────────────────────────────────────
FROM nginx:alpine

# Archivos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración nginx (SPA routing + caché)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
