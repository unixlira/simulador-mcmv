<?php
// Regras da seção 6 do plano de ação. A tabela é consulta, não fórmula:
// nenhum valor da linha é recalculado aqui. Só a 1ª parcela sai da renda informada.

const RENDA_MINIMA = 1000;
const RENDA_MAXIMA = 13000;
const PRAZO_MESES = 420;
// 1ª parcela = 30% da renda informada (regra da tabela de 420 meses; o valor da coluna do PDF é só exemplo).
const COMPROMETIMENTO_RENDA = 0.30;

function fora_da_faixa(float $renda): bool
{
    return $renda < RENDA_MINIMA || $renda > RENDA_MAXIMA;
}

// Arredonda para baixo até o múltiplo de 100 (2870 -> 2800).
// Pendência do Junior: "para baixo" (assumido) ou "mais próximo".
function renda_da_tabela(float $renda): int
{
    return (int) (floor($renda / 100) * 100);
}

// Linha usada: a de maior renda que não passa da informada (2870 -> 2850, que existe no PDF).
/** @param array<int, array<string, float|int|null>> $tabela ordenada por renda */
function linha_da_tabela(array $tabela, float $renda): ?array
{
    $escolhida = null;
    foreach ($tabela as $linha) {
        if ($linha['renda'] <= $renda) $escolhida = $linha;
    }
    return $escolhida !== null && $escolhida['renda'] >= renda_da_tabela($renda) ? $escolhida : null;
}

function primeira_parcela(float $renda): float
{
    return round(centavos($renda) * COMPROMETIMENTO_RENDA) / 100;
}

// Soma em centavos para não acumular erro de ponto flutuante.
function centavos(float $valor): int
{
    return (int) round($valor * 100);
}

/** @param array<string, float|int|null> $linha linha da tabela lida por ler_csv() */
function montar_resultado(float $rendaInformada, array $linha, bool $temDependente): array
{
    $subsidio = $temDependente
        ? $linha['subsidioComDependente']
        : ($linha['subsidioSemDependente'] ?? 0.0);

    $liberado = (centavos($linha['financiamento']) + centavos($subsidio)) / 100;
    $entrada = max(0, centavos($linha['valorAvaliacao']) - centavos($linha['financiamento']) - centavos($subsidio)) / 100;

    return [
        'foraDaFaixa' => false,
        'rendaInformada' => $rendaInformada,
        'rendaTabela' => $linha['renda'],
        'faixa' => (int) $linha['faixa'],
        'valorImovel' => $linha['valorAvaliacao'],
        'valorFinanciado' => $linha['financiamento'],
        'subsidio' => (float) $subsidio,
        // Pendência do Junior: liberação = financiamento + subsídio ou só financiamento.
        'valorLiberado' => $liberado,
        'entradaEstimada' => $entrada,
        'primeiraParcela' => primeira_parcela($rendaInformada),
        'prazoMeses' => PRAZO_MESES,
        'jurosNominal' => $linha['jurosNominal'],
        'jurosEfetivo' => $linha['jurosEfetivo'],
    ];
}

/**
 * Pacote da simulação ou ['foraDaFaixa' => true] quando a renda está fora de 1.000 a 13.000
 * ou a tabela não tem a linha (tabela incompleta: o lead vai direto ao especialista).
 */
function simular(array $tabela, float $renda, bool $temDependente): array
{
    if (fora_da_faixa($renda)) return ['foraDaFaixa' => true, 'rendaInformada' => $renda];

    $linha = linha_da_tabela($tabela, $renda);
    if ($linha !== null) return montar_resultado($renda, $linha, $temDependente);
    error_log('simulador: tabela sem a linha da renda ' . renda_da_tabela($renda));
    return ['foraDaFaixa' => true, 'rendaInformada' => $renda];
}
