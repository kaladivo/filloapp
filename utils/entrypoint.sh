#!/bin/sh

# migrate db
DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_DATABASE" \
  yarn node-pg-migrate $1 --migrations-schema migrations --create-migrations-schema --tsconfig ./tsconfig.server.json -j ts

exec "$@"
