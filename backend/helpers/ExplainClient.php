<?php
function call_mysql_explain_api(array $payload): array {
    $url = 'https://api.mysqlexplain.com/v2/explains';

    $context = stream_context_create([
        'http' => [
            'method'        => 'POST',
            'header'        => "Content-Type: application/json\r\nUser-Agent: LP-EquipoJRC/1.0\r\n",
            'content'       => json_encode($payload),
            'ignore_errors' => true,
            'timeout'       => 15,
        ],
    ]);

    $result = @file_get_contents($url, false, $context);

    $headers = function_exists('http_get_last_response_headers')
        ? (http_get_last_response_headers() ?? [])
        : ($http_response_header ?? []);

    $status = 502;
    if (isset($headers[0]) && preg_match('/\d{3}/', $headers[0], $m)) {
        $status = (int)$m[0];
    }

    if ($result === false) {
        return ['status' => 502, 'body' => ['error' => 'bad_gateway', 'message' => 'No se pudo contactar la API de MySQL Explain.']];
    }

    return ['status' => $status, 'body' => json_decode($result, true) ?? ['raw' => $result]];
}