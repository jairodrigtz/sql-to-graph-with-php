<?php
require_once __DIR__ . '/AuthController.php';
require_once __DIR__ . '/../models/Favorite.php';
require_once __DIR__ . '/../models/QueryRecord.php';

class FavoriteController {
    public function create(): void {
        $userId = AuthController::requireAuth();
        $body = get_json_body();
        $queryId = (int)($body['query_id'] ?? 0);

        if ($queryId <= 0) {
            json_response(['error' => 'validation_error', 'message' => 'query_id es obligatorio.'], 422);
        }

        $query = self::findOwnedQuery($userId, $queryId);
        if (!$query) {
            json_response(['error' => 'not_found', 'message' => 'La consulta indicada no existe o no te pertenece.'], 404);
        }

        try {
            $favorite = Favorite::create($userId, $queryId);
        } catch (RuntimeException $e) {
            json_response(['error' => 'conflict', 'message' => $e->getMessage()], 409);
        }

        json_response(['message' => 'Consulta añadida a favoritos.', 'favorite' => $favorite], 201);
    }

    public function list(): void {
        $userId = AuthController::requireAuth();

        $queriesById = [];
        foreach (QueryRecord::listByUser($userId) as $r) {
            $queriesById[(int)$r['id']] = $r;
        }

        $favorites = array_map(function (array $f) use ($queriesById) {
            $f['query'] = $queriesById[(int)$f['query_id']] ?? null;
            return $f;
        }, Favorite::listByUser($userId));

        json_response(['favorites' => $favorites]);
    }

    public function delete(int $id): void {
        $userId = AuthController::requireAuth();
        if (!Favorite::delete($userId, $id)) {
            json_response(['error' => 'not_found', 'message' => 'Favorito no encontrado.'], 404);
        }
        json_response(['message' => 'Favorito eliminado.']);
    }

    private static function findOwnedQuery(int $userId, int $queryId): ?array {
        foreach (QueryRecord::listByUser($userId) as $r) {
            if ((int)$r['id'] === $queryId) return $r;
        }
        return null;
    }
}
