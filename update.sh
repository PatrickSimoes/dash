#!/bin/bash

# Nome do processo no PM2
PM2_PROCESS_NAME="sonar-dash"

# Pega o caminho absoluto da pasta onde o script está
BASE_DIR=$(pwd)

echo "=== 🚀 Iniciando Atualização em $BASE_DIR ==="

# 1. Garantir que o .env existe (opcional, mas evita erros de build)
if [ ! -f ".env" ]; then
    echo "⚠️ Aviso: Arquivo .env não encontrado!"
fi

# 2. Pull do código
echo "1. Realizando git pull..."
git pull || { echo "❌ Erro no git pull"; exit 1; }

# 3. Dependências
echo "2. Instalando dependências..."
npm install || { echo "❌ Erro no npm install"; exit 1; }

# 4. Build do Next.js
echo "3. Gerando build de produção..."
# Aqui ele lê o basePath: '/sonar/dash' do seu next.config.ts/js
npm run build || { echo "❌ Erro no build do Next.js"; exit 1; }

# 5. Gerenciando processo no PM2
echo "4. Atualizando processo no PM2..."

if pm2 describe $PM2_PROCESS_NAME > /dev/null 2>&1; then
    echo "🔄 Reiniciando processo existente..."
    pm2 restart $PM2_PROCESS_NAME
else
    echo "🆕 Iniciando novo processo pela primeira vez..."
    # Roda o Next.js na porta 3000 (padrão)
    pm2 start npm --name "$PM2_PROCESS_NAME" -- start || { echo "❌ Erro ao iniciar no PM2"; exit 1; }
fi

# 6. Salvar para persistência após reboot do sistema
pm2 save

echo "=== ✅ Atualização concluída com sucesso! ==="