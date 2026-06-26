<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Importacion extends Model
{
    protected $table = 'importaciones';
    protected $fillable = ['nombre_archivo', 'hash', 'user_id', 'fecha_importacion', 'total_filas', 'insertadas', 'errores', 'detalle_errores'];
    protected $casts = [
        'detalle_errores' => 'array',
        'fecha_importacion' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'importacion_id');
    }
}