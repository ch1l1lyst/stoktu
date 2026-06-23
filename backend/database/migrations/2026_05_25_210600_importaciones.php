<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('importaciones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_archivo');
            $table->string('hash', 64)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('total_filas')->default(0);
            $table->integer('insertadas')->default(0);
            $table->integer('errores')->default(0);
            $table->json('detalle_errores')->nullable();
            $table->timestamps();

            $table->index('hash');
        });
    }

    public function down()
    {
        Schema::dropIfExists('importaciones');
    }
};