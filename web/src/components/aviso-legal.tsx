// Texto fixo da seção 2 do plano: vai no rodapé e na tela de resultado.
export const AVISO =
  "Simulação ilustrativa feita pela Beta Negócios. Não somos a Caixa. Valores sujeitos à análise de crédito e às regras vigentes do programa.";

export function AvisoLegal({ className = "" }: { className?: string }) {
  return <p className={`text-xs leading-relaxed text-slate-500 ${className}`}>{AVISO}</p>;
}
