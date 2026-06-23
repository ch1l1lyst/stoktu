<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            ProveedoresSeeder::class,
            ProductosSeeder::class,
            UsersSeeder::class,
            ReposicionesSeeder::class,
        ]);
    }
}