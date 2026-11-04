"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AvisoLegal } from "@/components/aviso-legal";
import { LinkPrivacidade } from "@/components/privacidade";
import { ArcosFundo, Familia } from "@/components/visual";
import { evento, origemDaVisita } from "@/lib/analytics";
import { enviarLead, type Resultado, type Simulacao } from "@/lib/api";
import { celularValido, mascaraCelular, mascaraMoeda, moedaParaNumero, porcentagem, reais } from "@/lib/formato";
import { linkWhatsapp } from "@/lib/whatsapp";

interface Enviado {
  nome: string;
  simulacao: Simulacao;
}

export function Simulador() {
  const [enviado, setEnviado] = useState<Enviado | null>(null);

  if (!enviado) return <Formulario onResultado={setEnviado} />;
  if (enviado.simulacao.foraDaFaixa) return <Especialista nome={enviado.nome} renda={enviado.simulacao.rendaInformada} />;
  return <TelaResultado nome={enviado.nome} r={enviado.simulacao} onNovamente={() => setEnviado(null)} />;
}

function Formulario({ onResultado }: { onResultado: (e: Enviado) => void }) {
  const [nome, setNome] = useState("");
  const [celular, setCelular] = useState("");
  const [renda, setRenda] = useState("");
  const [dependente, setDependente] = useState<boolean | null>(null);
  const [bairro, setBairro] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (nome.trim().length < 2) return setErro("Informe seu nome.");
    if (!celularValido(celular)) return setErro("Informe um celular com DDD, por exemplo (11) 98765-4321.");
    const valorRenda = moedaParaNumero(renda);
    if (!valorRenda) return setErro("Informe sua renda bruta mensal.");
    if (dependente === null) return setErro("Diga se você tem dependentes.");
    if (!consentimento) return setErro("Para simular, aceite a política de privacidade.");

    setEnviando(true);
    try {
      const { simulacao } = await enviarLead({
        nome: nome.trim(),
        celular,
        renda: valorRenda,
        tem_dependente: dependente,
        bairro: bairro.trim() || undefined,
        consentimento_lgpd: true,
        origem: origemDaVisita(),
      });
      if (!simulacao.foraDaFaixa) evento("simulacao_concluida", { faixa: simulacao.faixa });
      onResultado({ nome: nome.trim(), simulacao });
    } catch (falha) {
      setErro((falha as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  const campo =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-marca focus:ring-2 focus:ring-marca/20";
  const rotulo = "text-sm font-bold text-titulo";

  return (
    <section className="flex flex-1 justify-center bg-gradient-to-b from-[#cfe3f7] to-[#eaf3fc] px-4 py-8 sm:py-12">
      <form
        onSubmit={enviar}
        noValidate
        className="w-full max-w-xl space-y-5 self-start rounded-2xl bg-white p-6 shadow-xl shadow-marca/10 sm:p-9"
      >
        <div>
          <p className="text-lg font-bold text-titulo">Dados Pessoais</p>
          <h1 className="mt-2 text-2xl font-extrabold text-ouro sm:text-3xl">Simulador de Financiamento</h1>
          <p className="mt-2 text-slate-600">Precisamos de algumas informações básicas sobre você.</p>
        </div>

        <label className="block">
          <span className={rotulo}>Nome *</span>
          <input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
        </label>

        <label className="block">
          <span className={rotulo}>Telefone celular *</span>
          <input
            className={campo}
            value={celular}
            onChange={(e) => setCelular(mascaraCelular(e.target.value))}
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(11) 98765-4321"
          />
        </label>

        <label className="block">
          <span className={rotulo}>Renda bruta mensal *</span>
          <input
            className={campo}
            value={renda}
            onChange={(e) => setRenda(mascaraMoeda(e.target.value))}
            inputMode="numeric"
            placeholder="R$ 0,00"
          />
        </label>

        <fieldset>
          <legend className={rotulo}>Tem dependentes? *</legend>
          <div className="mt-1 grid grid-cols-2 gap-3">
            {[
              { valor: true, texto: "Sim" },
              { valor: false, texto: "Não" },
            ].map((o) => (
              <button
                key={o.texto}
                type="button"
                aria-pressed={dependente === o.valor}
                onClick={() => setDependente(o.valor)}
                className={`rounded-lg border px-4 py-3 font-semibold ${
                  dependente === o.valor ? "border-marca bg-marca text-white" : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {o.texto}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className={rotulo}>
            Bairro ou região <span className="font-normal text-slate-400">(opcional)</span>
          </span>
          <input className={campo} value={bairro} onChange={(e) => setBairro(e.target.value)} />
        </label>

        {erro && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </p>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-start gap-3 rounded-lg border border-destaque bg-orange-50 p-3 text-xs leading-relaxed text-slate-700 shadow-[inset_4px_0_0_var(--color-destaque)]">
            <input
              type="checkbox"
              checked={consentimento}
              onChange={(e) => setConsentimento(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-destaque"
            />
            <span>
              Autorizo a Beta Negócios a usar meus dados para entrar em contato sobre financiamento
              habitacional, conforme a <LinkPrivacidade className="font-semibold text-marca" />.
            </span>
          </label>
          <button
            type="submit"
            disabled={enviando}
            className="botao-agua rounded-full px-8 py-4 text-lg font-extrabold tracking-wide text-white uppercase shadow-lg shadow-agua/30 transition hover:brightness-110 disabled:opacity-60 sm:shrink-0"
          >
            {enviando ? "Simulando..." : "Avançar"}
          </button>
        </div>
      </form>
    </section>
  );
}

function BotaoWhatsapp({ nome, renda, valor }: { nome: string; renda: number; valor?: number }) {
  const link = linkWhatsapp(nome, renda, valor);
  if (!link)
    return (
      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        WhatsApp do especialista ainda não configurado.
      </p>
    );
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => evento("clique_whatsapp")}
      className="botao-agua block w-full rounded-full px-6 py-4 text-center text-lg font-extrabold tracking-wide text-white uppercase shadow-lg shadow-agua/30 transition hover:brightness-110"
    >
      Finalizar
    </a>
  );
}

// Fundo azul das telas 1 e 3 da imagem: título à esquerda, família à direita, cartão branco por cima.
function TelaAzul({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: ReactNode }) {
  return (
    <section className="fundo-azul relative flex flex-1 overflow-hidden">
      <ArcosFundo />
      <div className="relative mx-auto w-full max-w-6xl px-5 pt-8 pb-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-14">
        <div className="relative min-h-[200px] lg:min-h-0">
          <div className="relative z-10 max-w-[62%] text-white sm:max-w-md lg:max-w-none">
            <h1 className="text-[1.45rem] leading-tight font-extrabold sm:text-3xl lg:text-4xl">{titulo}</h1>
            <p className="mt-2 text-white/90 sm:text-lg">{subtitulo}</p>
          </div>
          <Familia className="absolute -top-2 -right-3 h-auto w-[48%] max-w-[240px] lg:static lg:mt-6 lg:w-[60%] lg:max-w-[320px]" />
        </div>
        <div className="relative z-10 -mt-6 rounded-2xl bg-white p-5 shadow-2xl shadow-black/25 sm:p-7 lg:mt-0">{children}</div>
      </div>
    </section>
  );
}

function TelaResultado({ nome, r, onNovamente }: { nome: string; r: Resultado; onNovamente: () => void }) {
  const itens = [
    { rotulo: "Valor do imóvel", valor: reais(r.valorImovel) },
    { rotulo: "Subsídio", valor: reais(r.subsidio) },
    { rotulo: "Entrada", valor: reais(r.entradaEstimada) },
    { rotulo: "Valor financiado", valor: reais(r.valorFinanciado) },
    { rotulo: "Prazo", valor: `${r.prazoMeses} meses` },
    { rotulo: "Valor da 1ª parcela", valor: reais(r.primeiraParcela) },
  ];

  return (
    <TelaAzul titulo="Simulação realizada com sucesso" subtitulo="Veja abaixo o resultado do seu financiamento">
      <p className="text-sm text-slate-500">
        {nome.split(" ")[0]}, resultado para a renda de {reais(r.rendaInformada)}
      </p>
      <dl className="mt-2 divide-y divide-slate-200">
        {itens.map((i) => (
          <div key={i.rotulo} className="flex items-center justify-between gap-4 py-3">
            <dt className="font-bold text-titulo">{i.rotulo}:</dt>
            <dd className="font-bold text-ouro">{i.valor}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-1 text-xs text-slate-500">
        Valor liberado (financiamento + subsídio): {reais(r.valorLiberado)}. Juros nominal {porcentagem(r.jurosNominal)},
        efetivo {porcentagem(r.jurosEfetivo)}
      </p>

      <div className="mt-5">
        <BotaoWhatsapp nome={nome} renda={r.rendaInformada} valor={r.valorLiberado} />
      </div>
      <button type="button" onClick={onNovamente} className="mt-3 w-full py-2 text-sm text-slate-600 hover:underline">
        Voltar para simular novamente
      </button>
      <AvisoLegal className="mt-3 rounded-lg bg-slate-100 p-3" />
    </TelaAzul>
  );
}

// Renda fora de R$ 1.000 a R$ 13.000: sem resultado, direto ao especialista.
function Especialista({ nome, renda }: { nome: string; renda: number }) {
  return (
    <TelaAzul titulo="Vamos simular com você" subtitulo="Um especialista faz a sua simulação">
      <p className="text-slate-700">
        Para a renda de {reais(renda)}, a simulação precisa ser feita por um especialista. Fale com a
        gente no WhatsApp.
      </p>
      <div className="mt-5">
        <BotaoWhatsapp nome={nome} renda={renda} />
      </div>
      <AvisoLegal className="mt-4" />
    </TelaAzul>
  );
}
