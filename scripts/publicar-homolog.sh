#!/usr/bin/env bash
# Publica o simulador na homologação (Hostinger compartilhada): https://simulador.devlira.com.br
# Gera o site estático (web/out), junta com o PHP (servidor/) e envia por rsync.
# Leads, sessões e tabela ativa ficam em ~/domains/devlira.com.br/simulador-dados (fora do site)
# e nunca são apagados nem sobrescritos pelo envio.
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
SSH_CHAVE="${SSH_CHAVE:-$HOME/.ssh/id_ed25519_hostinger_deploy}"
SSH_DESTINO="${SSH_DESTINO:-u902517809@147.93.37.237}"
SSH_PORTA="${SSH_PORTA:-65002}"
PASTA_SITE="${PASTA_SITE:-domains/devlira.com.br/public_html/simulador}"
PASTA_DADOS="${PASTA_DADOS:-domains/devlira.com.br/simulador-dados}"
URL="${URL:-https://simulador.devlira.com.br}"

ssh_() { ssh -i "$SSH_CHAVE" -p "$SSH_PORTA" -o BatchMode=yes "$SSH_DESTINO" "$@"; }

echo "1/4 testes"
PHP="${PHP:-$(command -v php || echo "$HOME/.local/php-static/php")}"
"$PHP" "$RAIZ/testes/testes.php" 2>/dev/null

echo "2/4 build do site"
(cd "$RAIZ/web" && npm ci --silent && npx next build >/dev/null)
PACOTE="$(mktemp -d)"
trap 'rm -r "$PACOTE"' EXIT
cp -a "$RAIZ/web/out/." "$PACOTE/"
cp -a "$RAIZ/servidor/." "$PACOTE/"
rm -rf "$PACOTE/_dados" "$PACOTE/api/_lib/config.local.php"

echo "3/4 envio"
# Pasta de dados fora do site e config que aponta para ela (criados só na primeira vez).
ssh_ "mkdir -p ~/$PASTA_DADOS ~/$PASTA_SITE/api/_lib && chmod 750 ~/$PASTA_DADOS
  if [ -f ~/$PASTA_SITE/default.php ]; then mkdir -p ~/$PASTA_DADOS/anteriores && mv ~/$PASTA_SITE/default.php ~/$PASTA_DADOS/anteriores/default.php; fi
  [ -f ~/$PASTA_SITE/api/_lib/config.local.php ] || printf \"<?php\\nreturn ['dados' => '%s'];\\n\" \"\$HOME/$PASTA_DADOS\" > ~/$PASTA_SITE/api/_lib/config.local.php"
rsync -rlz --delete --exclude 'api/_lib/config.local.php' --exclude '_dados/' \
  -e "ssh -i $SSH_CHAVE -p $SSH_PORTA -o BatchMode=yes" "$PACOTE/" "$SSH_DESTINO:$PASTA_SITE/"

echo "4/4 conferência"
curl -fsS -o /dev/null -w "home %{http_code}\n" "$URL/"
curl -fsS -X POST -H 'Content-Type: application/json' -d '{"renda":3200,"tem_dependente":true}' "$URL/api/simular" | head -c 300
echo
