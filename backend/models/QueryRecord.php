<?php
require_once __DIR__ . '/../helpers/csv.php';

class QueryRecord {
    const HEADER = ['id', 'user_id', 'query', 'version', 'explain_json', 'explain_tree', 'graph_url', 'created_at'];

    public static function create(int $userId, string $query, string $version, string $explainJson, string $explainTree, string $graphUrl): array {
        $id = csv_next_id(QUERIES_CSV);
        $createdAt = date('c');

        csv_append_row(QUERIES_CSV, [
            $id,
            $userId,
            csv_escape_multiline($query),
            $version,
            csv_escape_multiline($explainJson),
            csv_escape_multiline($explainTree),
            $graphUrl,
            $createdAt,
        ], self::HEADER);

        return [
            'id' => $id,
            'user_id' => $userId,
            'query' => $query,
            'version' => $version,
            'explain_json' => $explainJson,
            'explain_tree' => $explainTree,
            'graph_url' => $graphUrl,
            'created_at' => $createdAt,
        ];
    }

    public static function listByUser(int $userId): array {
        $rows = array_values(array_filter(
            csv_read_all(QUERIES_CSV),
            fn($r) => (int)$r['user_id'] === $userId
        ));
        usort($rows, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));
        return array_map([self::class, 'hydrate'], $rows);
    }

    public static function findByIdAndUserId(int $id, int $userId): ?array {
        foreach (self::listByUser($userId) as $row) {
            if ((int)$row['id'] === $id) return $row;
        }
        return null;
    }

    private static function hydrate(array $row): array {
        $row['query'] = csv_restore_multiline($row['query']);
        $row['explain_json'] = csv_restore_multiline($row['explain_json']);
        $row['explain_tree'] = csv_restore_multiline($row['explain_tree']);
        return $row;
    }
}