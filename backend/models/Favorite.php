<?php
require_once __DIR__ . '/../helpers/csv.php';

class Favorite {
    const HEADER = ['id', 'user_id', 'query_id', 'created_at'];

    public static function create(int $userId, int $queryId): array {
        foreach (self::listByUser($userId) as $f) {
            if ((int)$f['query_id'] === $queryId) {
                throw new RuntimeException('Esta consulta ya está en tus favoritos.');
            }
        }

        $id = csv_next_id(FAVORITES_CSV);
        $createdAt = date('c');
        csv_append_row(FAVORITES_CSV, [$id, $userId, $queryId, $createdAt], self::HEADER);
        return ['id' => $id, 'user_id' => $userId, 'query_id' => $queryId, 'created_at' => $createdAt];
    }

    public static function listByUser(int $userId): array {
        $rows = array_values(array_filter(
            csv_read_all(FAVORITES_CSV),
            fn($r) => (int)$r['user_id'] === $userId
        ));
        usort($rows, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));
        return $rows;
    }

    public static function find(int $userId, int $favoriteId): ?array {
        foreach (self::listByUser($userId) as $f) {
            if ((int)$f['id'] === $favoriteId) return $f;
        }
        return null;
    }

    public static function delete(int $userId, int $favoriteId): bool {
        if (!self::find($userId, $favoriteId)) return false;
        return csv_delete_row(FAVORITES_CSV, $favoriteId);
    }
}
