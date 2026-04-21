ARG APP_VERSION=latest
FROM ghcr.io/esupportail/esup-oasis/frontend:${APP_VERSION}

COPY personnalisation/images/* /usr/share/caddy/images/
COPY personnalisation/pdf/* /usr/share/caddy/pdf/
COPY personnalisation/favicon*.ico /usr/share/caddy/html/