<?php
require_once __DIR__ . '/calculo.php';

// Cabeçalho esperado do CSV (gerado a partir do PDF da Beta Negócios).
const COLUNAS = [
    'renda' => 'renda',
    'subsidio_com_dependente' => 'subsidioComDependente',
    'financiamento' => 'financiamento',
    'subsidio_sem_dependente' => 'subsidioSemDependente',
    'primeira_prestacao' => 'primeiraPrestacao',
    'valor_avaliacao' => 'valorAvaliacao',
    'juros_nominal' => 'jurosNominal',
    'juros_efetivo' => 'jurosEfetivo',
    'faixa' => 'faixa',
];

// Teto da tabela: o financiamento nunca passa de 80% do imóvel.
const COTA_MAXIMA = 0.8;

class ErroImportacao extends Exception
{
    /** @param string[] $erros */
    public function __construct(public readonly array $erros)
    {
        $resto = count($erros) > 5 ? ' (+' . (count($erros) - 5) . ')' : '';
        parent::__construct('CSV recusado: ' . implode('; ', array_slice($erros, 0, 5)) . $resto);
    }
}

// Aceita "1.234,56", "1234,56" e "1234.56". Vazio ou "—" vira null; texto vira NAN.
function ler_numero(string $texto): float|null
{
    $t = trim(preg_replace('/^R\$\s*/u', '', trim($texto)));
    if ($t === '' || $t === '-' || $t === '—') return null;
    $normalizado = str_contains($t, ',') ? str_replace(',', '.', str_replace('.', '', $t)) : $t;
    return is_numeric($normalizado) ? (float) $normalizado : NAN;
}

// Separador ";" (padrão do Excel brasileiro) ou "," quando não houver ";".
function separar(string $linha): array
{
    return explode(str_contains($linha, ';') ? ';' : ',', $linha);
}

/** @return array<int, array<string, float|null>> linhas ordenadas por renda */
function ler_csv(string $conteudo): array
{
    $conteudo = preg_replace('/^\xEF\xBB\xBF/', '', $conteudo);
    $linhas = array_values(array_filter(
        preg_split('/\r?\n/', $conteudo),
        fn ($l) => trim($l) !== '' && !str_starts_with(trim($l), '#'),
    ));
    if (!$linhas) throw new ErroImportacao(['arquivo vazio']);

    $cabecalho = array_map(fn ($c) => strtolower(trim($c)), separar($linhas[0]));
    $faltando = array_diff(array_keys(COLUNAS), $cabecalho);
    if ($faltando) throw new ErroImportacao(['colunas faltando: ' . implode(', ', $faltando)]);
    $idx = [];
    foreach (COLUNAS as $coluna => $chave) $idx[$chave] = array_search($coluna, $cabecalho, true);

    $erros = [];
    $resultado = [];
    $vistas = [];

    foreach (array_slice($linhas, 1) as $i => $texto) {
        $n = $i + 2;
        $campos = separar($texto);
        $l = [];
        foreach ($idx as $chave => $pos) $l[$chave] = ler_numero($campos[$pos] ?? '');
        $l['subsidioComDependente'] ??= 0.0;

        $invalidos = [];
        foreach ($l as $chave => $valor) {
            if (($valor === null && $chave !== 'subsidioSemDependente') || (is_float($valor) && is_nan($valor))) $invalidos[] = $chave;
        }
        if ($invalidos) {
            $erros[] = "linha $n: valor inválido em " . implode(', ', $invalidos);
            continue;
        }

        if ($l['renda'] < RENDA_MINIMA || $l['renda'] > RENDA_MAXIMA || fmod($l['renda'], 100) != 0)
            $erros[] = "linha $n: renda {$l['renda']} fora de 1.000 a 13.000 ou não é múltiplo de 100";
        if (!in_array($l['faixa'], [1.0, 2.0, 3.0, 4.0], true)) $erros[] = "linha $n: faixa {$l['faixa']} não é 1 a 4";
        if ($l['financiamento'] > $l['valorAvaliacao'] * COTA_MAXIMA + 0.005)
            $erros[] = "linha $n: financiamento {$l['financiamento']} passa de 80% do imóvel {$l['valorAvaliacao']}";
        if (isset($vistas[(string) $l['renda']])) $erros[] = "linha $n: renda {$l['renda']} repetida";
        $vistas[(string) $l['renda']] = true;

        $l['faixa'] = (int) $l['faixa'];
        $resultado[] = $l;
    }

    if ($erros) throw new ErroImportacao($erros);
    usort($resultado, fn ($a, $b) => $a['renda'] <=> $b['renda']);
    return $resultado;
}
