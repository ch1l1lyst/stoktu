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

        // Obtener productos normales (todos excepto los excluidos)
        $productosNormales = DB::table('productos')
            ->whereNotIn('codigo', $excluir)
            ->select('codigo', 'costo', 'proveedor_id')
            ->get();

        // Obtener los productos excluidos
        $productosExcluidos = DB::table('productos')
            ->whereIn('codigo', $excluir)
            ->select('codigo', 'costo', 'proveedor_id')
            ->get();

        // Si no hay productos, salir
        if ($productosNormales->isEmpty() && $productosExcluidos->isEmpty()) {
            $this->command->error('No hay productos para procesar.');
            return;
        }

        // Meses disponibles
        $meses = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];

        // Total de reposiciones para productos normales: 200
        $totalReposNormales = 200;
        $numProductosNormales = $productosNormales->count();

        // Lista donde guardaremos todos los items (reposiciones individuales)
        $items = [];

        // --- Reposiciones para productos normales (distribución equitativa de 200) ---
        if ($numProductosNormales > 0) {
            // Calcular cuántas reposiciones por producto (base)
            $base = floor($totalReposNormales / $numProductosNormales);
            $sobrante = $totalReposNormales - ($base * $numProductosNormales);

            // Asignar a cada producto una cantidad base, y los primeros 'sobrante' productos reciben una extra
            $reposPorProducto = array_fill(0, $numProductosNormales, $base);
            for ($i = 0; $i < $sobrante; $i++) {
                $reposPorProducto[$i]++;
            }

            // Mezclar los productos para que la asignación extra sea aleatoria
            $productosNormalesArray = $productosNormales->toArray();
            shuffle($productosNormalesArray);

            foreach ($productosNormalesArray as $index => $producto) {
                $numRepos = $reposPorProducto[$index];
                for ($i = 0; $i < $numRepos; $i++) {
                    // Cantidad aleatoria entre 40 y 100
                    $cantidad = rand(40, 100);
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
        }

        // --- Reposiciones para los 5 productos excluidos: 10 cada uno ---
        foreach ($productosExcluidos as $producto) {
            for ($i = 0; $i < 10; $i++) {
                $cantidad = rand(40, 100);
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

        // Mezclar todos los items para que los pedidos sean variados
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

        // Mostrar resumen
        $this->command->info('Reposiciones generadas: ' . count($reposiciones));
        $this->command->info('Stock actualizado correctamente.');
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