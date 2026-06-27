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

        // Obtener TODOS los productos (sin exclusiones)
        $productos = DB::table('productos')
            ->select('codigo', 'costo', 'proveedor_id', 'stock_actual')
            ->get();

        if ($productos->isEmpty()) {
            $this->command->error('No hay productos para procesar.');
            return;
        }

        $stockObjetivo = 250;
        $meses = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
        $reposiciones = [];

        foreach ($productos as $producto) {
            // Calcular cuánto falta para llegar al objetivo (250 - stock_actual)
            $faltante = max(0, $stockObjetivo - $producto->stock_actual);

            // Si el stock ya es mayor o igual al objetivo, no generar reposiciones
            if ($faltante <= 0) {
                continue;
            }

            // Decidir cuántas reposiciones hacer (2-4 pedidos)
            $numRepos = rand(2, 4);
            // Repartir el faltante en esos pedidos (de forma equitativa)
            $base = floor($faltante / $numRepos);
            $sobrante = $faltante - ($base * $numRepos);

            for ($i = 0; $i < $numRepos; $i++) {
                $extra = ($i < $sobrante) ? 1 : 0;
                $cantidadSolicitada = $base + $extra;
                // Asegurar mínimo 10 unidades por pedido
                $cantidadSolicitada = max(10, $cantidadSolicitada);

                // Elegir un mes aleatorio para cada reposición
                $mes = $meses[array_rand($meses)];
                $dia = rand(1, 25);
                $fechaPedido = date('Y-m-d H:i:s', strtotime("$mes-" . str_pad($dia, 2, '0', STR_PAD_LEFT) . " 10:00:00"));

                // Simular que se recibe un poco menos de lo solicitado (pérdidas realistas)
                $cantidadRecibida = rand(ceil($cantidadSolicitada * 0.90), $cantidadSolicitada);

                // Guardar el item (cada producto tendrá su propio pedido_id o puede agruparse, pero aquí lo dejamos individual)
                $reposiciones[] = [
                    'pedido_id' => (string) Str::uuid(),
                    'producto_codigo' => $producto->codigo,
                    'proveedor_id' => $producto->proveedor_id,
                    'cantidad_solicitada' => $cantidadSolicitada,
                    'cantidad_recibida' => $cantidadRecibida,
                    'costo_unitario' => $producto->costo,
                    'fecha_pedido' => $fechaPedido,
                    'fecha_recepcion' => date('Y-m-d H:i:s', strtotime("$fechaPedido + " . rand(5, 12) . " days")),
                    'estado' => 'recibido',
                    'observaciones' => ($cantidadRecibida < $cantidadSolicitada) ? "Faltaron " . ($cantidadSolicitada - $cantidadRecibida) . " unidades" : null,
                    'solicitado_por' => $personalId,
                    'recibido_por' => $gerenciaId,
                    'created_at' => $fechaPedido,
                    'updated_at' => $fechaPedido,
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

        // Mensaje final con resumen
        $this->command->info('✅ Reposiciones generadas: ' . count($reposiciones) . ' líneas.');
        $this->command->info('✅ Stock ajustado a ~250 unidades para todos los productos.');
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