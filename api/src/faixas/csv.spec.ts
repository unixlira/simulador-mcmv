import { ErroImportacao, lerCsv, lerNumero } from './csv.js';

const CABECALHO =
  'renda;subsidio_com_dependente;financiamento;subsidio_sem_dependente;primeira_prestacao;valor_avaliacao;juros_nominal;juros_efetivo;faixa';

describe('lerNumero', () => {
  it('entende formato brasileiro e vazio', () => {
    expect(lerNumero('1.234,56')).toBe(1234.56);
    expect(lerNumero('R$ 373.822,47')).toBe(373822.47);
    expect(lerNumero('1234.56')).toBe(1234.56);
    expect(lerNumero('')).toBeNull();
    expect(lerNumero('—')).toBeNull();
    expect(lerNumero('abc')).toBeNaN();
  });
});

describe('lerCsv', () => {
  it('recusa financiamento acima de 80% do imóvel', () => {
    const csv = `${CABECALHO}\n4000;0;290000;;1200;350000;7;7,22;2`;
    expect(() => lerCsv(csv)).toThrow(ErroImportacao);
  });

  it('recusa renda repetida, fora da faixa e campo obrigatório vazio', () => {
    const csv = [
      CABECALHO,
      '1000;55000;56132,57;;300;275000;4,75;4,85;1',
      '1000;55000;56132,57;;300;275000;4,75;4,85;1',
      '800;0;1000;;240;275000;4,75;4,85;1',
      '1100;0;;;330;275000;4,75;4,85;1',
    ].join('\n');
    try {
      lerCsv(csv);
      expect.unreachable();
    } catch (e) {
      expect((e as ErroImportacao).erros).toHaveLength(3);
    }
  });

  it('recusa cabeçalho incompleto', () => {
    expect(() => lerCsv('renda;faixa\n1000;1')).toThrow(/colunas faltando/);
  });
});
