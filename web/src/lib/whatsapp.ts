import { reais } from "./formato";

// Pendência do Junior: número que recebe os leads. Sem ele o botão fica desligado.
const NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO?.replace(/\D/g, "") ?? "";

export const whatsappConfigurado = NUMERO.length >= 12;

export function linkWhatsapp(nome: string, renda: number, valorLiberado?: number): string | null {
  if (!whatsappConfigurado) return null;
  const linhas = [
    "Olá! Fiz a simulação no site e quero falar com um especialista.",
    `Nome: ${nome} · Renda: ${reais(renda)}` +
      (valorLiberado !== undefined ? ` · Valor simulado: ${reais(valorLiberado)}` : ""),
  ];
  return `https://wa.me/${NUMERO}?text=${encodeURIComponent(linhas.join("\n"))}`;
}

// Link curto da assistente Ca, sem dados da simulação.
export function linkWhatsappContato(): string | null {
  if (!whatsappConfigurado) return null;
  return `https://wa.me/${NUMERO}?text=${encodeURIComponent("Olá! Quero tirar uma dúvida sobre o financiamento da minha casa.")}`;
}
