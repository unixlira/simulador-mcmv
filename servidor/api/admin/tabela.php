<?php
// GET  /api/admin/tabela  linhas da tabela ativa
// POST /api/admin/tabela  (corpo = texto do CSV) troca a tabela inteira
// O CSV é recusado inteiro se tiver qualquer erro. A tabela anterior fica guardada, não é apagada.
require dirname(__DIR__) . '/_lib/base.php';
require_once dirname(__DIR__) . '/_lib/csv.php';

$metodo = exigir_metodo('GET', 'POST');
exigir_admin();

if ($metodo === 'GET') {
    $linhas = tabela();
    responder(['linhas' => $linhas, 'total' => count($linhas), 'atualizada_em' => date('c', filemtime(DADOS . '/tabela.csv'))]);
}

$conteudo = (string) file_get_contents('php://input');
if (strlen($conteudo) > 1_000_000) erro('arquivo grande demais', 413);
try {
    $linhas = ler_csv($conteudo);
} catch (ErroImportacao $e) {
    erro('CSV recusado', 422, ['erros' => $e->erros]);
}

$atual = DADOS . '/tabela.csv';
$pasta = DADOS . '/tabelas-anteriores';
if (!is_dir($pasta)) mkdir($pasta, 0750, true);
if (is_file($atual)) copy($atual, $pasta . '/tabela-' . date('Y-m-d-His') . '.csv');
file_put_contents($atual . '.tmp', $conteudo);
rename($atual . '.tmp', $atual);

responder(['importadas' => count($linhas)]);
