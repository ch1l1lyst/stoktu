<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReposicionesSeeder extends Seeder
{
    public function run()
    {
        $personalId = $this->getOrCreateUser('personal');
        $gerenciaId = $this->getOrCreateUser('gerencia');

        // Excluir los 5 productos nuevos (sin stock)
        $excluir = ['PT999', 'PT998', 'PT997', 'PT996', 'PT995'];

        // Obtener todos los productos (excepto los excluidos)
        $productos = DB::table('productos')
            ->whereNotIn('codigo', $excluir)
            ->select('codigo', 'costo', 'proveedor_id')
            ->get();

        if ($productos->isEmpty()) {
            $this->command->error('No hay productos para procesar.');
            return;
        }

        // Calcular demanda total por producto (de las ventas)
        $demandas = DB::table('ventas')
            ->select('producto_codigo', DB::raw('SUM(cantidad) as total_vendido'))
            ->groupBy('producto_codigo')
            ->pluck('total_vendido', 'producto_codigo')
            ->toArray();

        // Meses disponibles
        $meses = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];

        // Lista de productos con alta demanda (los que más se venden)
        $altaDemanda = [
            'PT039', 'PT019', 'PT082', 'PT013', 'PT030',
            'PT029', 'PT022', 'PT005', 'PT017', 'PT033',
            'PT031', 'PT089', 'PT035', 'PT004', 'PT006',
            'PT020', 'PT021', 'PT007', 'PT009', 'PT008',
            'PT002', 'PT083', 'PT025', 'PT112', 'PT015',
            'PT016', 'PT011', 'PT047', 'PT048'
        ];

        $items = [];

        foreach ($productos as $producto) {
            $codigo = $producto->codigo;
            $demanda = $demandas[$codigo] ?? 0;
            $esAlta = in_array($codigo, $altaDemanda);

            // Stock objetivo: 300% de la demanda (triple), mínimo 200 unidades
            $stockObjetivo = max(ceil($demanda * 3), 200);

            // Número de reposiciones: 4-6 para alta demanda, 3-5 para el resto
            if ($esAlta) {
                $numRepos = rand(4, 6);
            } else {
                $numRepos = rand(3, 5);
            }

            $base = floor($stockObjetivo / $numRepos);
            $sobrante = $stockObjetivo - ($base * $numRepos);

            for ($i = 0; $i < $numRepos; $i++) {
                $extra = ($i < $sobrante) ? 1 : 0;
                $cantidad = $base + $extra + rand(-10, 20);
                $cantidad = max(40, $cantidad); // nunca menos de 40

                $mes = $meses[array_rand($meses)];
                $dia = rand(1, 25);
                $fechaPedido = date('Y-m-d H:i:s', strtotime("$mes-" . str_pad($dia, 2, '0', STR_PAD_LEFT) . " 10:00:00"));

                $cantidadRecibida = rand(ceil($cantidad * 0.90), $cantidad);

                $items[] = [
                    'producto' => $producto,
                    'fecha_pedido' => $fechaPedido,
                    'cantidad_solicitada' => $cantidad,
                    'cantidad_recibida' => $cantidadRecibida,
                    'observaciones' => ($cantidadRecibida < $cantidad) ? "Faltaron " . ($cantidad - $cantidadRecibida) . " unidades" : null,
                ];
            }
        }

        // Mezclar items para distribución aleatoria
        shuffle($items);

        // Agrupar en pedidos de 2 a 4 productos
        $reposiciones = [];

        while (count($items) > 0) {
            $tamanoLote = rand(2, 4);
            if (count($items) < $tamanoLote) {
                $tamanoLote = count($items);
            }

            $lote = array_splice($items, 0, $tamanoLote);
            $pedidoId = (string) Str::uuid();

            foreach ($lote as $item) {
                $fechaRecepcion = date('Y-m-d H:i:s', strtotime($item['fecha_pedido'] . " + " . rand(5, 12) . " days"));

                $reposiciones[] = [
                    'pedido_id' => $pedidoId,
                    'producto_codigo' => $item['producto']->codigo,
                    'proveedor_id' => $item['producto']->proveedor_id,
                    'cantidad_solicitada' => $item['cantidad_solicitada'],
                    'cantidad_recibida' => $item['cantidad_recibida'],
                    'costo_unitario' => $item['producto']->costo,
                    'fecha_pedido' => $item['fecha_pedido'],
                    'fecha_recepcion' => $fechaRecepcion,
                    'estado' => 'recibido',
                    'observaciones' => $item['observaciones'],
                    'solicitado_por' => $personalId,
                    'recibido_por' => $gerenciaId,
                    'created_at' => $item['fecha_pedido'],
                    'updated_at' => $item['fecha_pedido'],
                ];
            }
        }

        // Insertar reposiciones y actualizar stock
        foreach ($reposiciones as $repo) {
            DB::table('reposiciones')->insert($repo);
            DB::table('productos')
                ->where('codigo', $repo['producto_codigo'])
                ->increment('stock_actual', $repo['cantidad_recibida']);
        }

        // Verificar stock final
        $sinStock = DB::table('productos')
            ->whereNotIn('codigo', $excluir)
            ->where('stock_actual', 0)
            ->count();


        // Mostrar resumen de los 5 productos más vendidos
        $topVentas = DB::table('ventas')
            ->select('producto_codigo', DB::raw('SUM(cantidad) as total'))
            ->groupBy('producto_codigo')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->pluck('producto_codigo')
            ->toArray();

        $resumenStock = DB::table('productos')
            ->whereIn('codigo', $topVentas)
            ->select('codigo', 'stock_actual')
            ->get();

    }

    private function getOrCreateUser($rol)
    {
        $user = DB::table('users')->where('rol', $rol)->first();
        if ($user) {
            return $user->id;
        }

        return DB::table('users')->insertGetId([
            'name' => ucfirst($rol),
            'email' => $rol . '@example.com',
            'password' => bcrypt('password'),
            'rol' => $rol,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}