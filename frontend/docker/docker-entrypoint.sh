#!/bin/sh

# Générer un fichier env.{timestamp}.js avec toutes les variables REACT_APP_*
TIMESTAMP=$(date +%s)
ENV_FILE="/usr/share/nginx/html/env.${TIMESTAMP}.js"

{
  printf 'window.env = {\n'
  env | grep '^REACT_APP_' | while IFS='=' read -r key value; do
    escaped=$(printf '%s' "$value" | sed 's/\\/\\\\/g; s/"/\\"/g')
    printf '  "%s": "%s",\n' "$key" "$escaped"
  done
  printf '};\n'
} > "$ENV_FILE"

# Mettre à jour index.html pour référencer le fichier timestampé
sed -i "s|/env\.js|/env.${TIMESTAMP}.js|g" /usr/share/nginx/html/index.html

# Générer la config Nginx avec les URLs réelles dans la Content-Security-Policy
envsubst '${REACT_APP_API} ${REACT_APP_OAUTH_PROVIDER}' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Exécuter Nginx
exec nginx -g "daemon off;"