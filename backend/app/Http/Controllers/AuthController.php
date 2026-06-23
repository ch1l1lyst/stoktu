<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    // Registro de usuarios
    public function register(Request $request)
    {
        // Validación automática: campos requeridos, email único, password mínimo 8, rol opcional
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',  // sin 'confirmed' a menos que frontend envíe password_confirmation
            'rol' => ['sometimes', Rule::in(['personal', 'gerencia'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'rol' => $validated['rol'] ?? 'personal',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // Login – genera token y lo guarda en cookie HttpOnly
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        // Credenciales incorrectas: respuesta genérica por seguridad
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        // Eliminar tokens anteriores del mismo nombre (buena práctica para no acumular)
        $user->tokens()->where('name', 'auth_token')->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        // Cookie HttpOnly, Secure (solo HTTPS), SameSite Strict
        $cookie = cookie(
            'token', $token, 60 * 24, '/',
            null,          // domain (null = actual host)
            false,         // secure = false (porque usas HTTP en desarrollo)
            true,          // httpOnly
            false,         // raw
            'lax'          // SameSite = lax (permite envío en navegación normal)
        );

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'user' => $user,
            'token' => $token
        ])->withCookie($cookie);
    }

    // Logout: elimina el token actual y olvida la cookie
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        $cookie = cookie()->forget('token', '/', null, true, true, 'strict');

        return response()->json(['message' => 'Sesión cerrada'])->withCookie($cookie);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}