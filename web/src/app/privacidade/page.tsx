import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de privacidade | Beta Negócios" };

// RASCUNHO: texto legal aguarda aprovação do Junior (seção 12 do plano).
// Os campos entre colchetes precisam do dado real antes de ir ao ar.
export default function Privacidade() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-5 py-10 text-slate-700">
      <h1 className="text-2xl font-bold text-marca">Política de privacidade</h1>
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Rascunho em revisão.</p>

      <h2 className="text-lg font-semibold">Quais dados coletamos</h2>
      <p>Nome, celular, renda bruta mensal, se tem dependentes e, se você informar, o bairro.</p>

      <h2 className="text-lg font-semibold">Para que usamos</h2>
      <p>
        Para calcular a simulação e para que um especialista da Beta Negócios entre em contato sobre
        financiamento habitacional. Não vendemos nem repassamos seus dados para outras empresas.
      </p>

      <h2 className="text-lg font-semibold">Por quanto tempo guardamos</h2>
      <p>[prazo de guarda a definir]</p>

      <h2 className="text-lg font-semibold">Como pedir a exclusão</h2>
      <p>[canal de exclusão a definir: e-mail ou WhatsApp da Beta Negócios]</p>

      <h2 className="text-lg font-semibold">Responsável</h2>
      <p>[razão social e CNPJ da Beta Negócios]</p>
    </article>
  );
}
