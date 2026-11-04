# Simulador Habitacional MCMV · Beta Negócios

Site mobile-first que capta o lead, mostra a simulação de financiamento (tabela de 420 meses
sem redutor da Beta Negócios, abril/2026) e leva a pessoa ao especialista no WhatsApp.
Plano completo: `plano-acao-simulador-mcmv.md` (v1.0, 04/11/2026).

## Pastas

- `api/` NestJS + PostgreSQL (TypeORM). Cálculo, leads, importação da tabela.
- `web/` Next.js 16 (App Router) + Tailwind 4. Home, formulário, resultado, privacidade.
- `docker-compose.yml` Postgres de desenvolvimento, já com `api/db/schema.sql`.

## Rodar

```bash
docker compose up -d                      # Postgres (ou um Postgres local com api/db/schema.sql)
cd api && cp .env.example .env && npm i && npm run build
npm run importar:tabela -- dados/tabela-exemplo.csv
npm run start:dev                         # http://localhost:3001/api
cd ../web && cp .env.example .env.local && npm i && npm run dev   # http://localhost:3000
```

Testes: `cd api && npm test && npm run test:e2e` (não precisam de banco).

## Endpoints

| Método | Rota | Situação |
| --- | --- | --- |
| POST | `/api/simular` `{ renda, tem_dependente }` | pronto |
| POST | `/api/leads` (grava o lead e devolve a simulação) | pronto |
| GET | `/api/admin/leads`, `/api/admin/leads/export` | a fazer |
| PATCH | `/api/admin/leads/:id` | a fazer |
| POST | `/api/admin/tabela/import` | a fazer (o serviço `FaixasService.importar` já existe) |

Rate limit: 20 pedidos por minuto por IP em toda a API.

## Decisões tomadas no código

- O snapshot do lead é calculado no servidor, nunca aceito do navegador.
- Renda sem linha na tabela (tabela incompleta): o lead é gravado e vai ao especialista.
- Importar a tabela desativa a anterior (não apaga) numa transação só. O CSV é recusado
  inteiro se tiver renda repetida, fora de 1.000 a 13.000, campo vazio ou financiamento acima
  de 80% do imóvel. A regra dos 80% é conferida na importação; o cálculo nunca altera número da tabela.

## Falta para o MVP

1. **Tabela real.** `api/dados/tabela-exemplo.csv` tem só as 9 linhas de exemplo do plano e sem
   subsídio sem dependente. Precisa do PDF `Tabela_420_Meses_Sem_Redutor_V7.pdf` para gerar o CSV
   completo (~120 linhas) e conferir os pontos da seção 7.4 (linha de R$ 11.200 quebrada,
   parcela fixa de R$ 2.000,05, financiamento travado em R$ 320.000).
2. Painel admin (login, lista, filtros, CSV, status, importação).
3. Notificação de lead ao Junior (hoje só no log do servidor).
4. Identidade visual da Giovanna (cores atuais são provisórias, sem nada da Caixa).
5. Deploy na VPS + domínio + HTTPS.

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
