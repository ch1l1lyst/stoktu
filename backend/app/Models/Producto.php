<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Proveedor;  
use App\Models\Venta;      

class Producto extends Model
{
    protected $table = 'productos';
    protected $primaryKey = 'codigo';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['codigo', 'nombre', 'categoria', 'stock_actual', 'costo', 'precio', 'imagen', 'proveedor_id'];

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id', 'id');
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'producto_codigo', 'codigo');
    }
}