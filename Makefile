SHELL := /bin/bash

# Nome do container do app (ajuste se precisar)
APP_CONTAINER := ux-software-api

# Nome da migration (passado pelo usuário)
MIGRATION_NAME ?=

# Valida se MIGRATION_NAME foi informado
check-migration-name:
	@if [ -z "$(MIGRATION_NAME)" ]; then \
		echo "❌ Erro: você deve passar o nome da migration"; \
		echo "👉 Exemplo: make migration MIGRATION_NAME=CreateUsersTable"; \
		exit 1; \
	fi

# ===========================
# Comandos de setup
# ===========================

# Instalar dependências
install:
	@echo "📦 Instalando dependências..."
	npm install


# ===========================
# Comandos de migrations
# ===========================

# Gera uma nova migration
migration-generate: check-migration-name
	@echo "📦 Gerando migration '$(MIGRATION_NAME)'..."
	npm run migration:generate --name=$(MIGRATION_NAME)

# Roda todas migrations
migrate:
	@echo "🚀 Rodando migrations..."
	npm run migration:run

# Reverte a última migration
migrate-revert:
	@echo "↩️ Revertendo última migration..."
	npm run migration:revert

# Reverte a última migration
migration-show:
	@echo "👀 Visualizando migrações..."
	npm run migration:show

# ===========================
# App local
# ===========================

# Subir o servidor em dev
start:
	@echo "🔥 Iniciando app em modo dev..."
	npm run start:dev

# Build da aplicação
build:
	@echo "🏗️  Buildando aplicação..."
	npm run build

# Testes
run-test:
	@echo "🧪 Rodando testes..."
	npm run test

# ===========================
# Docker
# ===========================

# Subir containers
docker-up:
	@echo "🐳 Subindo containers..."
	docker compose up -d

# Subir containers e fazer o build
docker-up-build:
	@echo "🐳 Subindo containers..."
	docker compose up --build -d

# Derrubar containers
docker-down:
	@echo "🛑 Derrubando containers..."
	docker compose down

# Logs do container da aplicação
docker-logs:
	docker logs -f $(APP_CONTAINER)
