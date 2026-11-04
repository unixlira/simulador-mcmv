"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AvisoLegal } from "@/components/aviso-legal";
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
    "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-marca focus:ring-2 focus:ring-marca/20";

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      <h1 className="text-2xl font-bold text-marca">Sua simulação</h1>

      <label className="block">
        <span className="text-sm font-medium">Nome</span>
        <input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Celular com DDD</span>
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
        <span className="text-sm font-medium">Renda bruta mensal da família</span>
        <input
          className={campo}
          value={renda}
          onChange={(e) => setRenda(mascaraMoeda(e.target.value))}
          inputMode="numeric"
          placeholder="R$ 0,00"
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium">Tem dependentes?</legend>
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
              className={`rounded-xl border px-4 py-3 font-medium ${
                dependente === o.valor ? "border-marca bg-marca text-white" : "border-slate-300 bg-white"
              }`}
            >
              {o.texto}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium">
          Bairro ou região <span className="text-slate-400">(opcional)</span>
        </span>
        <input className={campo} value={bairro} onChange={(e) => setBairro(e.target.value)} />
      </label>

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={consentimento}
          onChange={(e) => setConsentimento(e.target.checked)}
          className="mt-1 size-5 shrink-0 accent-marca"
        />
        <span>
          Autorizo a Beta Negócios a usar meus dados para entrar em contato sobre financiamento
          habitacional, conforme a{" "}
          <Link href="/privacidade" target="_blank" className="text-marca underline">
            política de privacidade
          </Link>
          .
        </span>
      </label>

      {erro && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-2xl bg-destaque px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-destaque-escura disabled:opacity-60"
      >
        {enviando ? "Simulando..." : "Ver minha simulação"}
      </button>
    </form>
  );
}

function BotaoWhatsapp({ nome, renda, valor }: { nome: string; renda: number; valor?: number }) {
  const link = linkWhatsapp(nome, renda, valor);
  if (!link)
    return (
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        WhatsApp do especialista ainda não configurado.
      </p>
    );
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => evento("clique_whatsapp")}
      className="block w-full rounded-2xl bg-destaque px-6 py-4 text-center text-lg font-bold text-white shadow-lg transition hover:bg-destaque-escura"
    >
      Falar com especialista
    </a>
  );
}

function TelaResultado({ nome, r, onNovamente }: { nome: string; r: Resultado; onNovamente: () => void }) {
  const itens = [
    { rotulo: "Valor do imóvel (teto)", valor: reais(r.valorImovel) },
    { rotulo: "Valor financiado", valor: reais(r.valorFinanciado) },
    { rotulo: "Subsídio", valor: reais(r.subsidio) },
    { rotulo: "Entrada estimada", valor: reais(r.entradaEstimada) },
    { rotulo: "1ª parcela", valor: reais(r.primeiraParcela) },
    { rotulo: "Prazo", valor: `${r.prazoMeses} meses` },
    { rotulo: "Juros nominal", valor: porcentagem(r.jurosNominal) },
    { rotulo: "Juros efetivo", valor: porcentagem(r.jurosEfetivo) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">{nome.split(" ")[0]}, este é o resultado para a renda de {reais(r.rendaInformada)}</p>
        <h1 className="mt-1 text-lg font-medium text-slate-700">Valor liberado</h1>
        <p className="text-4xl font-bold text-marca">{reais(r.valorLiberado)}</p>
        <p className="text-sm text-slate-500">financiamento + subsídio</p>
      </div>

      <dl className="divide-y divide-slate-200 rounded-2xl bg-white shadow-sm">
        {itens.map((i) => (
          <div key={i.rotulo} className="flex items-center justify-between px-5 py-3">
            <dt className="text-sm text-slate-600">{i.rotulo}</dt>
            <dd className="font-semibold">{i.valor}</dd>
          </div>
        ))}
      </dl>

      <AvisoLegal className="rounded-xl bg-slate-100 p-4" />

      <BotaoWhatsapp nome={nome} renda={r.rendaInformada} valor={r.valorLiberado} />
      <button
        type="button"
        onClick={onNovamente}
        className="w-full rounded-2xl border border-marca px-6 py-4 font-semibold text-marca"
      >
        Simular novamente
      </button>
    </div>
  );
}

// Renda fora de R$ 1.000 a R$ 13.000: sem resultado, direto ao especialista.
function Especialista({ nome, renda }: { nome: string; renda: number }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-marca">Vamos simular com você</h1>
      <p className="text-slate-600">
        Para a renda de {reais(renda)}, a simulação precisa ser feita por um especialista. Fale com a
        gente no WhatsApp.
      </p>
      <BotaoWhatsapp nome={nome} renda={renda} />
      <AvisoLegal />
    </div>
  );
}
