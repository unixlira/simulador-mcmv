<?php
// Base comum dos endpoints: configuração, resposta JSON, arquivos de dados e rate limit.
// Sem banco: cada simulação é um arquivo JSON em simulacoes/AAAA/MM/DD/ e a tabela é um CSV,
// todos na pasta de dados (fora do site no servidor).

declare(strict_types=1);

date_default_timezone_set('America/Sao_Paulo');

$config = [
    // Pasta dos dados. No servidor o config.local.php aponta para fora do public_html.
    'dados' => dirname(__DIR__, 2) . '/_dados',
    // Login do painel fixo no código, a pedido do Lira (04/11), até o cliente decidir se terá banco.
    'admin_usuario' => 'admin',
    'admin_senha' => '12345678',
    // Pedidos por minuto por IP em toda a API.
    'limite_por_minuto' => 20,
];
if (is_file(__DIR__ . '/config.local.php')) $config = array_merge($config, require __DIR__ . '/config.local.php');
define('CONFIG', $config);
define('DADOS', rtrim(CONFIG['dados'], '/'));

if (!is_dir(DADOS)) mkdir(DADOS, 0750, true);
// Se a pasta ficar dentro do site (sem config.local.php), o servidor não a entrega.
if (!is_file(DADOS . '/.htaccess')) file_put_contents(DADOS . '/.htaccess', "Require all denied\n");

function responder(mixed $corpo, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($corpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION);
    exit;
}

function erro(string $mensagem, int $status, array $extra = []): never
{
    responder(['erro' => $mensagem] + $extra, $status);
}

function exigir_metodo(string ...$metodos): string
{
    $metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($metodo, $metodos, true)) {
        header('Allow: ' . implode(', ', $metodos));
        erro('método não permitido', 405);
    }
    return $metodo;
}

function corpo_json(): array
{
    $dados = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($dados)) erro('corpo JSON inválido', 400);
    return $dados;
}

// Lê e grava um JSON da pasta de dados com trava, para dois pedidos ao mesmo tempo
// não apagarem o lead um do outro.
function com_arquivo(string $nome, callable $alterar): mixed
{
    $caminho = DADOS . '/' . $nome;
    $trava = fopen($caminho . '.lock', 'c');
    flock($trava, LOCK_EX);
    try {
        $atual = is_file($caminho) ? json_decode((string) file_get_contents($caminho), true) : [];
        [$novo, $retorno] = $alterar(is_array($atual) ? $atual : []);
        if ($novo !== null) {
            $temporario = $caminho . '.tmp';
            file_put_contents($temporario, json_encode($novo, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_PRESERVE_ZERO_FRACTION));
            rename($temporario, $caminho);
        }
        return $retorno;
    } finally {
        flock($trava, LOCK_UN);
        fclose($trava);
    }
}

function ler_json(string $nome): array
{
    return com_arquivo($nome, fn ($atual) => [null, $atual]);
}

// Simulações: um arquivo por simulação em simulacoes/AAAA/MM/DD/HHMMSS-<id>.json.
const PASTA_SIMULACOES = 'simulacoes';

function gravar_json(string $caminho, array $dados): void
{
    $pasta = dirname($caminho);
    if (!is_dir($pasta)) mkdir($pasta, 0750, true);
    $temporario = $caminho . '.tmp';
    file_put_contents($temporario, json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_PRESERVE_ZERO_FRACTION));
    rename($temporario, $caminho);
}

function arquivo_simulacao(array $simulacao): string
{
    $quando = strtotime($simulacao['criado_em']);
    return DADOS . '/' . PASTA_SIMULACOES . '/' . date('Y/m/d', $quando) . '/' . date('His', $quando) . '-' . $simulacao['id'] . '.json';
}

function salvar_simulacao(array $simulacao): void
{
    gravar_json(arquivo_simulacao($simulacao), $simulacao);
}

function achar_simulacao(string $id): ?string
{
    if (!preg_match('/^[0-9a-f-]{36}$/', $id)) return null;
    return glob(DADOS . '/' . PASTA_SIMULACOES . "/*/*/*/*-$id.json")[0] ?? null;
}

function listar_simulacoes(): array
{
    migrar_leads_json();
    $lista = [];
    foreach (glob(DADOS . '/' . PASTA_SIMULACOES . '/*/*/*/*.json') ?: [] as $arquivo) {
        $s = json_decode((string) file_get_contents($arquivo), true);
        if (is_array($s)) $lista[] = $s;
    }
    return $lista;
}

// Leads gravados antes das pastas (um leads.json só): passa cada um para o seu arquivo e
// guarda o leads.json em anteriores/, sem apagar nada.
function migrar_leads_json(): void
{
    $antigo = DADOS . '/leads.json';
    if (!is_file($antigo)) return;
    com_arquivo('leads.json', function (array $leads) {
        foreach ($leads as $l) {
            if (is_array($l) && isset($l['id'], $l['criado_em']) && !achar_simulacao($l['id'])) salvar_simulacao($l);
        }
        return [null, null];
    });
    if (!is_dir(DADOS . '/anteriores')) mkdir(DADOS . '/anteriores', 0750, true);
    rename($antigo, DADOS . '/anteriores/leads-' . date('Ymd-His') . '.json');
}

// Tabela ativa: tabela.csv na pasta de dados. Na primeira vez copia a de exemplo do site.
function tabela(): array
{
    require_once __DIR__ . '/csv.php';
    $caminho = DADOS . '/tabela.csv';
    if (!is_file($caminho)) copy(__DIR__ . '/tabela-exemplo.csv', $caminho);
    return ler_csv((string) file_get_contents($caminho));
}

function ip_cliente(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';
}

// Janela de 60 s por IP e por grupo (api ou login).
function limitar(string $grupo = 'api', ?int $limite = null): void
{
    $limite ??= CONFIG['limite_por_minuto'];
    $pasta = DADOS . '/limite';
    if (!is_dir($pasta)) mkdir($pasta, 0750, true);
    $arquivo = $pasta . '/' . $grupo . '-' . sha1(ip_cliente()) . '.json';
    $agora = time();

    $h = fopen($arquivo, 'c+');
    flock($h, LOCK_EX);
    $marcas = json_decode(stream_get_contents($h) ?: '[]', true) ?: [];
    $marcas = array_values(array_filter($marcas, fn ($t) => $t > $agora - 60));
    $estourou = count($marcas) >= $limite;
    if (!$estourou) $marcas[] = $agora;
    ftruncate($h, 0);
    rewind($h);
    fwrite($h, json_encode($marcas));
    flock($h, LOCK_UN);
    fclose($h);

    if ($estourou) {
        header('Retry-After: 60');
        erro('muitas tentativas, aguarde um minuto', 429);
    }
}

function iniciar_sessao(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $pasta = DADOS . '/sessoes';
    if (!is_dir($pasta)) mkdir($pasta, 0750, true);
    session_save_path($pasta);
    session_name('simulador_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => ($_SERVER['HTTPS'] ?? '') !== '' && ($_SERVER['HTTPS'] ?? '') !== 'off',
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function exigir_admin(): void
{
    iniciar_sessao();
    if (empty($_SESSION['admin'])) erro('não autenticado', 401);
}

function uuid4(): string
{
    $b = random_bytes(16);
    $b[6] = chr(ord($b[6]) & 0x0f | 0x40);
    $b[8] = chr(ord($b[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}
