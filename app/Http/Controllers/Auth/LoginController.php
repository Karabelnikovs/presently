<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    // Noklusējuma lapa pēc veiksmīgas autorizācijas.
    protected $redirectTo = '/generate';



    public function showLoginForm()
    {
        // Frontend single page app ielāde pieteikšanās skatam.
        return view('app');
    }

    public function login(Request $request)
    {
        //validējam  pieteikšanās laukus.
        $request->validate([
            'email' => 'required|email|string',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials, $request->filled('remember'))) {
            // Atgriežam korektu kļūdu gan API, gan web formai.
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }
            return back()->withErrors(['email' => trans('auth.failed')]);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Logged in', 'user' => $user]);
        }

        return redirect()->intended($this->redirectTo);
    }

    public function logout(Request $request)
    {
        // droši izbeidzam sesiju un izveidojam jaunu CSRF tokenu
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Logged out']);
        }

        return redirect('/');
    }
}
