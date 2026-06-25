# Docker Cheatsheet — La Historia Completa

**Stoktu · Laravel + React + MySQL · de cero a producción**

---

## ¿Por qué Docker?

Docker empaqueta tu aplicación (código + entorno) en un **contenedor** que funciona exactamente igual en cualquier máquina. Elimina el clásico _"en mi máquina funciona"_.

- **Reproducibilidad**
- **Aislamiento**
- **Portabilidad**

---

## El flujo completo

```
👨‍💻 Tú (desarrollador)
    Código en GitHub
    → Dockerfiles
    → Build local
    → Push a Docker Hub
    → GitHub Actions (automático)
    → docker-compose.yml

👩‍💻 Tu compañera (usuario final)
    Instala Docker Desktop
    → Crea carpeta
    → Guarda docker-compose.yml
    → docker-compose up -d
```

> **Nota:** Docker descarga las imágenes desde Docker Hub automáticamente. Ella no necesita el código ni los Dockerfiles.

---

## 1. Crear los Dockerfiles

### Backend (`backend/Dockerfile`)

```dockerfile
# PHP 8.2 con todas las extensiones necesarias para Laravel
FROM php:8.2-cli

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    git unzip libpng-dev libonig-dev libxml2-dev zip curl \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install --no-interaction --optimize-autoloader

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

### Frontend (`frontend/Dockerfile`)

```dockerfile
# Node 18 liviano con Alpine para React/Vite
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

---

## 2. Subir imágenes a Docker Hub (manual)

```bash
# 1. Construir las imágenes
docker build -t ch1l1lyst/stoktu-backend:latest ./backend
docker build -t ch1l1lyst/stoktu-frontend:latest ./frontend

# 2. Autenticarse y subir
docker login
docker push ch1l1lyst/stoktu-backend:latest
docker push ch1l1lyst/stoktu-frontend:latest
```

> **Repos privados:** tu compañera necesita hacer `docker login` antes de bajar las imágenes. Para simplificar, hazlas públicas en Docker Hub.

---

## 3. Automatizar con GitHub Actions (lo profesional)

Cada vez que hagas `git push`, GitHub construye y sube las imágenes automáticamente.

### Paso 1 — Crear token en Docker Hub

- Ve a [hub.docker.com](https://hub.docker.com) → Settings → Security → New Access Token.
- Cópialo (no podrás verlo de nuevo).

### Paso 2 — Agregar secrets en GitHub

- Repositorio → Settings → Secrets and variables → Actions → New repository secret.

| Secret            | Valor                                      |
| ----------------- | ------------------------------------------ |
| `DOCKER_USERNAME` | Tu usuario de Docker Hub (ej. `ch1l1lyst`) |
| `DOCKER_PASSWORD` | El token que generaste                     |

### Paso 3 — Workflow

`.github/workflows/docker-build.yml`

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main, staging]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Backend
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./backend/Dockerfile
          push: true
          tags: ch1l1lyst/stoktu-backend:latest

      - name: Build and push Frontend
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./frontend/Dockerfile
          push: true
          tags: ch1l1lyst/stoktu-frontend:latest
```

---

## 4. ¿Qué hacer cuando Actions actualiza la imagen?

GitHub Actions sube la nueva imagen a Docker Hub, pero tu contenedor local sigue corriendo la versión vieja. Tienes que bajarla y reiniciar.

### Opción A — Actualización completa (recomendado)

Detiene todo, baja las nuevas imágenes y vuelve a levantar.

```bash
# Parar los contenedores
docker-compose down

# Bajar las imágenes nuevas desde Docker Hub
docker-compose pull

# Levantar con las imágenes actualizadas
docker-compose up -d
```

### Opción B — Un solo comando (más rápido)

```bash
docker-compose pull && docker-compose up -d
```

> **Ojo:** si usas volúmenes persistentes (como la base de datos), `docker-compose down` **NO** borra los datos. Solo `docker-compose down -v` los borra.

### Opción C — Solo un servicio

Si solo cambió el backend, no hace falta reiniciar todo.

```bash
docker-compose pull backend
docker-compose up -d --no-deps backend
```

### ¿Cómo saber si hay imagen nueva disponible?

```bash
# Ver qué imagen está corriendo actualmente
docker inspect stoktu-backend --format '{{.Image}}'

# Comparar con la que está en Docker Hub (hace pull sin aplicar)
docker pull ch1l1lyst/stoktu-backend:latest
```

Si el pull dice `Status: Image is up to date` → ya tienes la última.  
Si dice `Pull complete` → había una versión nueva.

---

## 5. `docker-compose.yml` — para tu compañera

```yaml
version: "3.8"

services:
  db:
    image: mysql:8
    container_name: stoktu-db
    restart: unless-stopped
    ports:
      - "3306:3306"
    environment:
      - MYSQL_DATABASE=stoktu
      - MYSQL_USER=stoktu_user
      - MYSQL_PASSWORD=secret
      - MYSQL_ROOT_PASSWORD=root
    volumes:
      - dbdata:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-proot"]
      interval: 5s
      timeout: 3s
      retries: 20

  backend:
    image: ch1l1lyst/stoktu-backend:latest
    container_name: stoktu-backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=local
      - APP_DEBUG=true
      - APP_URL=http://localhost:8000
      - DB_CONNECTION=mysql
      - DB_HOST=db
      - DB_PORT=3306
      - DB_DATABASE=stoktu
      - DB_USERNAME=stoktu_user
      - DB_PASSWORD=secret
    depends_on:
      db:
        condition: service_healthy

  frontend:
    image: ch1l1lyst/stoktu-frontend:latest
    container_name: stoktu-frontend
    restart: unless-stopped
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8000/api
    depends_on:
      - backend

volumes:
  dbdata:
```

---

## Comandos del día a día

| Comando                            | Qué hace                                         |
| ---------------------------------- | ------------------------------------------------ |
| `docker-compose up -d`             | Levanta todo en segundo plano                    |
| `docker-compose down`              | Detiene y elimina contenedores                   |
| `docker-compose down -v`           | Detiene, elimina contenedores y volúmenes        |
| `docker-compose pull`              | Baja las imágenes más recientes desde Docker Hub |
| `docker-compose logs -f backend`   | Logs del backend en tiempo real                  |
| `docker-compose exec backend bash` | Entra al contenedor del backend                  |
| `docker images`                    | Lista todas las imágenes locales                 |
| `docker system prune -a -f`        | Limpia imágenes, contenedores y caché no usados  |
| `docker image prune -a -f`         | Solo elimina imágenes no usadas                  |
| `docker volume prune -f`           | Elimina volúmenes huérfanos                      |
| `docker rmi <IMAGE_ID>`            | Elimina una imagen específica                    |

> **Recuerda:** las imágenes antiguas no se borran solas. Haz `docker system prune -a -f` cada cierto tiempo para liberar espacio.

---

## Buenas prácticas

| Práctica                        | ¿Por qué?                                                 |
| ------------------------------- | --------------------------------------------------------- |
| Usa imágenes oficiales          | Son mantenidas y seguras (php, node, mysql)               |
| No uses `latest` en producción  | Mejor versiones específicas como `php:8.2-cli`            |
| Minimiza capas en Dockerfiles   | Agrupa comandos `RUN` para reducir tamaño                 |
| Usa `.dockerignore`             | Evita enviar `node_modules` y `vendor` al build           |
| Versiona tus imágenes           | Usa tags como `v1.0.0`, no solo `latest`                  |
| No guardes secrets en imágenes  | Usa variables de entorno en tiempo de ejecución           |
| Healthcheck en la base de datos | Asegura que MySQL esté listo antes de que Laravel conecte |

---

## Errores comunes y soluciones

### ❌ Docker Desktop no arranca (Windows)

Si Docker dice que hay procesos corriendo o se cuelga al iniciar, ejecutar esto en PowerShell como administrador:

```powershell
Stop-Process -Name 'Docker Desktop' -Force -ErrorAction SilentlyContinue
Stop-Process -Name 'com.docker.backend' -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### ❌ Contenedor corre imagen vieja después de un push

GitHub Actions subió la imagen nueva pero el contenedor local sigue usando la anterior. Solución:

```bash
docker-compose pull && docker-compose up -d
```

### ❌ MySQL no está listo cuando Laravel intenta conectar

Por eso el `healthcheck` en el servicio `db` es clave. El backend no arranca hasta que MySQL responda al ping.

```yaml
depends_on:
  db:
    condition: service_healthy
```

### ❌ Disco lleno por imágenes acumuladas

Cada build genera una imagen nueva. Las anteriores quedan como `<none>` y ocupan espacio. Limpiar:

```bash
# Limpieza completa (contenedores, imágenes, redes, caché)
docker system prune -a -f

# Solo imágenes sin tag (las "basura")
docker images -f "dangling=true" -q | xargs docker rmi
```

---

## Resumen en 5 pasos

1. **Crea los Dockerfile** para backend y frontend.
2. **Configura GitHub Actions** para que construya y suba las imágenes automáticamente.
3. **Crea el `docker-compose.yml`** con las imágenes de Docker Hub.
4. Cuando haya cambios: **`docker-compose pull && docker-compose up -d`**.
5. Tu compañera solo necesita el `docker-compose.yml` y correr ese mismo comando.

---

> **"Docker + GitHub Actions = despliegue automático y profesional. Tu compañera solo necesita el docker-compose.yml."** 🐳🚀
