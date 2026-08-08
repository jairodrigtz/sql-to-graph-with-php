<?php
require_once __DIR__ . '/../models/User.php';

class AuthController {
    public function register(): void {
        $body = get_json_body();
        $name = trim($body['name'] ?? '');
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        if ($name === '' || $email === '' || $password === '') {
            json_response(['error' => 'validation_error', 'message' => 'Nombre, correo y contraseña son obligatorios.'], 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            json_response(['error' => 'validation_error', 'message' => 'Correo inválido.'], 422);
        }
        if (strlen($password) < 6) {
            json_response(['error' => 'validation_error', 'message' => 'La contraseña debe tener mínimo 6 caracteres.'], 422);
        }

        try {
            $user = User::create($name, $email, $password);
        } catch (RuntimeException $e) {
            json_response(['error' => 'conflict', 'message' => $e->getMessage()], 409);
        }
        json_response(['message' => 'Usuario registrado correctamente.', 'user' => $user], 201);
    }

    public function login(): void {
        $body = get_json_body();
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        $user = User::findByEmail($email);
        if (!$user || !User::verifyPassword($user, $password)) {
            json_response(['error' => 'invalid_credentials', 'message' => 'Correo o contraseña incorrectos.'], 401);
        }

        $_SESSION['user_id'] = (int)$user['id'];
        json_response(['message' => 'Sesión iniciada.', 'user' => ['id' => (int)$user['id'], 'name' => $user['name'], 'email' => $user['email']]]);
    }

    public function logout(): void {
        $_SESSION = [];
        session_destroy();
        json_response(['message' => 'Sesión cerrada.']);
    }

    public function me(): void {
        $userId = self::requireAuth();
        $user = User::findById($userId);
        json_response(['user' => ['id' => (int)$user['id'], 'name' => $user['name'], 'email' => $user['email']]]);
    }

    public static function requireAuth(): int {
        if (empty($_SESSION['user_id'])) {
            json_response(['error' => 'unauthorized', 'message' => 'Debes iniciar sesión.'], 401);
        }
        return (int)$_SESSION['user_id'];
    }
}