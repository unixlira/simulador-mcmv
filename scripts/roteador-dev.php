<?php
// Roteador do servidor embutido do PHP para desenvolvimento (faz o papel do .htaccess):
//   php -S localhost:8000 -t servidor scripts/roteador-dev.php
$caminho = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$raiz = $_SERVER['DOCUMENT_ROOT'];

if (preg_match('#^/(api/_lib|_dados)(/|$)#', $caminho)) {
    http_response_code(403);
    return true;
}
if (preg_match('#^/api/((?:admin/)?[a-z-]+)/?$#', $caminho, $m) && is_file("$raiz/api/{$m[1]}.php")) {
    require "$raiz/api/{$m[1]}.php";
    return true;
}
return false;
