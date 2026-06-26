<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Reposicion;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class InventarioController extends Controller
{
    // ---------- LISTADO Y DETALLE ----------
    public function index()
    {
        try {
            $productos = Producto::with('proveedor')->get();
            $resultado = $productos->map(fn($p) => $this->enriquecerProducto($p));
            return response()->json($resultado);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($codigo)
    {
        $producto = Producto::with('proveedor')->findOrFail($codigo);
        return response()->json($this->enriquecerProducto($producto));
    }

    // ---------- RESUMEN ----------
    public function resumen()
    {
        $totalProductos = Producto::count();
        $stockBajo = Producto::where('stock_actual', '<', 10)->count();
        $sinStock = Producto::where('stock_actual', 0)->count();
        $valorInventario = Producto::sum(DB::raw('stock_actual * precio'));

        // Rotación: suma de cantidades vendidas en últimos 30 días
        $rotacion = DB::table('ventas')
            ->where('fecha', '>=', now()->subDays(30))
            ->sum('cantidad');

        // Top 3 más vendidos este mes
        $topVendidos = Venta::select('producto_codigo', DB::raw('SUM(cantidad) as total_vendido'))
            ->whereYear('fecha', now()->year)
            ->whereMonth('fecha', now()->month)
            ->groupBy('producto_codigo')
            ->orderBy('total_vendido', 'desc')
            ->limit(3)
            ->with('producto:codigo,nombre')
            ->get()
            ->map(fn($item) => [
                'codigo' => $item->producto_codigo,
                'nombre' => $item->producto?->nombre,
                'total_vendido' => $item->total_vendido,
            ]);

        return response()->json([
            'total_productos' => $totalProductos,
            'productos_stock_bajo' => $stockBajo,
            'valor_total_inventario' => round($valorInventario, 2),
            'rotacion_ultimos_30_dias' => $rotacion,
            'productos_sin_stock' => $sinStock,
            'top_vendidos_mes' => $topVendidos,
        ]);
    }

    // ---------- CRUD DE PRODUCTOS (con soporte para imagen URL o archivo) ----------
    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:20|unique:productos,codigo',
            'nombre' => 'required|string|max:150',
            'categoria' => 'nullable|string|max:50',
            'stock_actual' => 'required|integer|min:0',
            'costo' => 'required|numeric|min:0',
            'precio' => 'required|numeric|min:0',
            'imagen' => 'nullable',
            'proveedor_id' => 'required|string|max:20|exists:proveedores,id',
        ]);

        $imagenUrl = null;
        if ($request->hasFile('imagen')) {
            $file = $request->file('imagen');
            $carpeta = $request->categoria ? strtolower($request->categoria) : 'otros';
            $nombre = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs("images/productos/{$carpeta}", $nombre, 'public');
            $imagenUrl = Storage::url($path);
        } elseif ($request->filled('imagen')) {
            $imagenUrl = $request->input('imagen');
        }

        $producto = Producto::create([
            'codigo' => $validated['codigo'],
            'nombre' => $validated['nombre'],
            'categoria' => $validated['categoria'],
            'stock_actual' => $validated['stock_actual'],
            'costo' => $validated['costo'],
            'precio' => $validated['precio'],
            'imagen' => $imagenUrl,
            'proveedor_id' => $validated['proveedor_id'],
        ]);

        return response()->json(['message' => 'Producto creado', 'producto' => $producto], 201);
    }

    public function update(Request $request, $codigo)
    {
        $producto = Producto::findOrFail($codigo);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:150',
            'categoria' => 'nullable|string|max:50',
            'stock_actual' => 'sometimes|required|integer|min:0',
            'costo' => 'sometimes|required|numeric|min:0',
            'precio' => 'sometimes|required|numeric|min:0',
            'imagen' => 'nullable',
            'proveedor_id' => 'sometimes|required|string|max:20|exists:proveedores,id',
        ]);

        if ($request->hasFile('imagen')) {
            if ($producto->imagen && !filter_var($producto->imagen, FILTER_VALIDATE_URL)) {
                $oldPath = str_replace('/storage/', '', $producto->imagen);
                Storage::disk('public')->delete($oldPath);
            }
            $file = $request->file('imagen');
            $carpeta = $request->categoria ?: ($producto->categoria ?: 'otros');
            $carpeta = strtolower($carpeta);
            $nombre = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs("images/productos/{$carpeta}", $nombre, 'public');
            $validated['imagen'] = Storage::url($path);
        } elseif ($request->filled('imagen')) {
            $validated['imagen'] = $request->input('imagen');
        } else {
            unset($validated['imagen']);
        }

        $producto->update($validated);
        return response()->json(['message' => 'Producto actualizado', 'producto' => $producto]);
    }

    public function destroy($codigo)
    {
        $producto = Producto::findOrFail($codigo);
        if ($producto->imagen && !filter_var($producto->imagen, FILTER_VALIDATE_URL)) {
            $path = str_replace('/storage/', '', $producto->imagen);
            Storage::disk('public')->delete($path);
        }
        $producto->delete();
        return response()->json(['message' => 'Producto eliminado']);
    }

    // ---------- MÉTODO PRIVADO PARA ENRIQUECER PRODUCTO ----------
    private function enriquecerProducto($producto)
    {
        $ultimaReposicion = Reposicion::where('producto_codigo', $producto->codigo)
            ->orderBy('fecha_pedido', 'desc')
            ->first();

        $stockBajo = $producto->stock_actual < 10;

        return [
            'producto' => [
                'codigo' => $producto->codigo,
                'nombre' => $producto->nombre,
                'imagen' => $producto->imagen,
                'categoria' => $producto->categoria,
                'stock_actual' => $producto->stock_actual,
                'precio' => $producto->precio,
                'costo' => $producto->costo,
                'proveedor' => $producto->proveedor?->nombre,
                'proveedor_id' => $producto->proveedor_id,
            ],
            'ultima_reposicion' => $ultimaReposicion ? [
                'fecha_pedido' => $ultimaReposicion->fecha_pedido->format('Y-m-d'),
                'fecha_recepcion' => $ultimaReposicion->fecha_recepcion?->format('Y-m-d'),
                'cantidad_solicitada' => $ultimaReposicion->cantidad_solicitada,
                'cantidad_recibida' => $ultimaReposicion->cantidad_recibida,
                'estado' => $ultimaReposicion->estado,
                'proveedor' => $ultimaReposicion->proveedor?->nombre,
            ] : null,
            'stock_bajo' => $stockBajo,
        ];
    }
}