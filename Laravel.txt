¡Perfecto, bro! Ahora sí, vamos a darle una **historia y contexto** a todo esto. Actuaré como tu profesor particular, explicándote **por qué hacemos cada cosa** y en **qué orden**, conectando cada paso con el anterior.

---

## 🎓 **CLASE MAGISTRAL: Cómo construir un sistema completo con Laravel + React (Sanctum)**

### 📌 **1. LA IDEA Y EL PLAN**

Antes de escribir una sola línea de código, necesitas tener claro:

- **¿Qué problema resuelve tu sistema?** (ej. control de inventario, gestión de ventas, etc.)
- **¿Quiénes lo van a usar?** (roles: administrador, vendedor, cliente, etc.)
- **¿Qué datos vas a manejar?** (productos, ventas, usuarios, etc.)
- **¿Cómo se relacionan esos datos?** (un producto pertenece a una categoría, una venta tiene muchos productos, etc.)

> **Esto es como el plano de una casa. No empiezas a construir paredes sin saber cuántos cuartos va a tener.**

En Stoktu, por ejemplo, definimos:
- **Roles**: personal (bodega) y gerencia (dashboard).
- **Tablas principales**: productos, proveedores, ventas, reposiciones, usuarios.
- **Relaciones**: un producto pertenece a un proveedor, una venta tiene un producto, etc.

---

### 📌 **2. EL ENTORNO DE DESARROLLO**

Primero, instalas Laravel y configuras el entorno. Esto es como preparar tu taller antes de empezar a construir.

```bash
composer create-project laravel/laravel backend
cd backend
php artisan key:generate
```

**¿Por qué `.env`?** Porque ahí guardas las configuraciones que cambian según el entorno (base de datos, URLs, etc.). No quieres poner contraseñas en el código.

**.env – variables esenciales** (siempre las primeras que tocas):
```env
DB_DATABASE=mi_base
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173  # para que el frontend pueda enviar cookies
SESSION_DOMAIN=localhost
```

---

### 📌 **3. AUTENTICACIÓN CON SANCTUM (LA PUERTA DE ENTRADA)**

Laravel Sanctum es el que maneja las sesiones de usuario. Sin él, no podrías identificar quién está haciendo cada petición.

```bash
composer require laravel/sanctum
php artisan vendor:publish --tag=sanctum-migrations
php artisan migrate
```

**¿Por qué con cookies y no con tokens?** Porque las cookies HttpOnly son más seguras (el frontend no puede leerlas) y funcionan bien con el `withCredentials` de Axios.

**config/cors.php**: esto permite que el frontend (React) pueda comunicarse con el backend sin problemas de seguridad (CORS).
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'supports_credentials' => true,
'allowed_origins' => ['http://localhost:5173'],
```

---

### 📌 **4. MIGRACIONES (LAS TABLAS DE LA BASE DE DATOS)**

Ahora toca crear las tablas. Las migraciones son como el **plano de la base de datos**: defines cómo se van a guardar los datos y cómo se relacionan.

```bash
php artisan make:migration create_productos_table
```

**Ejemplo de una migración completa:**
```php
Schema::create('productos', function (Blueprint $table) {
    $table->string('codigo', 20)->primary(); // clave primaria personalizada
    $table->string('nombre');
    $table->integer('stock')->default(0);
    $table->foreignId('categoria_id')->constrained(); // clave foránea
    $table->softDeletes(); // para no borrar datos, solo marcarlos como eliminados
    $table->timestamps(); // created_at y updated_at
});
```

**¿Por qué `softDeletes()`?** Porque en los sistemas reales nunca quieres perder información. Si eliminas un producto, luego no puedes saber qué ventas tuvo. Con `softDeletes`, solo lo ocultas.

Ejecutas las migraciones con:
```bash
php artisan migrate
```

---

### 📌 **5. MODELOS (LAS RELACIONES ENTRE TABLAS)**

Los modelos son la representación de las tablas en código. Aquí defines cómo se conectan entre sí.

```bash
php artisan make:model Producto
```

**¿Qué pones en un modelo?**
- `$fillable`: los campos que se pueden llenar masivamente (para protección contra asignación masiva).
- `$primaryKey`, `$keyType`, `$incrementing`: si tu clave primaria no es un `id` autoincremental.
- **Relaciones**: `belongsTo`, `hasMany`, `belongsToMany`.

**Ejemplo:**
```php
class Producto extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'codigo';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['codigo', 'nombre', 'stock', 'categoria_id'];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }
}
```

> **Regla de oro:** Siempre define `$fillable`. Si no, Laravel no te dejará guardar datos masivamente.

---

### 📌 **6. SEEDERS Y FACTORIES (DATOS DE PRUEBA)**

No puedes probar tu sistema sin datos. Los seeders y factories te crean datos falsos pero realistas.

```bash
php artisan make:seeder ProductosSeeder
php artisan make:factory ProductoFactory
```

**Factory**: define cómo se genera un producto falso.
```php
public function definition()
{
    return [
        'codigo' => $this->faker->unique()->bothify('??###'),
        'nombre' => $this->faker->word,
        'stock' => rand(10, 100),
    ];
}
```

**Seeder**: usa la factory para crear 50 productos.
```php
Producto::factory()->count(50)->create();
```

**Ejecuta**: `php artisan db:seed --class=ProductosSeeder`

> **Esto es clave para desarrollo.** Sin datos, no puedes probar tus endpoints ni tu frontend.

---

### 📌 **7. CONTROLADORES (LA LÓGICA DE NEGOCIO)**

Los controladores son los que manejan las peticiones HTTP. Cada uno se encarga de una entidad (productos, ventas, usuarios).

```bash
php artisan make:controller API/ProductoController --api
```

**Los 5 métodos básicos de un controlador API:**
- `index()`: listar todos los recursos.
- `store()`: crear uno nuevo.
- `show()`: mostrar uno específico.
- `update()`: actualizar uno.
- `destroy()`: eliminar uno.

**Siempre valida los datos** antes de guardarlos:
```php
public function store(Request $request)
{
    $validated = $request->validate([
        'nombre' => 'required|string|max:255',
        'precio' => 'required|numeric|min:0',
    ]);
    return Producto::create($validated);
}
```

**¿Por qué validar en el backend?** Porque el frontend puede ser manipulado. La seguridad va siempre en el servidor.

---

### 📌 **8. RUTAS (LOS ENDPOINTS DE LA API)**

Las rutas son la puerta de entrada a tu backend. Aquí decides qué URL llama a qué controlador.

```php
// En routes/api.php
Route::post('/login', [AuthController::class, 'login']); // pública
Route::post('/register', [AuthController::class, 'register']); // pública

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('productos', ProductoController::class); // CRUD automático
});
```

**`apiResource`** genera todas las rutas CRUD de una sola vez.

---

### 📌 **9. AUTENTICACIÓN Y MIDDLEWARE DE ROLES**

El login devuelve el usuario autenticado. Con Sanctum, la sesión se mantiene con cookies.

**AuthController – login:**
```php
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Credenciales incorrectas'], 401);
    }

    $user = Auth::user();
    return response()->json(['user' => $user]);
}
```

**Middleware de roles (CheckRole):** controla qué usuarios pueden acceder a ciertas rutas.

```bash
php artisan make:middleware CheckRole
```

```php
public function handle(Request $request, Closure $next, ...$roles)
{
    if (!auth()->check()) {
        return response()->json(['message' => 'No autenticado'], 401);
    }
    if (!in_array(auth()->user()->rol, $roles)) {
        return response()->json(['message' => 'No autorizado'], 403);
    }
    return $next($request);
}
```

**Registrar en Kernel.php** y usar en rutas:
```php
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('role:gerencia');
```

---

### 📌 **10. MANEJO DE ARCHIVOS (IMÁGENES)**

Las imágenes se guardan en el sistema de archivos y se enlazan a la carpeta pública.

```bash
php artisan storage:link  # crea un enlace simbólico desde public/storage a storage/app/public
```

**Guardar imagen:**
```php
if ($request->hasFile('imagen')) {
    $path = $request->file('imagen')->store('productos', 'public');
    $url = Storage::url($path);
}
```

**Eliminar imagen:**
```php
Storage::disk('public')->delete(str_replace('/storage/', '', $producto->imagen));
```

---

### 📌 **11. FRONTEND (REACT + VITE)**

El frontend se comunica con el backend a través de Axios. Configuras `withCredentials: true` para que envíe las cookies de sesión.

**Axios:**
```js
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});
```

**Contexto de autenticación:**
```jsx
const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    setUser(res.data.user);
};
```

**Variables de entorno (frontend):** guardas la URL de la API para que sea fácil de cambiar según el entorno.
```env
VITE_API_URL=http://localhost:8000/api
```
