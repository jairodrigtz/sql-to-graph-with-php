<?php
require_once __DIR__ . '/../helpers/csv.php';

class User {
    const HEADER = ['id', 'name', 'email', 'password_hash', 'created_at'];

    public static function findByEmail(string $email): ?array {
        foreach (csv_read_all(USERS_CSV) as $u) {
            if (strtolower($u['email']) === strtolower($email)) return $u;
        }
        return null;
    }

    public static function findById(int $id): ?array {
        foreach (csv_read_all(USERS_CSV) as $u) {
            if ((int)$u['id'] === $id) return $u;
        }
        return null;
    }

    public static function create(string $name, string $email, string $password): array {
        if (self::findByEmail($email)) {
            throw new RuntimeException('El correo ya está registrado.');
        }
        $id = csv_next_id(USERS_CSV);
        csv_append_row(USERS_CSV, [
            $id, $name, $email, password_hash($password, PASSWORD_DEFAULT), date('c'),
        ], self::HEADER);
        return ['id' => $id, 'name' => $name, 'email' => $email];
    }

    public static function verifyPassword(array $user, string $password): bool {
        return password_verify($password, $user['password_hash']);
    }
}