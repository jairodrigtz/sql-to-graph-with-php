<?php
require_once __DIR__ . '/AuthController.php';
require_once __DIR__ . '/../models/QueryRecord.php';
require_once __DIR__ . '/../helpers/ExplainClient.php';

class QueryController {
    // Requerimiento: "Generar análisis de una consulta SQL"
    public function create(): void {
        $userId = AuthController::requireAuth();
        $body = get_json_body();

        $query = trim($body['query'] ?? '');
        $version = trim($body['version'] ?? '8.0.32');
        $explainJson = trim($body['explain_json'] ?? '');
        $explainTree = trim($body['explain_tree'] ?? '');

        if ($query === '' || $explainJson === '') {
            json_response(['error' => 'validation_error', 'message' => 'query y explain_json son obligatorios.'], 422);
        }

        $result = call_mysql_explain_api([
            'query' => $query, 'version' => $version,
            'explain_json' => $explainJson, 'explain_tree' => $explainTree,
        ]);

        if ($result['status'] !== 200 || empty($result['body']['url'])) {
            json_response([
                'error' => 'explain_api_error',
                'message' => 'La API de MySQL Explain rechazó la consulta.',
                'details' => $result['body'],
            ], $result['status'] ?: 502);
        }

        $record = QueryRecord::create($userId, $query, $version, $explainJson, $explainTree, $result['body']['url']);
        json_response(['message' => 'Grafo generado correctamente.', 'result' => $record], 201);
    }

    // Requerimiento: "Visualizar planes de ejecución analizados" (historial completo)
    public function list(): void {
        $userId = AuthController::requireAuth();
        json_response(['queries' => QueryRecord::listByUser($userId)]);
    }

    // Requerimiento: "Visualizar planes de ejecución analizados" (uno puntual)
    public function show(int $id): void {
        $userId = AuthController::requireAuth();
        $query = QueryRecord::findByIdAndUserId($id, $userId);
        if ($query) {
            json_response(['query' => $query]);
        }
        json_response(['error' => 'not_found', 'message' => 'Consulta no encontrada.'], 404);
    }
}
