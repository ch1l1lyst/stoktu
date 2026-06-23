<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Proveedor extends Model
{
    use SoftDeletes;

    protected $table = 'proveedores';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id', 'nombre', 'telefono', 'email'];

    // Relación con productos (no se eliminan, solo se desactiva el proveedor)
    public function productos()
    {
        return $this->hasMany(Producto::class, 'proveedor_id', 'id');
    }
}