<?php
ini_set('display_errors', '0'); // no mostrar errores en el body de la api
error_reporting(E_ALL);

const ALLOWED_ORIGIN = 'http://localhost:5173';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === ALLOWED_ORIGIN) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'samesite' => 'Lax']);
session_start();

define('STORAGE_DIR', __DIR__ . '/storage');
if (!is_dir(STORAGE_DIR)) {
    mkdir(STORAGE_DIR, 0777, true);
}
define('USERS_CSV', STORAGE_DIR . '/users.csv');
define('QUERIES_CSV', STORAGE_DIR . '/queries.csv');
define('FAVORITES_CSV', STORAGE_DIR . '/favorites.csv');

function get_json_body(): array {
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

function json_response($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}