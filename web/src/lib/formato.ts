const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const reais = (valor: number) => brl.format(valor);

export const porcentagem = (valor: number) =>
  `${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% a.a.`;

// (11) 98765-4321
export function mascaraCelular(texto: string): string {
  const d = texto.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const celularValido = (texto: string) => /^[1-9]{2}9\d{8}$/.test(texto.replace(/\D/g, ""));

// Digitação da renda como no caixa eletrônico: os dígitos entram pelos centavos.
export function mascaraMoeda(texto: string): string {
  const d = texto.replace(/\D/g, "").replace(/^0+/, "").slice(0, 9);
  if (!d) return "";
  return reais(Number(d) / 100);
}

export const moedaParaNumero = (texto: string) => Number(texto.replace(/\D/g, "")) / 100;
