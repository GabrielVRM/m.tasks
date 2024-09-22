# Etapa 1: Use uma imagem base do Node.js
FROM node:20-alpine

# Etapa 2: Defina o diretório de trabalho dentro do container
WORKDIR /app

# Etapa 3: Copie o arquivo package.json e package-lock.json para o container
COPY package*.json ./

# Etapa 4: Instale as dependências da aplicação
RUN npm install

# Etapa 5: Copie todo o restante do código para o container
COPY . .

# Etapa 6: Compile os arquivos TypeScript
RUN npm run build

# Etapa 7: Exponha a porta que será utilizada pela aplicação
EXPOSE 3333

# Etapa 8: Configure as variáveis de ambiente
ENV DATABASE_URL=postgresql://docker:docker@pg:3333/ttasks
ENV PORT=3333

# Etapa 9: Inicie as migrações e, em seguida, a aplicação
CMD ["sh", "-c", "npm run seed && node dist/src/http/server.js"]
