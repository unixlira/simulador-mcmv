-- Esquema do simulador (seção 4 do plano). Rodado uma vez na criação do banco.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS faixas_financiamento (
  id                      serial PRIMARY KEY,
  renda                   numeric(10,2) NOT NULL,
  subsidio_com_dependente numeric(10,2) NOT NULL DEFAULT 0,
  financiamento           numeric(12,2) NOT NULL,
  subsidio_sem_dependente numeric(10,2),
  primeira_prestacao      numeric(10,2) NOT NULL,
  valor_avaliacao         numeric(12,2) NOT NULL,
  juros_nominal           numeric(5,2)  NOT NULL,
  juros_efetivo           numeric(5,2)  NOT NULL,
  faixa                   int           NOT NULL CHECK (faixa BETWEEN 1 AND 4),
  ativo                   boolean       NOT NULL DEFAULT true
);

-- Uma linha ativa por renda; versões antigas ficam desativadas.
CREATE UNIQUE INDEX IF NOT EXISTS faixas_renda_ativa ON faixas_financiamento (renda) WHERE ativo;

CREATE TABLE IF NOT EXISTS leads (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome               text          NOT NULL,
  celular            text          NOT NULL,
  renda              numeric(10,2) NOT NULL,
  tem_dependente     boolean       NOT NULL,
  bairro             text,
  faixa              int,
  valor_financiado   numeric(12,2),
  subsidio           numeric(10,2),
  valor_imovel       numeric(12,2),
  primeira_parcela   numeric(10,2),
  status             text          NOT NULL DEFAULT 'novo'
                     CHECK (status IN ('novo','contatado','em_negociacao','fechado','perdido')),
  consentimento_lgpd boolean       NOT NULL CHECK (consentimento_lgpd),
  origem             text,
  criado_em          timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_criado_em ON leads (criado_em DESC);
CREATE INDEX IF NOT EXISTS leads_status ON leads (status);
