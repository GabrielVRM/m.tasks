#!/bin/sh

# Aguarda o PostgreSQL estar disponível
until nc -z pg 5432; do
  echo "Aguardando PostgreSQL..."
  sleep 2
done

# Executa migrações e seeds
npm run migrations && npm run seed
