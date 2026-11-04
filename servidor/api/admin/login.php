<?php
// POST /api/admin/login { usuario, senha } · GET devolve se está logado · DELETE sai.
require dirname(__DIR__) . '/_lib/base.php';

$metodo = exigir_metodo('GET', 'POST', 'DELETE');
iniciar_sessao();

if ($metodo === 'GET') {
    if (empty($_SESSION['admin'])) erro('não autenticado', 401);
    responder(['usuario' => $_SESSION['admin']]);
}

if ($metodo === 'DELETE') {
    $_SESSION = [];
    session_destroy();
    responder(['ok' => true]);
}

// 5 tentativas por minuto por IP contra chute de senha.
limitar('login', 5);
$d = corpo_json();
$usuario = is_string($d['usuario'] ?? null) ? trim($d['usuario']) : '';
$senha = is_string($d['senha'] ?? null) ? $d['senha'] : '';

if (!hash_equals(CONFIG['admin_usuario'], $usuario) || !hash_equals(CONFIG['admin_senha'], $senha)) {
    erro('usuário ou senha incorretos', 401);
}

session_regenerate_id(true);
$_SESSION['admin'] = $usuario;
responder(['usuario' => $usuario]);
