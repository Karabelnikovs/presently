<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Standarta aizsargātais API piemēra maršruts.
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
