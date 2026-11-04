# Simulador Habitacional MCMV · Beta Negócios

Site mobile-first que capta o lead, mostra a simulação de financiamento (tabela de 420 meses
sem redutor da Beta Negócios, abril/2026) e leva a pessoa ao especialista no WhatsApp.
Plano completo: `plano-acao-simulador-mcmv.md` (v1.0, 04/11/2026).

Homologação: https://simulador.devlira.com.br (painel em `/admin/`, login `admin` / `admin123`;
trocar a senha antes de produção em `servidor/api/_lib/config.local.php`).

## Pastas

- `web/` Next.js 16 (App Router) + Tailwind 4, exportado como site estático (`web/out`). Home, formulário,
  resultado, privacidade e painel `/admin/`.
- `servidor/` API em PHP 8 para a Hostinger compartilhada: sem Node no servidor e sem banco.
  `.htaccess` (HTTPS, rotas `/api/*`), `api/*.php` (endpoints) e `api/_lib/` (cálculo, CSV, base; bloqueada na web).
- `testes/testes.php` cálculo e importação do CSV contra as rendas de borda do plano.
- `scripts/publicar-homolog.sh` build + envio por rsync para a homologação.

## Onde ficam os dados

Sem banco de dados. Tudo em arquivos na pasta de dados, que no servidor fica fora do site
(`~/domains/devlira.com.br/simulador-dados`, apontada por `api/_lib/config.local.php`, criado pelo script):

- `leads.json` lista de leads (gravação com trava de arquivo, um pedido por vez).
- `tabela.csv` tabela ativa; na primeira vez é copiada de `api/_lib/tabela-exemplo.csv`.
- `tabelas-anteriores/` cópia de cada tabela substituída (nada é apagado).
- `sessoes/` e `limite/` sessão do painel e rate limit por IP.

O envio (`rsync --delete`) nunca toca a pasta de dados nem o `config.local.php`.

## Rodar

```bash
cd web && cp .env.example .env.local && npm i
npm run api                                # PHP local em http://localhost:8000 (dados em servidor/_dados)
npm run dev                                # http://localhost:3000, repassa /api ao PHP
php ../testes/testes.php                   # testes
../scripts/publicar-homolog.sh             # homologação
```

## Endpoints

| Método | Rota | O que faz |
| --- | --- | --- |
| POST | `/api/simular` `{ renda, tem_dependente }` | simulação |
| POST | `/api/leads` | grava o lead e devolve a simulação |
| GET/POST/DELETE | `/api/admin/login` | sessão do painel (ver, entrar, sair) |
| GET | `/api/admin/leads?de=&ate=&faixa=&status=` | lista; `&formato=csv` exporta |
| POST | `/api/admin/leads` `{ id, status }` | muda o status |
| GET/POST | `/api/admin/tabela` | tabela ativa; POST com o CSV troca a tabela |

Rate limit: 20 pedidos por minuto por IP na API pública; 5 tentativas de login por minuto.

## Decisões tomadas no código

- O snapshot do lead é calculado no servidor, nunca aceito do navegador.
- Renda sem linha na tabela (tabela incompleta): o lead é gravado e vai ao especialista.
- Importar a tabela guarda a anterior em `tabelas-anteriores/`. O CSV é recusado
  inteiro se tiver renda repetida, fora de 1.000 a 13.000, campo vazio ou financiamento acima
  de 80% do imóvel. A regra dos 80% é conferida na importação; o cálculo nunca altera número da tabela.
- A primeira versão (NestJS + PostgreSQL) está no histórico do git, commit `d6be17e`.

## Falta para o MVP

1. **Tabela real.** `servidor/api/_lib/tabela-exemplo.csv` tem só as 9 linhas de exemplo do plano e sem
   subsídio sem dependente. Precisa do PDF `Tabela_420_Meses_Sem_Redutor_V7.pdf` para gerar o CSV
   completo (~120 linhas) e conferir os pontos da seção 7.4 (linha de R$ 11.200 quebrada,
   parcela fixa de R$ 2.000,05, financiamento travado em R$ 320.000).
2. Notificação de lead ao Junior (hoje só no painel).
3. Identidade visual da Giovanna (cores atuais são provisórias, sem nada da Caixa).
4. Domínio próprio do Junior e produção (hoje só homologação).

## Pendências do Junior (seção 14)

- Ajuste por idade (a tabela vale para 35 anos).
- Valor liberado = financiamento + subsídio (assumido) ou só financiamento.
- Parcela fixa de R$ 2.000,05 entre R$ 6.800 e R$ 8.600 está correta?
- É correspondente Caixa Aqui? Marca e domínio do site.
- Número de WhatsApp que recebe os leads (`NEXT_PUBLIC_WHATSAPP_NUMERO`; sem ele o botão fica desligado).
- Mostrar enquadramento HIS no resultado?
- Arredondamento da renda: para baixo (assumido) ou mais próximo.
- Prazo de guarda, canal de exclusão e CNPJ para a política de privacidade (rascunho em `web/src/app/privacidade`).
- Quem paga hospedagem, domínio e anúncios.
- IDs do Pixel do Meta e do GA4.
