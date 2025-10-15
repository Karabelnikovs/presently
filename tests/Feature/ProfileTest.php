<?php

it('shows the profile form', function () {
    $user = \App\Models\User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);


    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();


    $page = visit('/profile');

    $page->assertSee('Profile')
        ->assertSee('Name')
        ->assertSee('Email')
        ->assertSee('New Password (leave blank to keep current)')
        ->assertSee('Confirm New Password')
        ->assertSee('Update Profile');
});

it('allows the user to update profile with valid data', function () {
    $user = \App\Models\User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);


    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();


    $page = visit('/profile')
        ->type('name', 'Updated Name')
        ->type('email', 'updated@email.com')
        ->submit();

    $page->assertSee('Profile updated');

    $this->assertDatabaseHas('users', [
        'email' => 'updated@email.com',
        'name' => 'Updated Name',
    ]);
});

it('allows the user to update password', function () {
    $user = \App\Models\User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);


    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();


    $page = visit('/profile')
        ->type('name', 'Name')
        ->type('email', 'email@email.com')
        ->type('password', 'newpassword123')
        ->type('password_confirmation', 'newpassword123')
        ->submit();

    $page->assertSee('Profile updated');
});

it('rejects too short new password', function () {
    $user = \App\Models\User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);


    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();


    $page = visit('/profile')
        ->type('name', 'name')
        ->type('email', 'email@email.com')
        ->type('password', 'short')
        ->type('password_confirmation', 'short')
        ->submit();

    $page->assertSee('The password field must be at least 8 characters');
});

it('rejects new passwords that do not match', function () {
    $user = \App\Models\User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);


    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();


    $page = visit('/profile')
        ->type('name', 'name')
        ->type('email', 'email@email.com')
        ->type('password', 'password123')
        ->type('password_confirmation', 'password123456')
        ->submit();

    $page->assertSee('The password field confirmation does not match.');
});