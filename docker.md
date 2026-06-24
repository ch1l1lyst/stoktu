¡Perfecto, bro! Aquí tienes tu **Cheatsheet Docker** con la misma onda que los anteriores: práctico, con historia y todo lo que necesitas para dominar el tema. Te explico desde cómo empezar hasta cómo automatizar tus imágenes con GitHub Actions, todo con el toque profesional.

---

## 🐳 **CHEATSHEET DOCKER: LA HISTORIA COMPLETA**

### 📌 **1. ¿POR QUÉ DOCKER?**

Docker te permite empaquetar tu aplicación (código + entorno) en un contenedor que funciona igual en cualquier máquina. Esto evita el clásico _"en mi máquina funciona"_.

Para un proyecto como Stoktu (Laravel + React + MySQL), Docker es ideal porque:

- **Reproducibilidad**: tu compañera tendrá el mismo entorno que tú.
- **Aislamiento**: cada servicio corre en su propio contenedor sin interferir.
- **Portabilidad**: puedes mover el sistema a cualquier servidor con Docker instalado.

---

### 📌 **2. ¿CÓMO EMPEZAR? (EL FLUJO COMPLETO)**

#### 🧑‍💻 **TÚ (DESARROLLADOR)**

1. **Tienes el código en GitHub** (backend y frontend).
2. **Creas Dockerfiles** para cada servicio (backend, frontend).
3. **Construyes las imágenes localmente** y las pruebas.
4. **Subes las imágenes a Docker Hub** (públicas o privadas).
5. **Configuras GitHub Actions** para que, cada vez que hagas `push`, las imágenes se construyan y suban automáticamente.
6. **Compartes un `docker-compose.yml`** que referencia tus imágenes en Docker Hub.

#### 👩‍💻 **TU COMPAÑERA (USUARIO FINAL)**

1. **Instala Docker Desktop** (en su máquina).
2. **Crea una carpeta** y guarda el `docker-compose.yml` que le diste.
3. **Ejecuta `docker-compose up -d`** y el sistema corre automáticamente (Docker descarga las imágenes desde Docker Hub).

---

### 📌 **3. CREAR LOS DOCKERFILES (EJEMPLO)**

#### 📁 **backend/Dockerfile**

```dockerfile
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

#### 📁 **frontend/Dockerfile**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

---

### 📌 **4. SUBIR LAS IMÁGENES A DOCKER HUB (MANUAL)**

```bash
# 1. Construir
docker build -t ch1l1lyst/stoktu-backend:latest ./backend
docker build -t ch1l1lyst/stoktu-frontend:latest ./frontend

# 2. Subir
docker login
docker push ch1l1lyst/stoktu-backend:latest
docker push ch1l1lyst/stoktu-frontend:latest
```

> **Nota:** Si tu repositorio es privado, tu compañera necesitará hacer `docker login` con sus credenciales para descargar las imágenes. Para simplificar, hazlas públicas.

---

### 📌 **5. AUTOMATIZAR CON GITHUB ACTIONS (LO PROFESIONAL)**

Esto evita que tengas que hacer `docker build` y `docker push` cada vez que cambias el código.

#### 🔐 **PASO 1: Crear un token de acceso en Docker Hub**

1. Ve a [hub.docker.com](https://hub.docker.com) → Settings → Security → New Access Token.
2. Dale un nombre (ej. `github-actions`) y genera el token.
3. **Copia el token** (no podrás verlo después).

#### 🔐 **PASO 2: Agregar secrets en GitHub**

Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions → New repository secret.

- Crea `DOCKER_USERNAME` → tu usuario de Docker Hub (`ch1l1lyst`).
- Crea `DOCKER_PASSWORD` → el token que copiaste.

#### 📁 **PASO 3: Crear el workflow en `.github/workflows/docker-build.yml`**

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main, staging] # o la rama que uses

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

**¿Qué hace?** Cada vez que hagas `git push` a `main` o `staging`, GitHub Actions:

- Clona el repositorio.
- Construye las imágenes usando los Dockerfiles.
- Sube las imágenes a Docker Hub usando el token (que está en los secrets).

---

### 📌 **6. EL DOCKER-COMPOSE.YML (PARA TU COMPAÑERA)**

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

### 📌 **7. BUENAS PRÁCTICAS (PARA SER PROFESIONAL)**

| Práctica                                      | ¿Por qué?                                                             |
| --------------------------------------------- | --------------------------------------------------------------------- |
| **Usa imágenes oficiales** (php, node, mysql) | Son mantenidas y seguras.                                             |
| **No uses `latest` en producción**            | Mejor usa versiones específicas (ej. `php:8.2-cli`).                  |
| **Minimiza capas en Dockerfiles**             | Agrupa comandos `RUN` para reducir tamaño.                            |
| **Usa `.dockerignore`**                       | Evita enviar archivos innecesarios (node_modules, vendor).            |
| **Versiona tus imágenes**                     | Usa tags como `v1.0.0`, no solo `latest`.                             |
| **No guardes secrets en las imágenes**        | Usa variables de entorno en tiempo de ejecución.                      |
| **Healthcheck en la base de datos**           | Asegura que MySQL esté listo antes de que Laravel intente conectarse. |

---

### 📌 **8. COMANDOS ÚTILES PARA EL DÍA A DÍA**

| Comando                            | Qué hace                                             |
| ---------------------------------- | ---------------------------------------------------- |
| `docker-compose up -d`             | Levanta todo en segundo plano.                       |
| `docker-compose down -v`           | Detiene y elimina contenedores y volúmenes.          |
| `docker-compose logs -f backend`   | Ve los logs del backend en tiempo real.              |
| `docker-compose exec backend bash` | Entra al contenedor del backend.                     |
| `docker images`                    | Lista imágenes locales.                              |
| `docker system prune -a`           | Limpia imágenes, contenedores y volúmenes no usados. |

---

### 📌 **9. ¿QUÉ HACER SI CAMBIA EL CÓDIGO?**

- **Si usas GitHub Actions**: solo haz `git push` y las imágenes se actualizan automáticamente.
- **Si no usas automatización**: `docker build` y `docker push` manualmente, y tu compañera hace `docker pull` y `docker-compose up -d` (o `docker-compose down` y `up -d` de nuevo).

---

### 📌 **10. FRASE CLAVE**

> **"Docker + GitHub Actions = despliegue automático y profesional. Tu compañera solo necesita el `docker-compose.yml`."**

---

## 🎯 **RESUMEN EN 5 PASOS**

1. **Crea Dockerfiles** para backend y frontend.
2. **Construye y sube imágenes a Docker Hub** (o configura GitHub Actions para que lo haga automáticamente).
3. **Crea el `docker-compose.yml`** con tus imágenes.
4. **Envía el archivo a tu compañera**.
5. **Ella ejecuta `docker-compose up -d`** y el sistema está corriendo.

---

## 💬 **FRASE PARA RECORDAR**

> **"La automatización con GitHub Actions es lo que separa a un desarrollador amateur de uno profesional. Haz que tu código se construya solo."** 😎🐳🚀

Stop-Process -Name 'Docker Desktop' -Force -ErrorAction SilentlyContinue
Stop-Process -Name 'com.docker.backend' -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
