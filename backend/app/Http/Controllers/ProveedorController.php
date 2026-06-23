<?php

namespace App\Http\Controllers;

use App\Models\Proveedor;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProveedorController extends Controller
{
    /**
     * Listar proveedores activos (o todos si se pide)
     * GET /api/proveedores?incluir_inactivos=true
     */
    public function index(Request $request)
    {
        $query = Proveedor::query();

        // Si no se pide incluir inactivos, solo mostrar activos (deleted_at = null)
        if (!$request->boolean('incluir_inactivos')) {
            $query->whereNull('deleted_at');
        }

        $proveedores = $query->orderBy('nombre')->get();
        return response()->json($proveedores);
    }

    /**
     * Mostrar un proveedor específico (incluso si está inactivo)
     */
    public function show($id)
    {
        $proveedor = Proveedor::withTrashed()->findOrFail($id);
        return response()->json($proveedor);
    }

    /**
     * Crear un nuevo proveedor
     */
    public function store(Request $request)
    {
        $request->validate([
            'id' => 'required|string|max:20|unique:proveedores,id',
            'nombre' => 'required|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
        ]);

        $proveedor = Proveedor::create($request->all());

        return response()->json([
            'message' => 'Proveedor creado exitosamente',
            'proveedor' => $proveedor
        ], 201);
    }

    /**
     * Actualizar un proveedor
     */
    public function update(Request $request, $id)
    {
        $proveedor = Proveedor::findOrFail($id);

        $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
        ]);

        $proveedor->update($request->only(['nombre', 'telefono', 'email']));

        return response()->json([
            'message' => 'Proveedor actualizado correctamente',
            'proveedor' => $proveedor
        ]);
    }

    /**
     * Desactivar (soft delete) un proveedor
     */
    public function destroy($id)
    {
        $proveedor = Proveedor::findOrFail($id);
        $proveedor->delete();

        return response()->json([
            'message' => 'Proveedor desactivado correctamente (soft delete)'
        ]);
    }

    /**
     * Reactivar un proveedor (restaurar)
     */
    public function restore($id)
    {
        $proveedor = Proveedor::withTrashed()->findOrFail($id);
        $proveedor->restore();

        return response()->json([
            'message' => 'Proveedor reactivado correctamente',
            'proveedor' => $proveedor
        ]);
    }

    /**
     * Eliminar permanentemente (solo si no tiene productos asociados)
     * Usar con precaución
     */
    public function forceDelete($id)
    {
        $proveedor = Proveedor::withTrashed()->findOrFail($id);

        // Verificar si tiene productos (para no perder historial)
        if ($proveedor->productos()->count() > 0) {
            return response()->json([
                'error' => 'No se puede eliminar permanentemente porque tiene productos asociados.'
            ], 422);
        }

        $proveedor->forceDelete();

        return response()->json([
            'message' => 'Proveedor eliminado permanentemente'
        ]);
    }
}