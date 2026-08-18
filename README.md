# SQL to Graph — Proyecto de Lenguajes de Programación (2do Parcial)

Aplicación web para visualizar planes de ejecución de MySQL (`EXPLAIN`) como grafos. Frontend en React + Vite, backend en PHP puro con sesiones y persistencia en CSV (sin base de datos). Consume la API externa [MySQL Visual Explain](https://api.mysqlexplain.com) para generar los grafos.

## Requisitos

| Herramienta | Versión mínima | Para qué |
|---|---|---|
| PHP | 8.1+ (con extensión `openssl` habilitada) | Backend |
| Node.js | 20.19+ o 22.12+ | Frontend (lo exige Vite 7) |
| npm | Incluido con Node | Instalar dependencias del frontend |

Verifica lo que tienes instalado:
```bash
php -v
php -m | grep -i openssl
node -v
npm -v
```

Si no tienes PHP:
```bash
# Windows (winget)
winget install -e --id PHP.PHP.8.3

# WSL2 / Linux
sudo apt update && sudo apt install -y php-cli
```
Si `openssl` no aparece en `php -m`: edita tu `php.ini` (ubícalo con `php --ini`) y quita el `;` de `;extension=openssl`.

Si no tienes Node, descárgalo desde [nodejs.org](https://nodejs.org/) (versión LTS 20 o 22).

## Librerías del proyecto (se instalan solas con `npm install`)

**Dependencias:**
- `react` ^19.1.0
- `react-dom` ^19.1.0
- `axios` ^1.11.0
- `tailwindcss` ^4.1.11
- `@tailwindcss/vite` ^4.1.11

**Dependencias de desarrollo:**
- `vite` ^7.0.4
- `@vitejs/plugin-react` ^4.6.0
- `eslint` ^9.30.1 (+ plugins de React)

## Ejecución local

Necesitas **dos terminales abiertas al mismo tiempo** (backend y frontend corren por separado).

### 1. Backend (PHP)

```bash
cd backend
php -S localhost:8000 index.php
```

Déjalo corriendo. Backend disponible en `http://localhost:8000`.


### 2. Frontend (React)

En otra terminal, desde la raíz del proyecto:

```bash
npm install
npm run dev
```

Frontend disponible en `http://localhost:5173`.


## Probar la aplicación completa (frontend)

1. Abre `http://localhost:5173`.
2. Regístrate con nombre, correo y contraseña (mín. 6 caracteres).
3. Inicia sesión.
4. Pega una consulta SQL y el resultado de `EXPLAIN FORMAT=JSON` (opcionalmente también `EXPLAIN FORMAT=TREE`).
5. Genera el grafo — se muestra embebido en pantalla.
6. Márcalo como favorito y revisa la sección de favoritos.
7. Cierra sesión desde el botón correspondiente.

## Probar solo el backend (sin frontend)

Útil para depurar o para que cada integrante valide su parte por separado.

### PowerShell (Windows)

Ejecuta todo **en la misma pestaña de terminal**:

```powershell
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/register" -Method Post -ContentType "application/json" -Body '{"name":"Tu Nombre","email":"tu@espol.edu.ec","password":"secret123"}'

Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/login" -Method Post -ContentType "application/json" -Body '{"email":"tu@espol.edu.ec","password":"secret123"}'

Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/me" -Method Get

$body = @{
    query        = "SELECT * FROM actor WHERE first_name = ?"
    version      = "8.0.32"
    explain_json = '{"query_block":{"select_id":1}}'
    explain_tree = ""
} | ConvertTo-Json
Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/queries" -Method Post -ContentType "application/json" -Body $body

Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/queries" -Method Get

Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/favorites" -Method Post -ContentType "application/json" -Body '{"query_id":1}'

Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/favorites" -Method Get

Invoke-RestMethod -WebSession $session -Uri "http://localhost:8000/api/logout" -Method Post
```

### curl (WSL2 / Mac / Linux / Git Bash)

```bash
curl -i -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Tu Nombre","email":"tu@espol.edu.ec","password":"secret123"}'

curl -i -X POST http://localhost:8000/api/login -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@espol.edu.ec","password":"secret123"}'

curl -i http://localhost:8000/api/me -b cookies.txt

curl -i -X POST http://localhost:8000/api/queries -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT * FROM actor WHERE first_name = ?","version":"8.0.32","explain_json":"{\"query_block\":{\"select_id\":1}}","explain_tree":""}'

curl -i http://localhost:8000/api/queries -b cookies.txt

curl -i -X POST http://localhost:8000/api/favorites -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"query_id":1}'

curl -i http://localhost:8000/api/favorites -b cookies.txt

curl -i -X POST http://localhost:8000/api/logout -b cookies.txt
```

### Postman

Crea una colección con los mismos requests — Postman guarda las cookies de sesión automáticamente por dominio, solo ejecútalos en orden.

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
| POST | `/api/favorites` | Sí | Marca una consulta (`query_id`) como favorita |
| GET | `/api/favorites` | Sí | Lista los favoritos del usuario |
| DELETE | `/api/favorites/{id}` | Sí | Quita una consulta de favoritos |

## Estructura del proyecto

```
proyecto/
├── src/                  # Frontend React
├── public/
├── backend/
│   ├── index.php         # Router / front controller
│   ├── config.php        # CORS, sesiones, storage
│   ├── controllers/
│   ├── models/
│   ├── helpers/
│   └── storage/          # users.csv, queries.csv, favorites.csv (se generan solos)
├── package.json
└── vite.config.js
```