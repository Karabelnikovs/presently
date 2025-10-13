<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    public function home_page_shows_welcome_text(): void
    {
        $response = $this->visit('/');

        $response->assertSee('Welcome');
    }
}
