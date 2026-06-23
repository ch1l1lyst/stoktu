<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImportacionController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\ReposicionController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\VentasController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Proveedores
    Route::apiResource('proveedores', ProveedorController::class);
    Route::post('/proveedores/{id}/restore', [ProveedorController::class, 'restore']);
    Route::delete('/proveedores/{id}/force', [ProveedorController::class, 'forceDelete']);

    // Inventario
    Route::get('/inventario', [InventarioController::class, 'index']);
    Route::get('/inventario/resumen', [InventarioController::class, 'resumen']);
    Route::get('/inventario/exactitud', [InventarioController::class, 'exactitud']);
    Route::post('/inventario', [InventarioController::class, 'store']);
    Route::get('/inventario/{codigo}', [InventarioController::class, 'show']);
    Route::put('/inventario/{codigo}', [InventarioController::class, 'update']);
    Route::delete('/inventario/{codigo}', [InventarioController::class, 'destroy']);
    Route::post('/inventario/{codigo}/ajustar', [InventarioController::class, 'ajustar']);

    // Ventas - Importación
    Route::post('/ventas/import/validate', [ImportacionController::class, 'validateImport']);
    Route::post('/ventas/import', [ImportacionController::class, 'import']);
    Route::get('/importaciones', [ImportacionController::class, 'index']);

    // Reposiciones (Pedidos)
    Route::get('/pedidos', [ReposicionController::class, 'listarPedidos']);
    Route::post('/desde-carrito', [ReposicionController::class, 'crearDesdeCarrito']);
    Route::post('/linea/{id}/recibir', [ReposicionController::class, 'recibirLinea']);
    Route::post('/linea/{id}/cancelar', [ReposicionController::class, 'cancelarLinea']);
    Route::post('/pedido/{pedidoId}/recibir', [ReposicionController::class, 'recibirPedido']);
    Route::post('/pedido/{pedidoId}/cancelar', [ReposicionController::class, 'cancelarPedido']);

    // ====== RUTAS DE GERENCIA ======
    Route::middleware('role:gerencia')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/ventas', [VentasController::class, 'index']);
        Route::apiResource('users', UsersController::class);
        Route::post('/users/{id}/restore', [UsersController::class, 'restore']);
        Route::post('/users/{id}/password', [UsersController::class, 'updatePassword']);
        Route::delete('/users/{id}/force', [UsersController::class, 'forceDelete']);
    });
});