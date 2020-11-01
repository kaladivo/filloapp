source .env
export DB_PASSWORD DB_USER DB_HOST DB_PORT DB_DATABASE

DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_DATABASE" \
yarn node-pg-migrate up --migrations-schema migrations --create-migrations-schema
