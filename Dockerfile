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

# Etapa 7: Exponha a porta que será utilizada pela aplicação
EXPOSE 3333

# Etapa 9: Inicie a aplicação usando um script de espera
CMD ["sh", "-c", "npm run migrate && npm run seed && node dist/app/server.js"]
