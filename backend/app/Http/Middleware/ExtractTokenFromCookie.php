<?php

namespace App\Http\Middleware;

use Closure;

class ExtractTokenFromCookie
{
    public function handle($request, Closure $next)
    {
        if ($request->hasCookie('token')) {
            $token = $request->cookie('token');
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }
        return $next($request);
    }
}