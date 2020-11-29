#!/bin/sh

## If there is a local env file use it to extract db info. Otherwise assume that db info is already in env vars
LOCAL_ENV_FILE=.env \
  && test -f $LOCAL_ENV_FILE \
  && source $LOCAL_ENV_FILE \
  && export DB_PASSWORD DB_USER DB_HOST DB_PORT DB_DATABASE

echo "postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_DATABASE"

DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_DATABASE" \
  yarn node-pg-migrate $1 --migrations-schema migrations --create-migrations-schema --tsconfig ./tsconfig.server.json -j ts
