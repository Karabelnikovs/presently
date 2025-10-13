<?php
// ./vendor/bin/pest;  
it('may welcome the user', function () {
    $page = visit('/');

    $page->assertSee('Welcome');
});