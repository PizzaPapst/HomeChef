FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# --- NEU: Wir definieren, dass hier eine Variable reinkommt ---
ARG VITE_API_URL
# Wir setzen sie als ENV, damit Vite sie beim Build sehen kann
ENV VITE_API_URL=$VITE_API_URL
# -------------------------------------------------------------

RUN npm run build

# ... Rest des Dockerfiles (z.B. Nginx oder serve) ...