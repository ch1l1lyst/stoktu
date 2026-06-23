<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reposiciones', function (Blueprint $table) {
            $table->id();
            $table->string('pedido_id', 36)->nullable()->index();
            $table->string('producto_codigo', 20)->nullable();
            $table->string('proveedor_id', 20);
            $table->integer('cantidad_solicitada');
            $table->integer('cantidad_recibida')->default(0);
            $table->decimal('costo_unitario', 10, 2);
            $table->timestamp('fecha_pedido')->useCurrent();
            $table->timestamp('fecha_recepcion')->nullable();
            $table->enum('estado', ['pendiente', 'recibido', 'cancelado'])->default('pendiente');
            $table->text('observaciones')->nullable();
            $table->foreignId('solicitado_por')->constrained('users');
            $table->foreignId('recibido_por')->nullable()->constrained('users');
            $table->timestamps();

            // Llaves foráneas
            $table->foreign('producto_codigo')->references('codigo')->on('productos');
            $table->foreign('proveedor_id')->references('id')->on('proveedores');
            
            // Índices
            $table->index('estado');
            $table->index('fecha_pedido');
        });
    }

    public function down()
    {
        Schema::dropIfExists('reposiciones');
    }
};