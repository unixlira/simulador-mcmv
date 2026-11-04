<?php
// Testes do cálculo e do CSV (sem banco, sem servidor): php testes/testes.php
// Casos da seção 13 do plano contra a tabela da seção 7.3.
require __DIR__ . '/../servidor/api/_lib/csv.php';

$falhas = 0;
function confere(string $nome, mixed $obtido, mixed $esperado): void
{
    global $falhas;
    if ($obtido == $esperado) return;
    $falhas++;
    echo "FALHOU $nome: esperado " . var_export($esperado, true) . ', obtido ' . var_export($obtido, true) . PHP_EOL;
}

$tabela = ler_csv(file_get_contents(__DIR__ . '/../servidor/api/_lib/tabela-exemplo.csv'));
$linha = function (int $renda) use ($tabela) {
    foreach ($tabela as $l) if ((int) $l['renda'] === $renda) return $l;
    throw new Exception("sem linha $renda");
};

confere('arredonda 2870', renda_da_tabela(2870), 2800);
confere('arredonda 5190', renda_da_tabela(5190), 5100);
confere('arredonda 3200', renda_da_tabela(3200), 3200);
confere('arredonda 1000,99', renda_da_tabela(1000.99), 1000);
foreach ([800, 999.99, 13000.01, 14000] as $r) confere("fora $r", fora_da_faixa($r), true);
foreach ([1000, 5000, 13000] as $r) confere("dentro $r", fora_da_faixa($r), false);

// renda, subsídio c/ dep., financiamento, 1ª prestação, teto, juros nom., juros ef., faixa
$casos = [
    [1000, 55000, 56132.57, 300, 275000, 4.75, 4.85, 1],
    [3200, 6011, 172228.77, 960, 275000, 5.25, 5.37, 1],
    [3300, 4659, 172588.97, 990, 275000, 5.5, 5.64, 2],
    [5000, 0, 220000, 1500, 350000, 7, 7.22, 2],
    [5100, 0, 198034.42, 1530, 400000, 8.16, 8.47, 3],
    [9600, 0, 320000, 2880, 400000, 8.16, 8.47, 3],
    [9700, 0, 322126.38, 2910, 600000, 10, 10.47, 4],
    [13000, 0, 435857.78, 3900, 600000, 10, 10.47, 4],
];
foreach ($casos as [$renda, $subsidio, $fin, $parcela, $teto, $jn, $je, $faixa]) {
    $r = montar_resultado($renda, $linha($renda), true);
    $esperado = ['rendaTabela' => $renda, 'faixa' => $faixa, 'subsidio' => $subsidio, 'valorFinanciado' => $fin,
        'primeiraParcela' => $parcela, 'valorImovel' => $teto, 'jurosNominal' => $jn, 'jurosEfetivo' => $je, 'prazoMeses' => 420];
    foreach ($esperado as $k => $v) confere("renda $renda $k", $r[$k], $v);
}

$r = montar_resultado(1000, $linha(1000), true);
confere('liberado 1000', $r['valorLiberado'], 111132.57);
confere('entrada 1000', $r['entradaEstimada'], 163867.43);
$r = montar_resultado(2000, $linha(2000), false);
confere('sem dependente subsídio', $r['subsidio'], 0);
confere('sem dependente entrada', $r['entradaEstimada'], 158826.17);
$r = simular($tabela, 2070, true);
confere('renda quebrada informada', $r['rendaInformada'], 2070);
confere('renda quebrada tabela', $r['rendaTabela'], 2000);
confere('800 fora', simular($tabela, 800, true)['foraDaFaixa'], true);
confere('14000 fora', simular($tabela, 14000, true)['foraDaFaixa'], true);
// 1.100 está dentro da faixa mas falta na tabela de exemplo: vai ao especialista.
confere('sem linha vai ao especialista', simular($tabela, 1100, true)['foraDaFaixa'], true);

confere('numero br', ler_numero('1.234,56'), 1234.56);
confere('numero R$', ler_numero('R$ 373.822,47'), 373822.47);
confere('numero ponto', ler_numero('1234.56'), 1234.56);
confere('numero vazio', ler_numero(''), null);
confere('numero travessão', ler_numero('—'), null);
confere('numero texto', is_nan(ler_numero('abc')), true);

$cab = 'renda;subsidio_com_dependente;financiamento;subsidio_sem_dependente;primeira_prestacao;valor_avaliacao;juros_nominal;juros_efetivo;faixa';
$errosDe = function (string $csv) {
    try {
        ler_csv($csv);
        return null;
    } catch (ErroImportacao $e) {
        return $e->erros;
    }
};
confere('recusa acima de 80%', $errosDe("$cab\n4000;0;290000;;1200;350000;7;7,22;2") !== null, true);
confere('recusa 3 erros', count($errosDe(implode("\n", [$cab,
    '1000;55000;56132,57;;300;275000;4,75;4,85;1',
    '1000;55000;56132,57;;300;275000;4,75;4,85;1',
    '800;0;1000;;240;275000;4,75;4,85;1',
    '1100;0;;;330;275000;4,75;4,85;1',
])) ?? []), 3);
confere('recusa cabeçalho', str_contains(($errosDe("renda;faixa\n1000;1") ?? [''])[0], 'colunas faltando'), true);

echo $falhas ? "$falhas falha(s)\n" : "todos os testes passaram\n";
exit($falhas ? 1 : 0);
