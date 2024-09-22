# Etapa 1: Use uma imagem base do Node.js
FROM node:20-alpine

# Etapa 2: Defina o diretório de trabalho dentro do container
WORKDIR /app

# Etapa 3: Copie o arquivo package.json e package-lock.json para o container
COPY package*.json ./

# Etapa 4: Instale as dependências da aplicação
RUN npm install

# Etapa 5: Copie o restante do código da aplicação para o container
COPY . .

# Etapa 6: Compile os arquivos TypeScript
RUN npm run build

# Etapa 7: Copie o script de espera para o container
COPY wait-for-postgres.sh ./

# Etapa 8: Dê permissão de execução ao script
RUN chmod +x wait-for-postgres.sh

# Etapa 9: Exponha a porta que será utilizada pela aplicação
EXPOSE 3333

# Etapa 10: Configure as variáveis de ambiente para o PostgreSQL
ENV DATABASE_URL=postgresql://docker:docker@pg:5432/ttasks

# Etapa 11: Inicie a aplicação usando o script de espera
CMD ["sh", "-c", "./wait-for-postgres.sh && node dist/src/server.js"]
