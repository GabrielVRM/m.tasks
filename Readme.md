# M-Tasks


## Ambiente de Desenvolvimento
-> node version:20.17.0 lts

-> npm init - y 
  - cria o arquivo package.json, onde fica o controle de nossas libs e scripts

-> npm i typescript -D   
  - baixa o type como uma dependencia de desenvolvimento

-> npx tsc --init
  - cria um arquivo de configuração do Ts 

-> npm i @types/node tsx -D   
  - realiza a integração do type com o node, para usarmos bibliotecas globais do node, indicando que é um projeto node!
  
  - e o tsx é para executar o projeto sem precisar converte para JS, pois o node não entende o TS 


## Banco de Dados 🏦

- docker - postgreSql

- drizzle-orm -> requisições ao banco de dados ( knex, sequelize)