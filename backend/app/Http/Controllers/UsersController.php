<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsersController extends Controller
{
    /**
     * Listar usuarios activos o incluir inactivos según parámetro.
     * Permite filtrar por rol (personal/gerencia).
     * GET /api/users?incluir_inactivos=true&rol=personal
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Filtrar por rol si se envía
        if ($request->has('rol') && in_array($request->rol, ['personal', 'gerencia'])) {
            $query->where('rol', $request->rol);
        }

        // Si no se pide incluir inactivos, solo mostrar activos (deleted_at = null)
        if (!$request->boolean('incluir_inactivos')) {
            $query->whereNull('deleted_at');
        }

        $users = $query->orderBy('name')->get();
        return response()->json($users);
    }

    /**
     * Mostrar un usuario específico, incluso si está desactivado (soft delete).
     * Útil para ver detalles históricos o reactivar.
     */
    public function show($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        return response()->json($user);
    }

    /**
     * Crear un nuevo usuario en el sistema.
     * Asigna el rol (personal o gerencia) y encripta la contraseña.
     * Solo accesible para gerencia.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'rol' => ['required', Rule::in(['personal', 'gerencia'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'rol' => $validated['rol'],
        ]);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'user' => $user
        ], 201);
    }

    /**
     * Actualizar datos de un usuario (nombre, email, rol).
     * No permite cambiar contraseña aquí (usa updatePassword).
     * Verifica unicidad del email excepto el propio usuario.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'rol' => ['sometimes', 'required', Rule::in(['personal', 'gerencia'])],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => $user
        ]);
    }

    /**
     * Cambiar la contraseña de un usuario específico.
     * Requiere confirmación de nueva contraseña (campo password_confirmation).
     * Solo accesible para gerencia.
     */
    public function updatePassword(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente'
        ]);
    }

    /**
     * Desactivar un usuario (soft delete).
     * El usuario no se elimina físicamente, solo se oculta y no puede iniciar sesión.
     * Los datos históricos (reposiciones, importaciones) se conservan.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'Usuario desactivado correctamente (soft delete)'
        ]);
    }

    /**
     * Reactivar un usuario previamente desactivado.
     * Restaura el registro (deleted_at = null) y permite iniciar sesión nuevamente.
     */
    public function restore($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json([
            'message' => 'Usuario reactivado correctamente',
            'user' => $user
        ]);
    }

    /**
     * Eliminar físicamente un usuario de la base de datos (force delete).
     * Solo permitido si no tiene reposiciones, importaciones u otros datos asociados.
     * Usar con precaución, ya que no se puede recuperar.
     */
    public function forceDelete($id)
    {
        $user = User::withTrashed()->findOrFail($id);

        // Verificar si tiene reposiciones, importaciones, etc.
        if ($user->reposiciones()->count() > 0 || $user->importaciones()->count() > 0) {
            return response()->json([
                'error' => 'No se puede eliminar permanentemente porque tiene datos asociados (reposiciones o importaciones).'
            ], 422);
        }

        $user->forceDelete();

        return response()->json([
            'message' => 'Usuario eliminado permanentemente'
        ]);
    }
}