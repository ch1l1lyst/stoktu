<?php

namespace App\Http\Controllers;

use App\Models\Reposicion;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReposicionController extends Controller
{
    /**
     * Listar pedidos agrupados por pedido_id
     * - Filtra por usuario si es personal
     * - Incluye productos y proveedores con soft delete
     */
    public function listarPedidos()
    {
        $user = auth()->user();
        $query = Reposicion::with([
            'producto',
            'proveedor' => function ($q) {
                $q->withTrashed(); // incluir proveedores eliminados
            }
        ]);

        if ($user->rol === 'personal') {
            $query->where('solicitado_por', $user->id);
        }

        $lineas = $query->orderBy('created_at', 'desc')->get();

        $pedidos = $lineas->groupBy('pedido_id')->map(function ($grupo) {
            $primera = $grupo->first();

            // Filtrar líneas canceladas para cálculos
            $lineasActivas = $grupo->filter(fn($linea) => $linea->estado !== 'cancelado');

            // Calcular totales solo con líneas activas
            $totalSolicitado = $lineasActivas->sum('cantidad_solicitada');
            $totalRecibido = $lineasActivas->sum('cantidad_recibida');

            // Determinar estado del pedido basado en líneas activas
            $estadosActivos = $lineasActivas->pluck('estado')->unique();

            if ($lineasActivas->isEmpty()) {
                // Todas las líneas están canceladas
                $estadoPedido = 'cancelado';
            } elseif ($estadosActivos->contains('pendiente')) {
                $estadoPedido = 'pendiente';
            } elseif ($estadosActivos->count() === 1 && $estadosActivos->first() === 'recibido') {
                $estadoPedido = 'recibido';
            } else {
                // Mezcla de recibido y pendiente (si hay pendiente ya está cubierto)
                $estadoPedido = 'pendiente'; // fallback
            }

            return [
                'pedido_id'          => $primera->pedido_id,
                'fecha_pedido'       => $primera->fecha_pedido,
                'proveedor'          => $primera->proveedor?->nombre,
                'estado'             => $estadoPedido,
                'total_productos'    => $lineasActivas->count(), // solo activos
                'total_solicitado'   => $totalSolicitado,
                'total_recibido'     => $totalRecibido,
                'lineas'             => $grupo->map(function ($linea) {
                    return [
                        'id'                  => $linea->id,
                        'producto_codigo'     => $linea->producto_codigo,
                        'producto_nombre'     => $linea->producto?->nombre,
                        'cantidad_solicitada' => $linea->cantidad_solicitada,
                        'cantidad_recibida'   => $linea->cantidad_recibida,
                        'costo_unitario'      => $linea->costo_unitario,
                        'estado'              => $linea->estado,
                        'observaciones'       => $linea->observaciones,
                    ];
                })
            ];
        })->values();

        return response()->json($pedidos);
    }
    /**
     * Crear un pedido desde el carrito
     * - Genera un UUID para agrupar productos
     * - Crea líneas con estado 'pendiente'
     */
    public function crearDesdeCarrito(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.producto_codigo' => 'required|string|exists:productos,codigo',
            'items.*.cantidad' => 'required|integer|min:1',
        ]);

        $userId = auth()->id();
        $pedidoId = (string) Str::uuid();

        DB::beginTransaction();
        try {
            foreach ($request->items as $item) {
                $producto = Producto::findOrFail($item['producto_codigo']);

                Reposicion::create([
                    'pedido_id'           => $pedidoId,
                    'producto_codigo'     => $producto->codigo,
                    'proveedor_id'        => $producto->proveedor_id,
                    'cantidad_solicitada' => $item['cantidad'],
                    'cantidad_recibida'   => 0,
                    'costo_unitario'      => $producto->costo,
                    'fecha_pedido'        => now(),
                    'fecha_recepcion'     => null,
                    'estado'              => 'pendiente',
                    'observaciones'       => 'Pedido generado desde carrito',
                    'solicitado_por'      => $userId,
                    'recibido_por'        => null,
                ]);
            }
            DB::commit();

            return response()->json([
                'message'   => 'Pedido creado correctamente con ' . count($request->items) . ' productos',
                'pedido_id' => $pedidoId
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al crear el pedido: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Recibir una línea individual
     * - Actualiza cantidad recibida
     * - Ajusta stock del producto
     * - Cambia estado a 'recibido' si completa
     */
    public function recibirLinea(Request $request, $id)
    {
        $request->validate([
            'cantidad_recibida' => 'required|integer|min:0',
        ]);

        $linea = Reposicion::findOrFail($id);

        // Validar que no exceda lo solicitado
        if ($request->cantidad_recibida > $linea->cantidad_solicitada) {
            return response()->json(['error' => 'La cantidad recibida no puede ser mayor a la solicitada'], 400);
        }

        // Si la cantidad es igual, no hacemos nada
        if ($request->cantidad_recibida == $linea->cantidad_recibida) {
            return response()->json(['message' => 'No hay cambios en la cantidad recibida']);
        }

        DB::beginTransaction();
        try {
            $diferencia = $request->cantidad_recibida - $linea->cantidad_recibida;

            // Actualizar la línea
            $linea->cantidad_recibida = $request->cantidad_recibida;
            $linea->fecha_recepcion = now();
            // Si la cantidad recibida es igual o mayor a la solicitada, marcamos como recibido
            $linea->estado = ($request->cantidad_recibida >= $linea->cantidad_solicitada) ? 'recibido' : 'pendiente';
            $linea->recibido_por = auth()->id();
            $linea->save();

            // Actualizar stock con la diferencia
            $producto = Producto::findOrFail($linea->producto_codigo);
            $producto->stock_actual += $diferencia;
            $producto->save();

            DB::commit();

            return response()->json([
                'message' => 'Línea actualizada correctamente',
                'linea'   => $linea->fresh(['producto', 'proveedor'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al actualizar la línea: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Cancelar una línea individual
     * - Solo si no está recibida
     * - Guarda motivo en observaciones
     */
    public function cancelarLinea(Request $request, $id)
    {
        $request->validate([
            'motivo' => 'nullable|string|max:255',
        ]);

        $linea = Reposicion::findOrFail($id);

        if ($linea->estado === 'recibido') {
            return response()->json(['error' => 'No se puede cancelar una línea ya recibida'], 400);
        }

        $linea->estado = 'cancelado';
        if ($request->filled('motivo')) {
            $linea->observaciones = $request->motivo;
        }
        $linea->save();

        return response()->json([
            'message' => 'Línea cancelada',
            'linea'   => $linea->fresh(['producto', 'proveedor'])
        ]);
    }

    /**
     * Recibir todas las líneas de un pedido
     * - Aplica la misma cantidad a todas
     * - Actualiza stock de cada producto
     */
    public function recibirPedido(Request $request, $pedidoId)
    {
        $request->validate([
            'cantidad_recibida' => 'required|integer|min:0',
        ]);

        $lineas = Reposicion::where('pedido_id', $pedidoId)
            ->where('estado', 'pendiente')
            ->get();

        if ($lineas->isEmpty()) {
            return response()->json(['error' => 'No hay líneas pendientes en este pedido'], 400);
        }

        DB::beginTransaction();
        try {
            foreach ($lineas as $linea) {
                if ($request->cantidad_recibida > $linea->cantidad_solicitada) {
                    DB::rollBack();
                    return response()->json([
                        'error' => "La cantidad recibida excede lo solicitado para el producto {$linea->producto_codigo}"
                    ], 400);
                }

                $linea->cantidad_recibida = $request->cantidad_recibida;
                $linea->fecha_recepcion = now();
                $linea->estado = 'recibido';
                $linea->recibido_por = auth()->id();
                $linea->save();

                // Actualizar stock
                $producto = Producto::findOrFail($linea->producto_codigo);
                $producto->stock_actual += $request->cantidad_recibida;
                $producto->save();
            }
            DB::commit();

            return response()->json([
                'message' => 'Pedido recibido completamente',
                'lineas_actualizadas' => $lineas->count()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al recibir el pedido: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Cancelar todo un pedido
     * - Cancela todas las líneas pendientes
     * - No afecta el stock
     */
    public function cancelarPedido(Request $request, $pedidoId)
    {
        $request->validate([
            'motivo' => 'nullable|string|max:255',
        ]);

        $lineas = Reposicion::where('pedido_id', $pedidoId)
            ->whereIn('estado', ['pendiente', 'cancelado'])
            ->get();

        if ($lineas->isEmpty()) {
            return response()->json(['error' => 'No hay líneas pendientes o cancelables en este pedido'], 400);
        }

        DB::beginTransaction();
        try {
            foreach ($lineas as $linea) {
                if ($linea->estado !== 'recibido') {
                    $linea->estado = 'cancelado';
                    if ($request->filled('motivo')) {
                        $linea->observaciones = $request->motivo;
                    }
                    $linea->save();
                }
            }
            DB::commit();

            return response()->json([
                'message' => 'Pedido cancelado',
                'lineas_canceladas' => $lineas->count()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al cancelar el pedido: ' . $e->getMessage()], 500);
        }
    }
}