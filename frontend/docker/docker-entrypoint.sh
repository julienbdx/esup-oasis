#!/bin/sh

# Injecter les variables d'environnement dans le fichier env.js
npx --loglevel error react-inject-env set --dir /usr/share/nginx/html

# Générer la config Nginx avec les URLs réelles dans la Content-Security-Policy
envsubst '${REACT_APP_API} ${REACT_APP_OAUTH_PROVIDER}' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Exécuter Nginx
exec nginx -g "daemon off;"