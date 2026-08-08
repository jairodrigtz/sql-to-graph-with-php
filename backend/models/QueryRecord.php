<?php
require_once __DIR__ . '/../helpers/csv.php';

class QueryRecord {
    const HEADER = ['id', 'user_id', 'query', 'version', 'explain_json', 'explain_tree', 'graph_url', 'created_at'];

    public static function create(int $userId, string $query, string $version, string $explainJson, string $explainTree, string $graphUrl): array {
        $id = csv_next_id(QUERIES_CSV);
        $createdAt = date('c');
        csv_append_row(QUERIES_CSV, [$id, $userId, $query, $version, $explainJson, $explainTree, $graphUrl, $createdAt], self::HEADER);
        return compact('id', 'userId', 'query', 'version', 'graphUrl', 'createdAt');
    }

    public static function listByUser(int $userId): array {
        $rows = array_values(array_filter(
            csv_read_all(QUERIES_CSV),
            fn($r) => (int)$r['user_id'] === $userId
        ));
        usort($rows, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));
        return $rows;
    }
}