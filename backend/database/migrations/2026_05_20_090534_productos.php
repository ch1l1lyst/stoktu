<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->string('codigo', 20)->primary();
            $table->string('nombre', 150);
            $table->string('categoria', 50)->nullable();
            $table->integer('stock_actual')->default(0);
            $table->decimal('costo', 10, 2);
            $table->decimal('precio', 10, 2);
            $table->string('imagen')->nullable();
            $table->string('proveedor_id', 20);
            $table->foreign('proveedor_id')->references('id')->on('proveedores')->onDelete('restrict');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('productos');
    }
};