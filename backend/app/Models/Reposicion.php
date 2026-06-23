<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reposicion extends Model
{
    // No necesitas SoftDeletes aquí a menos que quieras soft delete para reposiciones
    // Pero para esta relación sí queremos incluir los eliminados

    protected $table = 'reposiciones';

    protected $fillable = [
        'pedido_id',
        'producto_codigo',
        'proveedor_id',
        'cantidad_solicitada',
        'cantidad_recibida',
        'costo_unitario',
        'fecha_pedido',
        'fecha_recepcion',
        'estado',
        'observaciones',
        'solicitado_por',
        'recibido_por'
    ];

    protected $casts = [
        'fecha_pedido' => 'datetime',
        'fecha_recepcion' => 'datetime',
    ];

    // 🔥 Relaciones con withTrashed()
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_codigo', 'codigo');
    }

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id', 'id');
    }

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitado_por');
    }

    public function receptor()
    {
        return $this->belongsTo(User::class, 'recibido_por');
    }
}