<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PresentationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1');

    Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [RegisterController::class, 'register']);
});

Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::get('/generate', function () {
    return view('app');
})->name('home');

Route::get('/profile', function () {
    return view('app');
});

Route::get('/my-presentations', function () {
    return view('app');
});


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/generate-presentation', [PresentationController::class, 'generate']);
    Route::get('/api/my-presentations', [PresentationController::class, 'index']);
    Route::get('/api/profile', [UserController::class, 'show']);
    Route::post('/api/profile', [UserController::class, 'update']);
    Route::get('/api/user', function (Request $request) {
        return Auth::user();
    });
});

Route::get('/download-presentation/{filename}', [PresentationController::class, 'downloadPresentation'])->name('presentation.download');

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
