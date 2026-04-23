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

Route::get('/', function () {
    return Auth::check() ? redirect()->route('home') : view('app');
});

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
    Route::get('/generation-status/{generationId}', [PresentationController::class, 'generationStatus']);
    Route::get('/api/my-presentations', [PresentationController::class, 'index']);
    Route::delete('/api/my-presentations/{id}', [PresentationController::class, 'destroy']);
    Route::get('/api/profile', [UserController::class, 'show']);
    Route::post('/api/profile', [UserController::class, 'update']);
    Route::get('/api/user', function (Request $request) {
        return Auth::user();
    });
});
Route::get('phpinfo', function () {
    return phpinfo();
});

Route::get('/download-presentation/{filename}', [PresentationController::class, 'downloadPresentation'])->name('presentation.download');
Route::get('/php-check', function () {
    return response()->json([
        'php_version' => PHP_VERSION,
        'sapi' => PHP_SAPI,
        'allow_url_fopen' => ini_get('allow_url_fopen'),
        'curl_loaded' => extension_loaded('curl'),
        'curl_init_exists' => function_exists('curl_init'),
        'curl_multi_exec_exists' => function_exists('curl_multi_exec'),
        'stream_socket_client_exists' => function_exists('stream_socket_client'),
        'loaded_ini' => php_ini_loaded_file(),
        'scanned_ini' => php_ini_scanned_files(),
        'extension_dir' => ini_get('extension_dir'),

        'disable_functions' => ini_get('disable_functions'),
    ]);
});
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
