# Plano de Ação — Simulador Habitacional MCMV (Zona Leste / Beta Negócios)

Documento único e autossuficiente para desenvolvimento. Não depende de nenhum outro
arquivo. Projeto do Junior (cunhado do José), executado pela equipe Alphakora
(Jonathan, Paulo, Giovanna).

Data: 04/11/2026 · Versão do plano: 1.0

---

## 1. Objetivo

Site web mobile-first que capta o lead, mostra uma simulação de financiamento
habitacional (programa Minha Casa Minha Vida) com base na renda, e encaminha a pessoa
para um especialista no WhatsApp.

- **Meta de negócio:** gerar leads qualificados (nome, celular, renda, faixa) para o time comercial do Junior.
- **Base de cálculo:** "Tabela de Financiamento 420 meses — Sem Redutor" (Beta Negócios, abril/2026).
- **Resultado esperado por lead:** valor do imóvel (teto), valor financiado, subsídio, entrada estimada, 1ª parcela, prazo (420 meses), taxa de juros.

---

## 2. Restrições inegociáveis (ler antes de codar)

1. **Marca: Beta Negócios, NÃO Caixa.** O site NÃO pode usar logo, cores, nome ou layout da Caixa. Um site com a identidade da Caixa pedindo dados é tratado como phishing/uso indevido de marca: risco jurídico para o Junior, derrubada do domínio e bloqueio da conta de anúncios no Meta. Pode **citar o programa Minha Casa Minha Vida em texto**, de forma factual. Só usar selos oficiais se o Junior for correspondente Caixa Aqui autorizado e com permissão de uso de marca.
2. **Sem código por SMS no MVP.** O celular é captado no formulário e confirmado depois pelo especialista no WhatsApp. (Economiza custo de SMS e reduz atrito.)
3. **LGPD obrigatória.** Consentimento explícito antes do envio, política de privacidade, finalidade declarada (contato comercial sobre financiamento), prazo de guarda e canal de exclusão.
4. **Aviso fixo** no rodapé e na tela de resultado: *"Simulação ilustrativa feita pela Beta Negócios. Não somos a Caixa. Valores sujeitos à análise de crédito e às regras vigentes do programa."*

---

## 3. Arquitetura e stack

Mesma linha do time (padrão Alphakora):

- **Frontend:** Next.js (App Router), mobile-first, TailwindCSS.
- **Backend:** NestJS + PostgreSQL.
- **Hospedagem:** VPS Hostinger própria. Domínio próprio do Junior.
- **Infra:** HTTPS obrigatório, rate limit no endpoint de simulação e no de lead.
- **Analytics:** Pixel do Meta + Google Analytics 4.

O cálculo NÃO é fórmula fechada: é uma **consulta à tabela** por renda. A tabela fica no
banco e é editável por painel admin (as regras do programa mudam).

---

## 4. Modelo de dados

### 4.1 Tabela `faixas_financiamento` (a tabela de 420 meses)

Uma linha por valor de renda (de R$ 100 em R$ 100).

| Coluna | Tipo | Observação |
| --- | --- | --- |
| id | serial PK | |
| renda | numeric(10,2) | renda bruta mensal (chave de busca) |
| subsidio_com_dependente | numeric(10,2) | pode ser 0 |
| financiamento | numeric(12,2) | valor financiado |
| subsidio_sem_dependente | numeric(10,2) | pode ser 0 ou nulo nas faixas altas |
| primeira_prestacao | numeric(10,2) | valor da 1ª parcela |
| valor_avaliacao | numeric(12,2) | teto do imóvel |
| juros_nominal | numeric(5,2) | % a.a. |
| juros_efetivo | numeric(5,2) | % a.a. |
| faixa | int | 1 a 4 |
| ativo | boolean | para desativar linhas sem apagar |

### 4.2 Tabela `leads`

| Coluna | Tipo | Observação |
| --- | --- | --- |
| id | uuid PK | |
| nome | text | |
| celular | text | com máscara removida |
| renda | numeric(10,2) | informada |
| tem_dependente | boolean | |
| bairro | text | opcional |
| faixa | int | calculada |
| valor_financiado | numeric(12,2) | snapshot do resultado |
| subsidio | numeric(10,2) | snapshot |
| valor_imovel | numeric(12,2) | snapshot |
| primeira_parcela | numeric(10,2) | snapshot |
| status | text | novo / contatado / em_negociacao / fechado / perdido |
| consentimento_lgpd | boolean | |
| origem | text | utm_source / campanha |
| criado_em | timestamptz | |

CPF fica **fora do MVP** (ver pendências). A tabela só precisa de renda + dependente para simular.

---

## 5. Importação da tabela (NÃO digitar à mão)

A fonte da verdade é o PDF `Tabela_420_Meses_Sem_Redutor_V7.pdf` (Beta Negócios).
São ~120 linhas (renda de R$ 1.000 a R$ 13.000). **Digitar à mão gera erro.**

Processo:

1. Converter o PDF em CSV (ex.: `tabula`, `camelot` ou `pdfplumber` em Python), uma linha por renda.
2. Conferir o CSV contra o PDF, em especial os pontos de atenção da seção 7.
3. Importar o CSV para `faixas_financiamento` (seed + endpoint de reimportação no admin).
4. O admin permite subir um CSV novo quando a tabela mudar.

---

## 6. Regras de cálculo (algoritmo)

Entrada: `renda` (número), `tem_dependente` (bool).

```
1. Se renda < 1000 ou renda > 13000:
     retornar { fora_da_faixa: true }   // pula resultado, vai direto ao especialista

2. renda_tabela = arredonda renda PARA BAIXO até o múltiplo de 100 mais próximo
     ex.: 2870 -> 2800 ; 5190 -> 5100

3. linha = SELECT * FROM faixas_financiamento WHERE renda = renda_tabela AND ativo = true

4. subsidio = tem_dependente ? linha.subsidio_com_dependente : linha.subsidio_sem_dependente
     (nas faixas 3 e 4 o subsídio é 0)

5. valor_financiado = linha.financiamento
   valor_imovel     = linha.valor_avaliacao        // teto
   primeira_parcela = linha.primeira_prestacao
   prazo            = 420 meses
   juros            = linha.juros_nominal / linha.juros_efetivo

6. valor_liberado = valor_financiado + subsidio      // CONFIRMAR definição com o Junior
   entrada_estimada = max(0, valor_imovel - valor_financiado - subsidio)

7. Regra de teto: o financiamento nunca passa de 80% do imóvel (cota máxima da tabela).

8. Retornar o pacote para a tela de resultado.
```

Regra de arredondamento é decisão de produto — confirmar com o Junior se é "para baixo"
(assumido aqui) ou "mais próximo".

---

## 7. Tabela de faixas — resumo e pontos de atenção

### 7.1 Resumo por faixa (do PDF)

| Faixa | Renda | Teto do imóvel | Juros nominal / efetivo | Subsídio |
| --- | --- | --- | --- | --- |
| 1 | R$ 1.000 a R$ 3.200 | R$ 275.000 | 4,75%–5,25% / 4,85%–5,37% | Com dep.: até R$ 55.000; sem: até R$ 16.500 |
| 2 | R$ 3.300 a R$ 5.000 | R$ 275.000 (R$ 350.000 a partir de R$ 4.800) | 5,50%–7,00% / 5,64%–7,22% | Só com dependente, até R$ 4.100 de renda |
| 3 | R$ 5.100 a R$ 9.600 | R$ 400.000 | 8,16% / 8,47% | Sem subsídio |
| 4 | R$ 9.700 a R$ 13.000 | R$ 600.000 | 10,00% / 10,47% | Sem subsídio |

### 7.2 Enquadramento HIS (página 2 do PDF)

- HIS 1: renda até R$ 4.863,00 (3 salários mínimos)
- HIS 2: renda até R$ 9.726,00 (6 salários mínimos)
- HMP: renda até R$ 16.210,00 (10 salários mínimos)

Confirmar com o Junior se isso deve aparecer na tela de resultado.

### 7.3 Linhas de exemplo verificadas (para teste, não substituem o CSV)

| Renda | Subs. c/ dep. | Financiamento | 1ª prestação | Teto | Juros nom./ef. |
| --- | --- | --- | --- | --- | --- |
| 1.000,00 | 55.000,00 | 56.132,57 | 300,00 | 275.000 | 4,75 / 4,85 |
| 2.000,00 | 50.777,00 | 116.173,83 | 600,00 | 275.000 | 4,75 / 4,85 |
| 3.200,00 | 6.011,00 | 172.228,77 | 960,00 | 275.000 | 5,25 / 5,37 |
| 3.300,00 | 4.659,00 | 172.588,97 | 990,00 | 275.000 | 5,50 / 5,64 |
| 5.000,00 | — | 220.000,00 | 1.500,00 | 350.000 | 7,00 / 7,22 |
| 5.100,00 | — | 198.034,42 | 1.530,00 | 400.000 | 8,16 / 8,47 |
| 9.600,00 | — | 320.000,00 | 2.880,00 | 400.000 | 8,16 / 8,47 |
| 9.700,00 | — | 322.126,38 | 2.910,00 | 600.000 | 10,00 / 10,47 |
| 13.000,00 | — | 435.857,78 | 3.900,00 | 600.000 | 10,00 / 10,47 |

### 7.4 Quirks a validar na conferência do CSV

- A tabela vale para proponente de **35 anos** (idade média). Não há ajuste por idade na tabela — ver pendências.
- 1ª prestação ≈ 30% da renda, **exceto** de R$ 6.800 a R$ 8.600, onde fica fixa em **R$ 2.000,05**, voltando a 30% em R$ 8.700. Confirmar se é proposital.
- De R$ 8.100 a R$ 9.600 o financiamento trava em **R$ 320.000**.
- Na página 8/9 do PDF a linha de **R$ 11.200** aparece quebrada (o valor R$ 373.822,47 ficou na linha de cima). Conferir na importação.

---

## 8. API (endpoints)

- `POST /api/simular` → body `{ renda, tem_dependente }` → retorna o pacote da seção 6 ou `{ fora_da_faixa: true }`. Com rate limit.
- `POST /api/leads` → grava o lead (dados do formulário + snapshot do resultado + consentimento). Dispara notificação ao Junior.
- `GET /api/admin/leads` → lista com filtros (data, faixa, status). Protegido por login.
- `GET /api/admin/leads/export` → CSV.
- `POST /api/admin/tabela/import` → sobe CSV novo da tabela.
- `PATCH /api/admin/leads/:id` → muda status.

---

## 9. Telas

1. **Home** — banner (família, azul/laranja, marca Beta Negócios), headline "Simulação para a Zona Leste de São Paulo", botão grande "Simular agora". Rodapé com o aviso da seção 2.
2. **Formulário** — campos: nome, celular (máscara), renda bruta mensal (máscara moeda), tem dependente (sim/não), bairro/região (opcional). Checkbox de consentimento LGPD + link da política. Validações: idade ≥ 18 (se pedir nascimento), celular válido.
3. **Resultado** — valor do imóvel, valor liberado, subsídio, entrada estimada, prazo 420 meses, 1ª parcela, taxa de juros, aviso legal. Botões: "Falar com especialista" (WhatsApp) e "Simular novamente". Se `fora_da_faixa`, pula direto para o especialista.
4. **Admin** — login; lista de leads com filtros; exportação CSV; importação da tabela; mudança de status.

### Mensagem do WhatsApp (pré-preenchida)

> Olá! Fiz a simulação no site e quero falar com um especialista.
> Nome: {nome} · Renda: {renda} · Valor simulado: {valor_liberado}

Abrir via `https://wa.me/55XXXXXXXXXXX?text=...` com o número do Junior. **Confirmar o número.**

---

## 10. Fluxo do usuário

```
1. Home  ->  2. Formulário  ->  Renda na tabela?
                                   ├─ sim -> 3. Resultado -> 4. Especialista (WhatsApp)
                                   └─ não ----------------->  4. Especialista (WhatsApp)
```

O lead é gravado assim que o formulário é enviado (passo 2), mesmo que a pessoa não clique no WhatsApp.

---

## 11. Analytics

Eventos no Pixel do Meta e no GA4:

- `inicio_simulacao` — clique em "Simular agora"
- `simulacao_concluida` — resultado exibido
- `clique_whatsapp` — clique em "Falar com especialista"

---

## 12. Tarefas por pessoa e cronograma (MVP em 3 semanas)

| Responsável | Entregas | Semana |
| --- | --- | --- |
| **Giovanna** | Identidade visual (marca Beta Negócios), layout das 3 telas no Figma (mobile + desktop), banner para anúncio | 1 |
| **Jonathan** | Banco (leads + faixas), importação PDF→CSV, endpoint `/simular`, `/leads`, notificação de lead, painel admin | 1–2 |
| **Paulo** | Frontend das páginas a partir do Figma, máscaras e validações, integração com a API, botão WhatsApp, Pixel + GA4 | 2 |
| **Todos** | Testes com as 9 rendas de borda (seção 13), ajustes, deploy na VPS + domínio | 3 |
| **Junior** | Validar layout (fim da semana 1), validar simulações (semana 3), aprovar textos legais e marca | 1 e 3 |

---

## 13. Critérios de aceite / testes

Testar o endpoint `/simular` com as rendas de borda de cada faixa e conferir contra o PDF:

`1.000 · 3.200 · 3.300 · 5.000 · 5.100 · 9.600 · 9.700 · 13.000` e um valor fora da faixa (`800` e `14.000`).

Pronto quando:

- Para qualquer renda da tabela, o resultado bate com a linha do PDF.
- O lead chega no painel e na notificação do Junior.
- A página carrega no celular em menos de 2 s no 4G.
- Nenhum elemento visual remete à Caixa; aviso legal presente; consentimento LGPD funcionando.

---

## 14. Pendências para o Junior (resolver na semana 1)

- [ ] Regra de ajuste por idade (a tabela vale só para 35 anos).
- [ ] "Valor de liberação" = financiamento + subsídio, ou só o financiamento?
- [ ] A parcela fixa de R$ 2.000,05 entre R$ 6.800 e R$ 8.600 está correta?
- [ ] Ele é correspondente Caixa Aqui autorizado? Qual marca e domínio o site vai usar?
- [ ] Qual número de WhatsApp recebe os leads? Um especialista ou rodízio?
- [ ] Mostrar o enquadramento HIS (HIS 1 / HIS 2 / HMP) no resultado?
- [ ] Arredondamento da renda: para baixo (assumido) ou mais próximo?
- [ ] Quem paga hospedagem, domínio e anúncios?

## Fase 2 (depois do MVP)

- Ajuste por idade e composição de renda (dois proponentes).
- Integração com CRM ou WhatsApp Business API para distribuir leads.
- Páginas por bairro da Zona Leste para anúncios segmentados.
