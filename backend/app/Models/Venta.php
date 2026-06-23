<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    protected $table = 'ventas';

    protected $fillable = [
        'producto_codigo',
        'cantidad',
        'precio_unitario',
        'fecha',
        'numero_pedido',    
        'estado_pedido',
        'observaciones',
        'cliente',  
        'cedula', 
        'sector',
        'vendedor_id',
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_codigo', 'codigo');
    }

    public function vendedor()
    {
        return $this->belongsTo(User::class, 'vendedor_id', 'id'); 
    }
}