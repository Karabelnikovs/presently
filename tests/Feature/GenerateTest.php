<?php
use App\Models\User;

it('shows the generate form', function () {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);

    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();


    $page = visit('/generate');

    $page->assertSee('Generate Your Presentation')
        ->assertSee('Topic (or upload a .docx file below)')
        ->assertSee('Upload .docx File (Optional)')
        ->assertSee('Number of Slides')
        ->assertSee('Design Template')
        ->assertSee('Generate Presentation');
});

it('allows the user to generate a presentation with valid data', function () {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);

    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();


    $page = visit('/generate')
        ->type('topic', 'AI in Healthcare')
        ->type('slides', '8')
        ->submit();

    $page->assertPathIs('/generate');

});

it('allows the user to generate a presentation with a valid docx file', function () {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);

    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();


    $filePath = __DIR__ . '/test.docx';

    $page = visit('/generate')
        ->attach('docx_file', $filePath)
        ->type('slides', '5')
        ->submit();

    $page->assertPathIs('/generate');
});



it('rejects file larger than 5MB', function () {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);

    $page = visit('/login')
        ->type('email', 'test@example.com')
        ->type('password', 'password123')
        ->submit();


    $filePath = __DIR__ . '/large.docx';

    $page = visit('/generate')
        ->attach('docx_file', $filePath)
        ->type('slides', '5');

    $page->assertSee('File size cannot exceed 5MB.');
});

