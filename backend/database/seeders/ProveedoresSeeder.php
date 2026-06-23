<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProveedoresSeeder extends Seeder
{
    public function run()
    {
        
        DB::table('proveedores')->insert([
            // ========== ACTIVOS ==========
            ['id' => 'PROV001', 'nombre' => 'Química Industrial Cía. Ltda.', 'telefono' => '02-2556789', 'email' => 'ventas@quimicaindustrial.com', 'deleted_at' => null],
            ['id' => 'PROV002', 'nombre' => 'Disan Ecuador S.A.', 'telefono' => '04-2591234', 'email' => 'ventas@disanec.com', 'deleted_at' => null],
            ['id' => 'PROV003', 'nombre' => 'Provequim Cía. Ltda.', 'telefono' => '02-2478901', 'email' => 'ventas@provequim.com', 'deleted_at' => null],
            ['id' => 'PROV004', 'nombre' => 'Distribuidora Química del Pacífico', 'telefono' => '04-2376543', 'email' => 'ventas@dqp.com.ec', 'deleted_at' => null],
            ['id' => 'PROV005', 'nombre' => 'Insumos Industriales del Ecuador', 'telefono' => '02-2987654', 'email' => 'ventas@insumosecuador.com', 'deleted_at' => null],
            ['id' => 'PROV006', 'nombre' => 'Quimicorp S.A.', 'telefono' => '04-2123456', 'email' => 'ventas@quimicorp.com.ec', 'deleted_at' => null],
            ['id' => 'PROV007', 'nombre' => 'Laboratorios Ecuatorianos Cía. Ltda.', 'telefono' => '02-2234567', 'email' => 'ventas@labecuador.com', 'deleted_at' => null],
            ['id' => 'PROV008', 'nombre' => 'Soluciones Químicas Andinas', 'telefono' => '04-2889012', 'email' => 'contacto@solquimandinas.com', 'deleted_at' => null],
            // ========== DESACTIVADOS (soft delete con fechas fijas) ==========
            ['id' => 'PROV009', 'nombre' => 'Distribuidora Nacional de Químicos', 'telefono' => '02-3334567', 'email' => 'ventas@diquimicos.com', 'deleted_at' => '2026-01-15 10:30:00'],
            ['id' => 'PROV010', 'nombre' => 'Químicos del Centro Cía. Ltda.', 'telefono' => '03-4445678', 'email' => 'ventas@quimicentro.com', 'deleted_at' => '2026-02-20 14:45:00'],
            ['id' => 'PROV011', 'nombre' => 'Proveedora Industrial del Sur', 'telefono' => '07-5556789', 'email' => 'ventas@proindustrialsur.com', 'deleted_at' => '2026-03-10 09:15:00'],
            ['id' => 'PROV012', 'nombre' => 'Insumos Químicos del Norte', 'telefono' => '06-6667890', 'email' => 'ventas@insumosnorte.com', 'deleted_at' => '2026-04-05 16:20:00'],
            ['id' => 'PROV013', 'nombre' => 'Soluciones Químicas del Pacífico', 'telefono' => '04-7778901', 'email' => 'ventas@solquimpacifico.com', 'deleted_at' => '2026-05-12 11:00:00'],
        ]);
    }
}