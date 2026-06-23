<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ventas', function (Blueprint $table) {
            $table->id();
            $table->string('numero_pedido', 50)->nullable();
            $table->string('cliente', 150)->nullable();
            $table->string('cedula', 20)->nullable();
            $table->string('sector', 100)->nullable();
            $table->foreignId('vendedor_id')->nullable()->constrained('users')->nullOnDelete(); 
            $table->string('producto_codigo', 20);
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->enum('estado_pedido', ['pendiente', 'completado', 'cancelado'])->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamp('fecha')->useCurrent();
            $table->timestamps();

            $table->foreign('producto_codigo')->references('codigo')->on('productos')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('ventas');
    }
};