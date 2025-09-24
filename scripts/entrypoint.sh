#!/bin/sh

# Roda migrations
npx typeorm -d ./dist/src/infra/database/datasource.js migration:run

# Inicia a API
node dist/src/main.js