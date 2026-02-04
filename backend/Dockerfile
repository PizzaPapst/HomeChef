# Wir starten mit einem schlanken Node-Image
FROM node:20-slim

# WICHTIG: Wir müssen Chrome und nötige Bibliotheken für Puppeteer installieren
# Sonst stürzt der Scraper im Container ab.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer Konfiguration: Wir nutzen das installierte Chrome, nicht das, was Puppeteer runterladen will
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Arbeitsverzeichnis im Container
WORKDIR /usr/src/app

# Erst nur package.json kopieren (für besseres Caching)
COPY package*.json ./
COPY prisma ./prisma/

# Abhängigkeiten installieren
RUN npm ci

# Prisma Client generieren
RUN npx prisma generate

# Den Rest des Codes kopieren
COPY . .

# Bauen der NestJS App
RUN npm run build

# Port freigeben
EXPOSE 3000

# Startbefehl: Erst Migrationen ausführen, dann Server starten
CMD [  "sh", "-c", "npx prisma migrate deploy && npm run start:prod" ]