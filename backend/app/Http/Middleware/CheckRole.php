<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Maneja la petición y verifica que el usuario tenga uno de los roles permitidos.
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Si no hay usuario autenticado, devolver error 401
        if (!auth()->check()) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // Obtener el rol del usuario autenticado
        $userRole = auth()->user()->rol;

        // Verificar si el rol del usuario está entre los roles permitidos
        if (!in_array($userRole, $roles)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Si pasa la validación, continúa con la petición
        return $next($request);
    }
}