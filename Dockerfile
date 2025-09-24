# Etapa 1: build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala dependências (sem dev)
RUN npm install --legacy-peer-deps

# Copia todo o código do projeto
COPY . .

# Compila o código TypeScript
RUN npm run build

# Etapa 2: runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Copia apenas os pacotes necessários
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm install --omit=dev --legacy-peer-deps

# Copia os arquivos compilados da etapa anterior
COPY --from=builder /app/dist ./dist

# Expoe a porta que a API usa
EXPOSE ${API_PORT}

# Comando de inicialização
CMD ["node", "dist/main.js"]
