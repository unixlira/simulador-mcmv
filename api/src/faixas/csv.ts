import type { LinhaTabela } from '../simulacao/calculo.js';
import { RENDA_MAXIMA, RENDA_MINIMA } from '../simulacao/calculo.js';

// Cabeçalho esperado do CSV (gerado a partir do PDF da Beta Negócios).
export const COLUNAS = [
  'renda',
  'subsidio_com_dependente',
  'financiamento',
  'subsidio_sem_dependente',
  'primeira_prestacao',
  'valor_avaliacao',
  'juros_nominal',
  'juros_efetivo',
  'faixa',
] as const;

// Teto da tabela: o financiamento nunca passa de 80% do imóvel.
export const COTA_MAXIMA = 0.8;

export class ErroImportacao extends Error {
  constructor(public readonly erros: string[]) {
    super(`CSV recusado: ${erros.slice(0, 5).join('; ')}${erros.length > 5 ? ` (+${erros.length - 5})` : ''}`);
  }
}

// Aceita "1.234,56", "1234,56" e "1234.56". Vazio ou "—" vira null.
export function lerNumero(texto: string): number | null {
  const t = texto.trim().replace(/^R\$\s*/, '');
  if (t === '' || t === '-' || t === '—') return null;
  const normalizado = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t;
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : NaN;
}

function separar(linha: string): string[] {
  // Separador ";" (padrão do Excel brasileiro) ou "," quando não houver ";".
  return linha.includes(';') ? linha.split(';') : linha.split(',');
}

export function lerCsv(conteudo: string): LinhaTabela[] {
  const linhas = conteudo
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '' && !l.trim().startsWith('#'));
  if (linhas.length === 0) throw new ErroImportacao(['arquivo vazio']);

  const cabecalho = separar(linhas[0]).map((c) => c.trim().toLowerCase());
  const faltando = COLUNAS.filter((c) => !cabecalho.includes(c));
  if (faltando.length) throw new ErroImportacao([`colunas faltando: ${faltando.join(', ')}`]);
  const idx = Object.fromEntries(COLUNAS.map((c) => [c, cabecalho.indexOf(c)])) as Record<
    (typeof COLUNAS)[number],
    number
  >;

  const erros: string[] = [];
  const resultado: LinhaTabela[] = [];
  const vistas = new Set<number>();

  linhas.slice(1).forEach((texto, i) => {
    const n = i + 2;
    const campos = separar(texto);
    const v = (c: (typeof COLUNAS)[number]) => lerNumero(campos[idx[c]] ?? '');

    const linha = {
      renda: v('renda'),
      subsidioComDependente: v('subsidio_com_dependente') ?? 0,
      financiamento: v('financiamento'),
      subsidioSemDependente: v('subsidio_sem_dependente'),
      primeiraPrestacao: v('primeira_prestacao'),
      valorAvaliacao: v('valor_avaliacao'),
      jurosNominal: v('juros_nominal'),
      jurosEfetivo: v('juros_efetivo'),
      faixa: v('faixa'),
    };

    const invalidos = Object.entries(linha)
      .filter(([k, val]) => (val === null && k !== 'subsidioSemDependente') || Number.isNaN(val))
      .map(([k]) => k);
    if (invalidos.length) {
      erros.push(`linha ${n}: valor inválido em ${invalidos.join(', ')}`);
      return;
    }
    const l = linha as LinhaTabela;

    if (l.renda < RENDA_MINIMA || l.renda > RENDA_MAXIMA || l.renda % 100 !== 0)
      erros.push(`linha ${n}: renda ${l.renda} fora de 1.000 a 13.000 ou não é múltiplo de 100`);
    if (![1, 2, 3, 4].includes(l.faixa)) erros.push(`linha ${n}: faixa ${l.faixa} não é 1 a 4`);
    if (l.financiamento > l.valorAvaliacao * COTA_MAXIMA + 0.005)
      erros.push(`linha ${n}: financiamento ${l.financiamento} passa de 80% do imóvel ${l.valorAvaliacao}`);
    if (vistas.has(l.renda)) erros.push(`linha ${n}: renda ${l.renda} repetida`);
    vistas.add(l.renda);

    resultado.push(l);
  });

  if (erros.length) throw new ErroImportacao(erros);
  return resultado.sort((a, b) => a.renda - b.renda);
}
