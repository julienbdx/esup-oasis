#!/bin/sh

# Supprimer les anciens fichiers env.*.js...
rm -f /usr/share/nginx/html/env.*.js

# Générer dynamiquement le fichier env-config.js avec toutes les variables REACT_APP_*
TIMESTAMP=$(date +%s)
ENV_FILE="/usr/share/nginx/html/env.${TIMESTAMP}.js"

{
  echo "window.env = {"
  env | grep '^REACT_APP_' | while IFS='=' read -r key value; do
    # Échapper les guillemets et backslashes dans la valeur
    value=$(echo "$value" | sed 's/\\/\\\\/g; s/"/\\"/g')
    echo "  $key: \"$value\","
  done
  echo "};"
} > "$ENV_FILE"

# Injecter le nom du fichier dans index.html (remplace /env.js ou /env.{timestamp}.js)
sed -i "s|<script src=./env\.[0-9]*\.js.></script>|<script src='/env.${TIMESTAMP}.js'></script>|g" /usr/share/nginx/html/index.html
sed -i "s|<script src=./env\.js.></script>|<script src='/env.${TIMESTAMP}.js'></script>|g" /usr/share/nginx/html/index.html

# Générer la config Nginx avec les URLs réelles dans la Content-Security-Policy
envsubst '${REACT_APP_API} ${REACT_APP_OAUTH_PROVIDER}' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Exécuter Nginx
exec nginx -g "daemon off;"