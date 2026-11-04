<?php
// POST /api/leads: grava o lead e devolve a simulação.
// O lead é gravado no envio do formulário, antes de a pessoa ver o resultado.
require __DIR__ . '/_lib/base.php';
require_once __DIR__ . '/_lib/calculo.php';

exigir_metodo('POST');
limitar();
$d = corpo_json();

$texto = fn ($v) => is_string($v) ? trim($v) : null;
$nome = $texto($d['nome'] ?? null);
// DDD + celular com 9 na frente (11 dígitos).
$celular = is_string($d['celular'] ?? null) ? preg_replace('/\D/', '', $d['celular']) : '';
$renda = $d['renda'] ?? null;
$bairro = $texto($d['bairro'] ?? null) ?: null;
$origem = $texto($d['origem'] ?? null) ?: null;

$erros = [];
if ($nome === null || mb_strlen($nome) < 2 || mb_strlen($nome) > 120) $erros[] = 'nome inválido';
if (!preg_match('/^[1-9]{2}9\d{8}$/', $celular)) $erros[] = 'celular inválido';
if ((!is_int($renda) && !is_float($renda)) || $renda < 0 || $renda > 1_000_000 || round($renda, 2) != $renda) $erros[] = 'renda inválida';
if (!is_bool($d['tem_dependente'] ?? null)) $erros[] = 'tem_dependente deve ser verdadeiro ou falso';
if ($bairro !== null && mb_strlen($bairro) > 80) $erros[] = 'bairro muito longo';
if (($d['consentimento_lgpd'] ?? null) !== true) $erros[] = 'é preciso aceitar a política de privacidade';
if ($origem !== null && mb_strlen($origem) > 200) $erros[] = 'origem muito longa';
if ($erros) erro('dados inválidos', 422, ['erros' => $erros]);

// O snapshot é calculado aqui, nunca aceito do navegador.
$sim = simular(tabela(), (float) $renda, $d['tem_dependente']);
$dentro = $sim['foraDaFaixa'] ? null : $sim;

$lead = [
    'id' => uuid4(),
    'nome' => $nome,
    'celular' => $celular,
    'renda' => (float) $renda,
    'tem_dependente' => $d['tem_dependente'],
    'bairro' => $bairro,
    'faixa' => $dentro['faixa'] ?? null,
    'valor_financiado' => $dentro['valorFinanciado'] ?? null,
    'subsidio' => $dentro['subsidio'] ?? null,
    'valor_imovel' => $dentro['valorImovel'] ?? null,
    'primeira_parcela' => $dentro['primeiraParcela'] ?? null,
    'status' => 'novo',
    'consentimento_lgpd' => true,
    'origem' => $origem,
    'criado_em' => date('c'),
];
com_arquivo('leads.json', function (array $leads) use ($lead) {
    $leads[] = $lead;
    return [$leads, null];
});

// Pendência do Junior: canal da notificação (e-mail, WhatsApp, planilha).
// Até lá o lead aparece só no painel /admin.
responder(['lead_id' => $lead['id'], 'simulacao' => $sim], 201);
