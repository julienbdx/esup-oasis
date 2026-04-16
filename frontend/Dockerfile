# --- Étape 1 : Build ---
FROM node:24-alpine AS build

WORKDIR /app

# On copie uniquement les fichiers de dépendances pour profiter du cache Docker
COPY package.json yarn.lock ./

# Installation des dépendances (frozen-lockfile pour garantir l'intégrité)
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build && \
    find /app/build -type f \( -name "*.js" -o -name "*.css" -o -name "*.svg" -o -name "*.json" \) \
    -exec gzip -9 -k {} \;

# --- Étape 2 : Production ---
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copie des fichiers compilés
COPY --from=build /app/build/ .

# Configuration Nginx (template : les ${REACT_APP_*} sont substitués au démarrage par envsubst)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf.template

# Script d'entrée
COPY --link --chmod=755 docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint

# On s'assure que l'utilisateur nginx a les droits sur le dossier web
# (Nécessaire si on veut passer en mode non-root plus tard)
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

EXPOSE 80

# On peut aussi envisager de passer en USER nginx ici,
# mais cela demande d'ajuster le port (>1024) et les permissions des dossiers de logs/cache de nginx.

ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]