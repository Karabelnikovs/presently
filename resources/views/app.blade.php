<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
{{--    <meta name="csrf-token" content="{{ csrf_token() }}">--}}
    <title>Presently</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(to bottom right, #f9fafb, #dbeafe);
            min-height: 100vh;
            /* display: flex;
            align-items: center;
            justify-content: center; */
            padding: 1rem;
        }
    </style>
    <link rel="icon" type="image/x-icon" href="/presently_favicon.png">

</head>

<body>
    <div id="root"></div>
</body>

</html>
