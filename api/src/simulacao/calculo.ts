// Regras da seção 6 do plano de ação. A tabela é consulta, não fórmula:
// nenhum valor da linha é recalculado aqui.

export const RENDA_MINIMA = 1000;
export const RENDA_MAXIMA = 13000;
export const PRAZO_MESES = 420;

export interface LinhaTabela {
  renda: number;
  subsidioComDependente: number;
  financiamento: number;
  subsidioSemDependente: number | null;
  primeiraPrestacao: number;
  valorAvaliacao: number;
  jurosNominal: number;
  jurosEfetivo: number;
  faixa: number;
}

export interface ResultadoSimulacao {
  foraDaFaixa: false;
  rendaInformada: number;
  rendaTabela: number;
  faixa: number;
  valorImovel: number;
  valorFinanciado: number;
  subsidio: number;
  // Pendência do Junior: liberação = financiamento + subsídio ou só financiamento.
  valorLiberado: number;
  entradaEstimada: number;
  primeiraParcela: number;
  prazoMeses: number;
  jurosNominal: number;
  jurosEfetivo: number;
}

export type RespostaSimulacao = ResultadoSimulacao | { foraDaFaixa: true; rendaInformada: number };

export function foraDaFaixa(renda: number): boolean {
  return renda < RENDA_MINIMA || renda > RENDA_MAXIMA;
}

// Arredonda para baixo até o múltiplo de 100 (2870 -> 2800).
// Pendência do Junior: "para baixo" (assumido) ou "mais próximo".
export function rendaDaTabela(renda: number): number {
  return Math.floor(renda / 100) * 100;
}

// Soma em centavos para não acumular erro de ponto flutuante.
function centavos(valor: number): number {
  return Math.round(valor * 100);
}

export function montarResultado(
  rendaInformada: number,
  linha: LinhaTabela,
  temDependente: boolean,
): ResultadoSimulacao {
  const subsidio = temDependente
    ? linha.subsidioComDependente
    : (linha.subsidioSemDependente ?? 0);

  const liberado = (centavos(linha.financiamento) + centavos(subsidio)) / 100;
  const entrada =
    Math.max(0, centavos(linha.valorAvaliacao) - centavos(linha.financiamento) - centavos(subsidio)) / 100;

  return {
    foraDaFaixa: false,
    rendaInformada,
    rendaTabela: linha.renda,
    faixa: linha.faixa,
    valorImovel: linha.valorAvaliacao,
    valorFinanciado: linha.financiamento,
    subsidio,
    valorLiberado: liberado,
    entradaEstimada: entrada,
    primeiraParcela: linha.primeiraPrestacao,
    prazoMeses: PRAZO_MESES,
    jurosNominal: linha.jurosNominal,
    jurosEfetivo: linha.jurosEfetivo,
  };
}
