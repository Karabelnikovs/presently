<?php

use App\Models\User;
use App\Models\Presentation;

it('shows the my presentations page', function () {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);

    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();

    $page = visit('/my-presentations');

    $page->assertSee('My Presentations')
        ->assertAttribute('input[type="text"]', 'placeholder', 'Search presentations...');
});

it('displays no presentations message when empty', function () {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);

    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();

    $page = visit('/my-presentations');

    $page->assertSee('No presentations yet. Generate one!');
});

it('displays list of presentations', function () {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);

    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();

    for ($i = 1; $i <= 3; $i++) {
        Presentation::create([
            'user_id' => $user->id,
            'title' => "Presentation Title $i",
            'filename' => "presentation_$i.pptx",
        ]);
    }

    $page = visit('/my-presentations');

    $page->assertSee('Presentation Title 1')
        ->assertSee('Download');
});

it('searches presentations', function () {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);

    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();

    Presentation::create([
        'user_id' => $user->id,
        'title' => 'AI Presentation',
        'filename' => 'ai_presentation.pptx',
    ]);

    Presentation::create([
        'user_id' => $user->id,
        'title' => 'Other Topic',
        'filename' => 'other_topic.pptx',
    ]);

    $page = visit('/my-presentations')
        ->type('search', 'AI');

    $page->assertSee('AI Presentation')
        ->assertDontSee('Other Topic')
        ->assertSee('Found 1 presentation');
});

it('handles pagination', function () {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);

    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();

    for ($i = 1; $i <= 10; $i++) {
        Presentation::create([
            'user_id' => $user->id,
            'title' => "Presentation $i",
            'filename' => "presentation_$i.pptx",
        ]);
    }

    $page = visit('/my-presentations');

    $page->assertSee('Page 1 of 2');

    $page->click('button[name="next"]');
    $page->assertSee('Page 2 of 2');
});