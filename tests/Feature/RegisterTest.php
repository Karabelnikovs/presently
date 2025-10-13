<?php

use App\Models\User;

it('shows the register form', function () {
    $page = visit('/register');

    $page->assertSee('Register')
        ->assertSee('Name')
        ->assertSee('Email')
        ->assertSee('Password')
        ->assertSee('Confirm Password')
        ->assertSee('Register');
});

it('allows the user to register with valid data', function () {
    $page = visit('/register')
        ->type('name', 'New User')
        ->type('email', 'newuser@example.com')
        ->type('password', 'password123')
        ->type('password_confirmation', 'password123')
        ->submit();

    $page->assertPathIs('/generate')
        ->assertSee('Generate');

    $this->assertDatabaseHas('users', [
        'email' => 'newuser@example.com',
        'name' => 'New User',
    ]);
});

it('rejects too short password', function () {
    $page = visit('/register')
        ->type('name', 'name')
        ->type('email', 'email@email.com')
        ->type('password', 'short')
        ->type('password_confirmation', 'different')
        ->submit();

    $page->assertSee('The password field must be at least 8 characters');
});

it('rejects passwords that do not match', function () {
    $page = visit('/register')
        ->type('name', 'name')
        ->type('email', 'email@email.com')
        ->type('password', 'password123')
        ->type('password_confirmation', 'password123456')
        ->submit();

    $page->assertSee('The password field confirmation does not match.');
});
