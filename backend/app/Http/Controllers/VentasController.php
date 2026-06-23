<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use Illuminate\Http\Request; 

class VentasController extends Controller
{
    public function index(Request $request)
    {
        $query = Venta::query()
            ->join('users', 'ventas.vendedor_id', '=', 'users.id')
            ->select('ventas.*', 'users.name as vendedor_nombre') 
            ->with('producto') 
            ->orderBy('ventas.fecha', 'desc');

        // Filtro por mes
        if ($request->has('month') && $request->month != '') {
            $month = $request->month;
            $query->whereYear('ventas.fecha', substr($month, 0, 4))
                ->whereMonth('ventas.fecha', substr($month, 5, 2));
        }

        // Búsqueda
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('ventas.numero_pedido', 'LIKE', "%$search%")
                ->orWhere('ventas.cliente', 'LIKE', "%$search%")
                ->orWhere('users.name', 'LIKE', "%$search%")
                ->orWhereHas('producto', function($p) use ($search) {
                    $p->where('nombre', 'LIKE', "%$search%")
                        ->orWhere('codigo', 'LIKE', "%$search%");
                });
            });
        }

        $ventas = $query->paginate(10);

        return response()->json($ventas);
    }
}