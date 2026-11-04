import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { lerCsv } from '../faixas/csv.js';
import { foraDaFaixa, montarResultado, rendaDaTabela } from './calculo.js';

const tabela = lerCsv(readFileSync(join(import.meta.dirname, '../../dados/tabela-exemplo.csv'), 'utf8'));
const linha = (renda: number) => tabela.find((l) => l.renda === renda)!;

describe('rendaDaTabela', () => {
  it('arredonda para baixo até o múltiplo de 100', () => {
    expect(rendaDaTabela(2870)).toBe(2800);
    expect(rendaDaTabela(5190)).toBe(5100);
    expect(rendaDaTabela(3200)).toBe(3200);
    expect(rendaDaTabela(1000.99)).toBe(1000);
  });
});

describe('foraDaFaixa', () => {
  it.each([800, 999.99, 13000.01, 14000])('%s fica fora', (r) => expect(foraDaFaixa(r)).toBe(true));
  it.each([1000, 5000, 13000])('%s fica dentro', (r) => expect(foraDaFaixa(r)).toBe(false));
});

// Rendas de borda da seção 13 contra a tabela da seção 7.3 do plano.
describe('montarResultado nas rendas de borda', () => {
  const casos = [
    // renda, subsídio c/ dep., financiamento, 1ª prestação, teto, juros nom., juros ef., faixa
    [1000, 55000, 56132.57, 300, 275000, 4.75, 4.85, 1],
    [3200, 6011, 172228.77, 960, 275000, 5.25, 5.37, 1],
    [3300, 4659, 172588.97, 990, 275000, 5.5, 5.64, 2],
    [5000, 0, 220000, 1500, 350000, 7, 7.22, 2],
    [5100, 0, 198034.42, 1530, 400000, 8.16, 8.47, 3],
    [9600, 0, 320000, 2880, 400000, 8.16, 8.47, 3],
    [9700, 0, 322126.38, 2910, 600000, 10, 10.47, 4],
    [13000, 0, 435857.78, 3900, 600000, 10, 10.47, 4],
  ] as const;

  it.each(casos)('renda %s', (renda, subsidio, financiamento, parcela, teto, jn, je, faixa) => {
    const r = montarResultado(renda, linha(renda), true);
    expect(r).toMatchObject({
      rendaTabela: renda,
      faixa,
      subsidio,
      valorFinanciado: financiamento,
      primeiraParcela: parcela,
      valorImovel: teto,
      jurosNominal: jn,
      jurosEfetivo: je,
      prazoMeses: 420,
    });
  });

  it('soma liberado e entrada sem erro de centavos', () => {
    const r = montarResultado(1000, linha(1000), true);
    expect(r.valorLiberado).toBe(111132.57);
    expect(r.entradaEstimada).toBe(163867.43);
  });

  it('sem dependente usa o subsídio sem dependente (vazio = 0)', () => {
    const r = montarResultado(2000, linha(2000), false);
    expect(r.subsidio).toBe(0);
    expect(r.entradaEstimada).toBe(158826.17);
  });

  it('renda quebrada usa a linha de baixo', () => {
    const r = montarResultado(2070, linha(rendaDaTabela(2070)), true);
    expect(r.rendaInformada).toBe(2070);
    expect(r.rendaTabela).toBe(2000);
  });
});
