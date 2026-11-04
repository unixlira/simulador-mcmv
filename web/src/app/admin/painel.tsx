"use client";

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { reais } from "@/lib/formato";

interface Lead {
  id: string;
  nome: string;
  celular: string;
  renda: number;
  tem_dependente: boolean;
  bairro: string | null;
  faixa: number | null;
  valor_financiado: number | null;
  subsidio: number | null;
  valor_imovel: number | null;
  primeira_parcela: number | null;
  status: Status;
  origem: string | null;
  criado_em: string;
}

const STATUS = {
  novo: "Novo",
  contatado: "Contatado",
  em_negociacao: "Em negociação",
  fechado: "Fechado",
  perdido: "Perdido",
} as const;
type Status = keyof typeof STATUS;

interface Filtros {
  de: string;
  ate: string;
  faixa: string;
  status: string;
}

const campo = "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-marca";

async function api<T>(caminho: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(caminho, { credentials: "same-origin", ...init });
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw Object.assign(new Error(corpo.erro ?? "Falha na comunicação"), { status: resposta.status, corpo });
  return corpo as T;
}

export function Painel() {
  const [usuario, setUsuario] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    api<{ usuario: string }>("/api/admin/login/")
      .then((r) => setUsuario(r.usuario))
      .catch(() => setUsuario(null));
  }, []);

  const sair = useCallback(async () => {
    await api("/api/admin/login/", { method: "DELETE" }).catch(() => {});
    setUsuario(null);
  }, []);

  if (usuario === undefined) return <p className="text-slate-500">Carregando...</p>;
  if (!usuario) return <Login onEntrar={setUsuario} />;
  return <Leads onSair={sair} />;
}

function Login({ onEntrar }: { onEntrar: (usuario: string) => void }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    try {
      const r = await api<{ usuario: string }>("/api/admin/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });
      onEntrar(r.usuario);
    } catch (falha) {
      setErro((falha as Error).message);
    }
  }

  return (
    <form onSubmit={entrar} className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-bold text-marca">Painel de leads</h1>
      <label className="block">
        <span className="text-sm font-medium">Usuário</span>
        <input className={`${campo} mt-1 w-full py-3`} value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Senha</span>
        <input
          type="password"
          className={`${campo} mt-1 w-full py-3`}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      {erro && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}
      <button type="submit" className="w-full rounded-2xl bg-marca px-6 py-3 font-bold text-white">
        Entrar
      </button>
    </form>
  );
}

function Leads({ onSair }: { onSair: () => void }) {
  const [filtros, setFiltros] = useState<Filtros>({ de: "", ate: "", faixa: "", status: "" });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [aviso, setAviso] = useState("");
  const consulta = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v)).toString();

  useEffect(() => {
    api<{ leads: Lead[] }>(`/api/admin/leads/?${consulta}`)
      .then((r) => setLeads(r.leads))
      .catch((falha) => {
        if ((falha as { status?: number }).status === 401) return onSair();
        setAviso((falha as Error).message);
      });
  }, [consulta, onSair]);

  async function mudarStatus(id: string, status: Status) {
    try {
      const atualizado = await api<Lead>("/api/admin/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setLeads((atual) => atual.map((l) => (l.id === id ? atualizado : l)));
    } catch (falha) {
      setAviso((falha as Error).message);
    }
  }

  async function importarTabela(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    if (!confirm(`Trocar a tabela de financiamento pelo arquivo ${arquivo.name}? A tabela atual fica guardada.`)) return;
    try {
      const r = await api<{ importadas: number }>("/api/admin/tabela/", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: await arquivo.text(),
      });
      setAviso(`Tabela trocada: ${r.importadas} linhas.`);
    } catch (falha) {
      const erros = (falha as { corpo?: { erros?: string[] } }).corpo?.erros ?? [];
      setAviso(`${(falha as Error).message}. ${erros.slice(0, 5).join("; ")}`);
    }
  }

  const filtro = (chave: keyof Filtros) => ({
    value: filtros[chave],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFiltros({ ...filtros, [chave]: e.target.value }),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-marca">Leads ({leads.length})</h1>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/admin/leads/?${consulta}${consulta ? "&" : ""}formato=csv`} className="rounded-xl border border-marca px-4 py-2 text-sm font-semibold text-marca">
            Exportar CSV
          </a>
          <label className="cursor-pointer rounded-xl border border-marca px-4 py-2 text-sm font-semibold text-marca">
            Importar tabela (CSV)
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={importarTabela} />
          </label>
          <button type="button" onClick={onSair} className="rounded-xl px-4 py-2 text-sm text-slate-500 underline">
            Sair
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2">
          De <input type="date" className={campo} {...filtro("de")} />
        </label>
        <label className="flex items-center gap-2">
          Até <input type="date" className={campo} {...filtro("ate")} />
        </label>
        <select className={campo} {...filtro("faixa")} aria-label="Faixa">
          <option value="">Todas as faixas</option>
          {[1, 2, 3, 4].map((f) => (
            <option key={f} value={f}>
              Faixa {f}
            </option>
          ))}
          <option value="fora">Fora da tabela</option>
        </select>
        <select className={campo} {...filtro("status")} aria-label="Status">
          <option value="">Todos os status</option>
          {Object.entries(STATUS).map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {aviso && (
        <p role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {aviso}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {["Data", "Nome", "Celular", "Renda", "Dep.", "Faixa", "Financiado", "Subsídio", "Imóvel", "1ª parcela", "Bairro", "Origem", "Status"].map((c) => (
                <th key={c} className="whitespace-nowrap px-3 py-2">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap px-3 py-2">{new Date(l.criado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</td>
                <td className="px-3 py-2">{l.nome}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <a href={`https://wa.me/55${l.celular}`} target="_blank" rel="noopener noreferrer" className="text-marca underline">
                    {l.celular}
                  </a>
                </td>
                <td className="whitespace-nowrap px-3 py-2">{reais(l.renda)}</td>
                <td className="px-3 py-2">{l.tem_dependente ? "Sim" : "Não"}</td>
                <td className="px-3 py-2">{l.faixa ?? "fora"}</td>
                <td className="whitespace-nowrap px-3 py-2">{l.valor_financiado === null ? "" : reais(l.valor_financiado)}</td>
                <td className="whitespace-nowrap px-3 py-2">{l.subsidio === null ? "" : reais(l.subsidio)}</td>
                <td className="whitespace-nowrap px-3 py-2">{l.valor_imovel === null ? "" : reais(l.valor_imovel)}</td>
                <td className="whitespace-nowrap px-3 py-2">{l.primeira_parcela === null ? "" : reais(l.primeira_parcela)}</td>
                <td className="px-3 py-2">{l.bairro}</td>
                <td className="px-3 py-2">{l.origem}</td>
                <td className="px-3 py-2">
                  <select className={campo} value={l.status} onChange={(e) => mudarStatus(l.id, e.target.value as Status)} aria-label={`Status de ${l.nome}`}>
                    {Object.entries(STATUS).map(([v, t]) => (
                      <option key={v} value={v}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-6 text-center text-slate-500">
                  Nenhum lead com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
