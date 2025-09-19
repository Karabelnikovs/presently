<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presently</title>

    <script src="https://cdn.tailwindcss.com"></script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Poppins', sans-serif;
        }

        .form-container {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .form-container.loaded {
            opacity: 1;
            transform: translateY(0);
        }

        #loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        #loading-overlay.visible {
            opacity: 1;
            pointer-events: all;
        }

        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }
    </style>
</head>

<body class="bg-gradient-to-br from-gray-50 to-blue-100 min-h-screen flex items-center justify-center p-4">

    <div id="loading-overlay">
        <div class="spinner mb-4"></div>
        <p class="text-lg font-semibold text-gray-800">Generating your presentation... This may take a moment.</p>
    </div>

    <div id="form-container" class="form-container max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div class="text-center">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800">Generate Your Presentation</h1>
            <p class="mt-2 text-gray-500">Let AI do the heavy lifting for you.</p>
        </div>

        <form id="presentation-form" action="http://127.0.0.1:8000/generate-presentation" method="POST"
            class="space-y-6">
            @csrf
            <div>
                <label for="topic" class="block text-sm font-semibold text-gray-700 mb-2">Topic</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <input type="text" id="topic" name="topic" value="AI in Healthcare" required
                        class="block w-full pl-10 pr-3 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out">
                </div>
            </div>

            <div>
                <label for="slides" class="block text-sm font-semibold text-gray-700 mb-2">Number of Slides</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path
                                d="M7 3.5A1.5 1.5 0 018.5 2h3A1.5 1.5 0 0113 3.5v1.586l1.293 1.293a1 1 0 01.293.707V16.5a1.5 1.5 0 01-1.5 1.5h-8A1.5 1.5 0 012 16.5V7.086a1 1 0 01.293-.707L3.586 5.086V3.5A1.5 1.5 0 015 2h1.5a.5.5 0 01.5.5v1.5H10V2.5a.5.5 0 01.5-.5H12a1.5 1.5 0 011.5 1.5v1.586l1.293 1.293a1 1 0 01.293.707V16.5a1.5 1.5 0 01-1.5 1.5h-8A1.5 1.5 0 012 16.5V7.086a1 1 0 01.293-.707L3.586 5.086V3.5z" />
                            <path d="M7.5 8a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
                        </svg>
                    </div>
                    <input type="number" id="slides" name="slides" value="5" min="1" max="20"
                        required
                        class="block w-full pl-10 pr-3 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out">
                </div>
            </div>

            <div>
                <label for="template" class="block text-sm font-semibold text-gray-700 mb-2">Design Template</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path
                                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H6z" />
                            <path d="M7 5h6v1H7V5zm0 3h6v1H7V8zm0 3h4v1H7v-1z" />
                        </svg>
                    </div>
                    <select id="template" name="template"
                        class="block w-full pl-10 pr-3 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out">
                        <option value="default">Default (Clean White)</option>
                        <option value="modern">Modern (Slate Blue)</option>
                        <option value="corporate">Corporate (Green Tones)</option>
                    </select>
                </div>
            </div>

            <button type="submit"
                class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-md px-5 py-3.5 text-center transition-transform transform duration-150 ease-in-out active:scale-[0.98]">
                Generate Presentation
            </button>
        </form>

        <div class="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>Ensure your Laravel and Ollama servers are running correctly.</p>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const formContainer = document.getElementById('form-container');
            setTimeout(() => {
                formContainer.classList.add('loaded');
            }, 100);

            const form = document.getElementById('presentation-form');
            const loadingOverlay = document.getElementById('loading-overlay');

            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                loadingOverlay.classList.add('visible');

                const formData = new FormData(form);

                try {
                    const response = await fetch(form.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json', // Ensure server knows we want JSON back
                        },
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        // Use the error message from the server if available
                        throw new Error(data?.error || `Server error: ${response.statusText}`);
                    }

                    // ✅ CORRECTED LOGIC
                    // Check if the 'file' key exists in the JSON response
                    if (data.file) {
                        // Construct the correct download URL with the filename
                        const downloadUrl = `/download-presentation/${data.file}`;

                        // Redirect to the download URL to trigger the download
                        window.location.href = downloadUrl;

                        // We can hide the loading overlay after a short delay
                        setTimeout(() => {
                            loadingOverlay.classList.remove('visible');
                        }, 1000); // 1 second delay

                    } else {
                        // Handle cases where the server response is OK but doesn't include the file
                        throw new Error('Server response did not include a filename.');
                    }

                } catch (error) {
                    console.error('An error occurred:', error);
                    loadingOverlay.classList.remove('visible');
                    // Display a more specific error message to the user
                    alert(`Error: ${error.message}`);
                }
            });
        });
    </script>
</body>

</html>
