<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run()
    {
        DB::table('users')->insert([
            // ========== ORIGINALES ==========
            ['name' => 'Personal', 'email' => 'personal@stoktu.com', 'password' => Hash::make('personal'), 'rol' => 'personal', 'created_at' => now(), 'updated_at' => now(), 'deleted_at' => null],
            ['name' => 'Admin', 'email' => 'ch1l1@stoktu.com', 'password' => Hash::make('ch1l1'), 'rol' => 'gerencia', 'created_at' => now(), 'updated_at' => now(), 'deleted_at' => null],

            // ========== NUEVOS ACTIVOS (todos personal) ==========
            ['name' => 'Ana Rodríguez', 'email' => 'ana.rodriguez@stoktu.com', 'password' => Hash::make('password123'), 'rol' => 'personal', 'created_at' => now(), 'updated_at' => now(), 'deleted_at' => null],
            ['name' => 'Carlos Pérez', 'email' => 'carlos.perez@stoktu.com', 'password' => Hash::make('password123'), 'rol' => 'personal', 'created_at' => now(), 'updated_at' => now(), 'deleted_at' => null],
            ['name' => 'María López', 'email' => 'maria.lopez@stoktu.com', 'password' => Hash::make('password123'), 'rol' => 'personal', 'created_at' => now(), 'updated_at' => now(), 'deleted_at' => null],
            ['name' => 'Jorge Martínez', 'email' => 'jorge.martinez@stoktu.com', 'password' => Hash::make('password123'), 'rol' => 'personal', 'created_at' => now(), 'updated_at' => now(), 'deleted_at' => null],
            ['name' => 'Laura Gómez', 'email' => 'laura.gomez@stoktu.com', 'password' => Hash::make('password123'), 'rol' => 'personal', 'created_at' => now(), 'updated_at' => now(), 'deleted_at' => null],
            ['name' => 'Pedro Sánchez', 'email' => 'pedro.sanchez@stoktu.com', 'password' => Hash::make('password123'), 'rol' => 'personal', 'created_at' => now(), 'updated_at' => now(), 'deleted_at' => null],

            // ========== DESACTIVADOS (soft delete, todos personal) ==========
            ['name' => 'Elena Castro (inactiva)', 'email' => 'elena.castro@stoktu.com', 'password' => Hash::make('password123'), 'rol' => 'personal', 'created_at' => now(), 'updated_at' => now(), 'deleted_at' => '2026-01-15 10:00:00'],
            ['name' => 'Roberto Díaz (inactivo)', 'email' => 'roberto.diaz@stoktu.com', 'password' => Hash::make('password123'), 'rol' => 'personal', 'created_at' => now(), 'updated_at' => now(), 'deleted_at' => '2026-02-20 14:30:00'],
            ['name' => 'Sofía Torres (inactiva)', 'email' => 'sofia.torres@stoktu.com', 'password' => Hash::make('password123'), 'rol' => 'personal', 'created_at' => now(), 'updated_at' => now(), 'deleted_at' => '2026-03-10 09:15:00'],
            ['name' => 'Miguel Ramírez (inactivo)', 'email' => 'miguel.ramirez@stoktu.com', 'password' => Hash::make('password123'), 'rol' => 'personal', 'created_at' => now(), 'updated_at' => now(), 'deleted_at' => '2026-04-05 16:20:00'],
        ]);
    }
}