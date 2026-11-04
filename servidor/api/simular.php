<?php
// POST /api/simular { renda, tem_dependente }
require __DIR__ . '/_lib/base.php';
require_once __DIR__ . '/_lib/calculo.php';

exigir_metodo('POST');
limitar();
$dados = corpo_json();

$renda = $dados['renda'] ?? null;
if (!is_int($renda) && !is_float($renda) || $renda < 0 || $renda > 1_000_000) erro('renda inválida', 422);
if (!is_bool($dados['tem_dependente'] ?? null)) erro('tem_dependente deve ser verdadeiro ou falso', 422);

responder(simular(tabela(), (float) $renda, $dados['tem_dependente']));
