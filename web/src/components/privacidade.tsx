"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// RASCUNHO: texto legal aguarda aprovação do Junior (seção 12 do plano).
// Os campos entre colchetes precisam do dado real antes de ir ao ar.
export function TextoPrivacidade() {
  return (
    <div className="space-y-4 text-slate-700">
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Rascunho em revisão.</p>

      <h3 className="text-lg font-semibold">Quais dados coletamos</h3>
      <p>Nome, celular, renda bruta mensal, se tem dependentes e, se você informar, o bairro.</p>

      <h3 className="text-lg font-semibold">Para que usamos</h3>
      <p>
        Para calcular a simulação e para que um especialista da Beta Negócios entre em contato sobre
        financiamento habitacional. Não vendemos nem repassamos seus dados para outras empresas.
      </p>

      <h3 className="text-lg font-semibold">Por quanto tempo guardamos</h3>
      <p>[prazo de guarda a definir]</p>

      <h3 className="text-lg font-semibold">Como pedir a exclusão</h3>
      <p>[canal de exclusão a definir: e-mail ou WhatsApp da Beta Negócios]</p>

      <h3 className="text-lg font-semibold">Responsável</h3>
      <p>[razão social e CNPJ da Beta Negócios]</p>
    </div>
  );
}

// Abre a política num modal na mesma tela (pedido do Lira em 04/11): o usuário não sai do simulador.
// O modal vai direto no body: dentro do <label> do consentimento, clicar no texto marcaria a caixa.
export function LinkPrivacidade({ children = "Política de Privacidade", className = "" }: { children?: ReactNode; className?: string }) {
  const [aberto, setAberto] = useState(false);
  const fechar = () => setAberto(false);

  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className={`underline ${className}`}>
        {children}
      </button>
      {aberto &&
        createPortal(
          <dialog
            ref={(d) => {
              if (d && !d.open) d.showModal();
            }}
            onClose={fechar}
            onClick={(e) => e.target === e.currentTarget && fechar()}
            aria-labelledby="titulo-privacidade"
            className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl p-0 shadow-2xl"
          >
            <div className="flex max-h-[85dvh] flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 id="titulo-privacidade" className="text-xl font-bold text-titulo">
                  Política de Privacidade
                </h2>
                <button
                  type="button"
                  onClick={fechar}
                  aria-label="Fechar"
                  className="grid size-9 place-items-center rounded-full text-2xl leading-none text-slate-500 hover:bg-slate-100"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto px-5 py-5">
                <TextoPrivacidade />
              </div>
              <div className="border-t border-slate-200 px-5 py-4">
                <button
                  type="button"
                  onClick={fechar}
                  className="botao-agua w-full rounded-full px-6 py-3 font-bold tracking-wide text-white uppercase"
                >
                  Entendi
                </button>
              </div>
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}
