¡Excelente pregunta, bro! Las imágenes antiguas **no se eliminan solas**, se quedan ahí ocupando espacio en tu disco. Docker las acumula cada vez que construyes una nueva versión, especialmente con el tag `latest`, porque no las reemplaza, solo crea una nueva y la anterior queda como `untagged` (con nombre `<none>`).

---

## 🧹 **CÓMO ELIMINAR IMÁGENES ANTIGUAS Y BASURA DE DOCKER**

### ✅ **Limpieza completa (lo más usado)**

```bash
docker system prune -a -f
```

Esto elimina:

- Contenedores detenidos
- Redes no usadas
- Imágenes colgantes (las que quedan sin tag)
- Caché de build

### ✅ **Solo imágenes no usadas**

```bash
docker image prune -a -f
```

Elimina todas las imágenes que no estén siendo usadas por ningún contenedor.

### ✅ **Eliminar volúmenes huérfanos**

```bash
docker volume prune -f
```

Elimina volúmenes que no están siendo usados por ningún contenedor.

### ✅ **Eliminar una imagen específica**

```bash
# Listar imágenes para ver los IDs
docker images

# Eliminar una en específico
docker rmi <IMAGE_ID>
```

### ✅ **Eliminar todas las imágenes sin tag (las "basura")**

```bash
docker images -f "dangling=true" -q | xargs docker rmi
```

---

## 🔄 **RECOMENDACIÓN PARA EL CHEATSHEET**

Agrega esto en la sección **"Comandos útiles para el día a día"** o en **"Errores comunes y soluciones"**.

```markdown
| Comando                     | Qué hace                                           |
| --------------------------- | -------------------------------------------------- |
| `docker system prune -a -f` | Limpia todo: contenedores, imágenes, redes, caché. |
| `docker image prune -a -f`  | Elimina imágenes no usadas.                        |
| `docker volume prune -f`    | Elimina volúmenes no usados.                       |
| `docker image prune -f`     | Eliminar todas las imágenes sin tag (las "basura") |
| `docker images`             | Lista todas las imágenes locales.                  |
| `docker rmi <ID>`           | Elimina una imagen específica.                     |
```

---

## 💬 **FRASE CLAVE**

> **"Las imágenes antiguas no se borran solas. Haz `docker system prune -a -f` cada cierto tiempo para liberar espacio."** 😎🐳

¿Quieres que integre esto en tu cheatsheet completo? Dímelo y te lo actualizo. 🚀
