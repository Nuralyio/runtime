#!/bin/bash
export MAIN_DOMAIN=${MAIN_DOMAIN:-localhost}
export MAIN_PROTOCOL=${MAIN_PROTOCOL:-http}
envsubst '${MAIN_DOMAIN} ${MAIN_PROTOCOL}' < /opt/keycloak/data/import/nuraly-realm-prod.json.template > /opt/keycloak/data/import/nuraly-realm-prod.json
exec /opt/keycloak/bin/kc.sh start --import-realm --proxy=edge --hostname-strict=false --cache=ispn --cache-config-file=cache-ispn.xml --db=postgres
