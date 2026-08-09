# Proyecto de Lenguajes de Programación Segundo Parcial

# Avance Backend — SQL to Graph (PHP)

Backend en PHP con autenticación por sesión y persistencia en CSV. Consume la API externa [MySQL Visual Explain](https://api.mysqlexplain.com) para generar los grafos.

## Requisitos

- PHP 8.1+ (con extensión `openssl` habilitada)

Verifica que tienes PHP:
```bash
php -v
php -m | grep -i openssl
```

Si `openssl` no aparece: edita tu `php.ini` (ubícalo con `php --ini`) y quita el `;` de la línea `;extension=openssl`.

### Instalar PHP si no lo tienes

**Windows (winget):**
```powershell
winget install -e --id PHP.PHP.8.3
```

**WSL2 / Linux:**
```bash
sudo apt update && sudo apt install -y php-cli
```

## Levantar el servidor

```bash
cd backend
php -S localhost:8000 index.php
```

Déjalo corriendo. El servidor queda en `http://localhost:8000`.

> Los archivos `backend/storage/*.csv` se generan solos en tu primera ejecución. No se suben al repo (están en `.gitignore`) — cada quien tiene los suyos localmente.

## Probar los endpoints

### Opción A — PowerShell (Windows)

Ejecuta todo **en la misma pestaña de terminal** (las variables no se comparten entre pestañas):

```powershell
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Registro
Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/register" -Method Post -ContentType "application/json" -Body '{"name":"Tu Nombre","email":"tu@espol.edu.ec","password":"secret123"}'

# 2. Login
Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/login" -Method Post -ContentType "application/json" -Body '{"email":"tu@espol.edu.ec","password":"secret123"}'

# 3. Perfil actual (confirma que la sesión quedó activa)
Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/me" -Method Get

# 4. Generar grafo (POST /api/queries)
$body = @{
    query        = "SELECT * FROM actor WHERE first_name = ?"
    version      = "8.0.32"
    explain_json = '{"query_block":{"select_id":1}}'
    explain_tree = ""
} | ConvertTo-Json

Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/queries" -Method Post -ContentType "application/json" -Body $body

# 5. Historial (GET /api/queries)
Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/queries" -Method Get

# 6. Logout
Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/logout" -Method Post
```

### Opción B — curl (WSL2 / Mac / Linux / Git Bash)

```bash
# 1. Registro
curl -i -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Tu Nombre","email":"tu@espol.edu.ec","password":"secret123"}'

# 2. Login (guarda cookie de sesión en cookies.txt)
curl -i -X POST http://localhost:8000/api/login -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@espol.edu.ec","password":"secret123"}'

# 3. Perfil actual
curl -i http://localhost:8000/api/me -b cookies.txt

# 4. Generar grafo
curl -i -X POST http://localhost:8000/api/queries -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT * FROM actor WHERE first_name = ?","version":"8.0.32","explain_json":"{\"query_block\":{\"select_id\":1}}","explain_tree":""}'

# 5. Historial
curl -i http://localhost:8000/api/queries -b cookies.txt

# 6. Logout
curl -i -X POST http://localhost:8000/api/logout -b cookies.txt
```

## Endpoints disponibles

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/register` | No | Crea usuario |
| POST | `/api/login` | No | Inicia sesión |
| POST | `/api/logout` | Sí | Cierra sesión |
| GET | `/api/me` | Sí | Perfil del usuario actual |
| POST | `/api/queries` | Sí | Genera grafo (proxy a MySQL Explain API) y lo guarda |
| GET | `/api/queries` | Sí | Historial de consultas del usuario |
| GET | `/api/queries/{id}` | Sí | Detalle de una consulta puntual |
