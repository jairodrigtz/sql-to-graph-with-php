<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/QueryController.php';
require_once __DIR__ . '/controllers/FavoriteController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/') ?: '/';

$auth = new AuthController();
$queries = new QueryController();
$favorites = new FavoriteController();

switch (true) {
    case $uri === '/api/register' && $method === 'POST':
        $auth->register(); break;
    case $uri === '/api/login' && $method === 'POST':
        $auth->login(); break;
    case $uri === '/api/logout' && $method === 'POST':
        $auth->logout(); break;
    case $uri === '/api/me' && $method === 'GET':
        $auth->me(); break;
    case $uri === '/api/queries' && $method === 'POST':
        $queries->create(); break;
    case $uri === '/api/queries' && $method === 'GET':
        $queries->list(); break;
    case (bool)preg_match('#^/api/queries/(\d+)$#', $uri, $m) && $method === 'GET':
        $queries->show((int)$m[1]); break;
    case $uri === '/api/favorites' && $method === 'POST':
        $favorites->create(); break;
    case $uri === '/api/favorites' && $method === 'GET':
        $favorites->list(); break;
    case (bool)preg_match('#^/api/favorites/(\d+)$#', $uri, $m) && $method === 'DELETE':
        $favorites->delete((int)$m[1]); break;
    default:
        json_response(['error' => 'not_found', 'message' => "Ruta $uri no encontrada"], 404);
}