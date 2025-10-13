<?php

it('shows the login form', function () {
    $page = visit('/login');

    $page->assertSee('Login')
        ->assertSee('Email')
        ->assertSee('Password')
        ->assertSee('Login');
});

it('allows the user to log in with valid credentials', function () {
    $user = \App\Models\User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);


    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();

    $page->assertPathIs('/generate')
        ->assertSee('Generate');
});

it('rejects invalid login credentials', function () {
    $page = visit('/login')
        ->type('email', 'wrong@example.com')
        ->type('password', 'invalid')
        ->submit();

    $page->assertSee('Invalid credentials');
});
