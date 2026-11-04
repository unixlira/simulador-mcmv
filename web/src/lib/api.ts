export interface Resultado {
  foraDaFaixa: false;
  rendaInformada: number;
  rendaTabela: number;
  faixa: number;
  valorImovel: number;
  valorFinanciado: number;
  subsidio: number;
  valorLiberado: number;
  entradaEstimada: number;
  primeiraParcela: number;
  prazoMeses: number;
  jurosNominal: number;
  jurosEfetivo: number;
}

export type Simulacao = Resultado | { foraDaFaixa: true; rendaInformada: number };

export interface DadosLead {
  nome: string;
  celular: string;
  renda: number;
  tem_dependente: boolean;
  bairro?: string;
  consentimento_lgpd: boolean;
  origem?: string;
}

// O /api é repassado à API NestJS pelo next.config.ts.
export async function enviarLead(dados: DadosLead): Promise<{ lead_id: string; simulacao: Simulacao }> {
  const resposta = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (resposta.status === 429) throw new Error("Muitas tentativas. Aguarde um minuto e tente de novo.");
  if (!resposta.ok) throw new Error("Não foi possível simular agora. Tente de novo em instantes.");
  return resposta.json();
}
