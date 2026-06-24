<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));
        $startDate = $month . '-01';
        $endDate = date('Y-m-t', strtotime($startDate));



        // Ventas totales (ingresos)
        $totalVentas = Venta::whereBetween('fecha', [$startDate, $endDate])
            ->where('estado_pedido', 'completado')
            ->sum(DB::raw('cantidad * precio_unitario'));

        // Pedidos completados
        $pedidosCompletados = Venta::whereBetween('fecha', [$startDate, $endDate])
            ->where('estado_pedido', 'completado')
            ->distinct('numero_pedido')
            ->count('numero_pedido');

        // Ganancia bruta
        $gananciaBruta = Venta::whereBetween('ventas.fecha', [$startDate, $endDate])
            ->join('productos', 'ventas.producto_codigo', '=', 'productos.codigo')
            ->selectRaw('SUM(ventas.cantidad * (ventas.precio_unitario - productos.costo)) as ganancia')
            ->value('ganancia') ?? 0;

        // Valor del inventario (stock * costo)
        $valorInventario = Producto::sum(DB::raw('stock_actual * costo'));

        // ============================================================
        // 2. LISTAS PARA TOOLTIP (productos sin stock y bajo stock)
        // ============================================================
        $productosSinStock = Producto::where('stock_actual', 0)
            ->select('codigo', 'nombre', 'stock_actual')
            ->orderBy('nombre')
            ->get();

        $productosBajoStock = Producto::where('stock_actual', '>', 0)
            ->where('stock_actual', '<', 10)
            ->select('codigo', 'nombre', 'stock_actual')
            ->orderBy('stock_actual')
            ->get();

        // ============================================================
        // 3. GRÁFICOS
        // ============================================================

        // Pastel: categorías más vendidas (unidades)
        $categoriasVendidas = Venta::whereBetween('ventas.fecha', [$startDate, $endDate])
            ->join('productos', 'ventas.producto_codigo', '=', 'productos.codigo')
            ->select('productos.categoria', DB::raw('SUM(ventas.cantidad) as total_vendido'))
            ->groupBy('productos.categoria')
            ->orderBy('total_vendido', 'desc')
            ->get();

        $graficoPastel = $categoriasVendidas->map(fn($item) => [
            'name' => $item->categoria ?? 'Sin categoría',
            'value' => $item->total_vendido
        ]);

        // Barras: ingresos por sector (clientes)
        $sectoresVentas = Venta::whereBetween('fecha', [$startDate, $endDate])
            ->select('sector', DB::raw('SUM(cantidad * precio_unitario) as total_ventas'))
            ->whereNotNull('sector')
            ->groupBy('sector')
            ->orderBy('total_ventas', 'desc')
            ->get();

        // Líneas: ventas diarias
        $ventasDiarias = Venta::select(
            DB::raw('DATE(fecha) as fecha'),
            DB::raw('SUM(cantidad * precio_unitario) as total')
        )
        ->whereBetween('fecha', [$startDate, $endDate])
        ->groupBy('fecha')
        ->orderBy('fecha', 'asc')
        ->get()
        ->map(fn($item) => [
            'fecha' => $item->fecha,
            'ventas' => round($item->total, 2)
        ]);

        // ============================================================
        // 4. RESPONSE JSON
        // ============================================================
        return response()->json([
            'mes' => $month,
            'indicadores' => [
                'total_ventas' => round($totalVentas, 2),
                'pedidos_completados' => $pedidosCompletados,
                'ganancia_bruta' => round($gananciaBruta, 2),
                'valor_inventario' => round($valorInventario, 2),
            ],
            'grafico_pastel' => $graficoPastel,
            'ventas_diarias' => $ventasDiarias,
            'sectores_ventas' => $sectoresVentas,
            'productos_sin_stock' => $productosSinStock,
            'productos_bajo_stock' => $productosBajoStock,
        ]);
    }
}