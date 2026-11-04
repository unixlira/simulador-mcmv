<?php
// GET  /api/admin/leads?de=AAAA-MM-DD&ate=AAAA-MM-DD&faixa=1..4|fora&status=...  lista (mais novo primeiro)
// GET  /api/admin/leads?formato=csv  mesma lista em CSV
// POST /api/admin/leads { id, status }  muda o status
require dirname(__DIR__) . '/_lib/base.php';

const STATUS_LEAD = ['novo', 'contatado', 'em_negociacao', 'fechado', 'perdido'];

$metodo = exigir_metodo('GET', 'POST');
exigir_admin();

if ($metodo === 'POST') {
    $d = corpo_json();
    $id = is_string($d['id'] ?? null) ? $d['id'] : '';
    $status = $d['status'] ?? null;
    if (!in_array($status, STATUS_LEAD, true)) erro('status inválido', 422);

    migrar_leads_json();
    $arquivo = achar_simulacao($id);
    if (!$arquivo) erro('lead não encontrado', 404);
    $lead = json_decode((string) file_get_contents($arquivo), true);
    $lead['status'] = $status;
    $lead['atualizado_em'] = date('c');
    gravar_json($arquivo, $lead);
    responder($lead);
}

$de = $_GET['de'] ?? '';
$ate = $_GET['ate'] ?? '';
$faixa = $_GET['faixa'] ?? '';
$status = $_GET['status'] ?? '';

$leads = array_values(array_filter(listar_simulacoes(), function (array $l) use ($de, $ate, $faixa, $status) {
    $dia = substr($l['criado_em'], 0, 10);
    if ($de !== '' && $dia < $de) return false;
    if ($ate !== '' && $dia > $ate) return false;
    if ($faixa === 'fora' && $l['faixa'] !== null) return false;
    if ($faixa !== '' && $faixa !== 'fora' && (string) $l['faixa'] !== $faixa) return false;
    if ($status !== '' && $l['status'] !== $status) return false;
    return true;
}));
usort($leads, fn ($a, $b) => strcmp($b['criado_em'], $a['criado_em']));

if (($_GET['formato'] ?? '') !== 'csv') responder(['leads' => $leads, 'total' => count($leads)]);

// CSV com ";" e BOM para abrir certo no Excel em português.
$colunas = ['criado_em', 'nome', 'celular', 'renda', 'tem_dependente', 'bairro', 'faixa', 'valor_financiado',
    'subsidio', 'valor_imovel', 'primeira_parcela', 'status', 'origem', 'id'];
$numero = fn ($v) => $v === null ? '' : number_format((float) $v, 2, ',', '');

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="leads-' . date('Y-m-d') . '.csv"');
header('Cache-Control: no-store');
$saida = fopen('php://output', 'w');
fwrite($saida, "\xEF\xBB\xBF");
fputcsv($saida, $colunas, ';', '"', '');
foreach ($leads as $l) {
    fputcsv($saida, [
        $l['criado_em'], $l['nome'], $l['celular'], $numero($l['renda']), $l['tem_dependente'] ? 'sim' : 'não',
        $l['bairro'] ?? '', $l['faixa'] ?? 'fora', $numero($l['valor_financiado']), $numero($l['subsidio']),
        $numero($l['valor_imovel']), $numero($l['primeira_parcela']), $l['status'], $l['origem'] ?? '', $l['id'],
    ], ';', '"', '');
}
