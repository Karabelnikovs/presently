<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Presentation;
use PhpOffice\PhpWord\IOFactory;

class PresentationController extends Controller
{
    public function index()
    {
        $presentations = auth()->user()->presentations;
        return response()->json($presentations);
    }

    public function generate(Request $request)
    {
        $useMockData = false;

        try {
            $request->validate([
                'topic' => 'string|nullable',
                'slides' => 'integer|min:1|max:20',
                'template' => 'string|required',
                'docx_file' => 'nullable|file|mimes:docx|max:5120',
            ]);

            $topic = $request->input('topic', 'AI in Healthcare');
            $slideCount = (int) $request->input('slides', 5);
            $templateId = $request->input('template', 'default');

            $documentContent = '';

            if ($request->hasFile('docx_file')) {
                $file = $request->file('docx_file');
                $tempPath = $file->store('temp');

                $fullPath = Storage::path($tempPath);

                if (!file_exists($fullPath)) {
                    Log::error("Uploaded file not found at: {$fullPath}");
                    return response()->json(['error' => 'Uploaded file could not be processed.'], 500);
                }

                try {
                    $phpWord = IOFactory::load($fullPath);
                    $sections = $phpWord->getSections();
                    foreach ($sections as $section) {
                        $elements = $section->getElements();
                        foreach ($elements as $element) {
                            if (method_exists($element, 'getText')) {
                                $documentContent .= $element->getText() . "\n";
                            }
                        }
                    }

                    $documentContent = $this->sanitizeText($documentContent);
                } catch (\PhpOffice\PhpWord\Exception\Exception $e) {
                    Log::error('Invalid DOCX file: ' . $e->getMessage() . ' Path: ' . $fullPath);
                    return response()->json(['error' => 'The uploaded file is not a valid .docx document.'], 400);
                } finally {
                    Storage::delete($tempPath);
                }

                if (empty($topic)) {
                    $topic = 'Presentation based on uploaded document';
                }

                Log::info('Extracted document content for LLM: ' . substr($documentContent, 0, 200) . '...');
            }

            $templateFile = storage_path("app/templates/{$templateId}.potx");
            if (!file_exists($templateFile)) {
                Log::error("Template file not found: {$templateFile}");
                return response()->json(['error' => "The selected design template '{$templateId}' is not available."], 400);
            }
            Log::info("Using template file: {$templateFile}");

            $parsedData = null;

            if ($useMockData) {
                Log::info('Using mock data for presentation generation.');
                $mockJson = '{
                    "slides": [
                        { "title": "The Dawn of a New Era", "bullets": ["Artificial Intelligence is revolutionizing the healthcare industry.", "From diagnostics to treatment, AI is enhancing capabilities.", "This presentation will explore the key impacts of AI in modern medicine."]},
                        { "title": "AI in Medical Diagnostics", "bullets": ["AI algorithms can analyze medical images (X-rays, MRIs) with high accuracy.", "It helps in early detection of diseases like cancer and diabetic retinopathy.", "Machine learning models predict patient risk factors from EHR data."]},
                        { "title": "Challenges and Ethical Considerations", "bullets": ["Data privacy and security are paramount concerns.", "Ensuring the fairness and avoiding bias in AI algorithms is crucial.", "Regulatory approval and integration into existing workflows pose challenges."]}
                    ]
                }';
                $parsedData = json_decode($mockJson, true);
            } else {
                $basePrompt = "Generate a detailed presentation outline";
                if ($documentContent) {
                    $basePrompt .= " based on the following document content: \n\n" . $documentContent . "\n\n";
                    $basePrompt .= "Summarize and structure the key points from the document into exactly $slideCount slides.";
                } else {
                    $basePrompt .= " for '$topic' with exactly $slideCount slides.";
                }
                $prompt = $basePrompt . "
                            For each slide, provide: a concise but engaging title, and 3-5 informative bullet points (use full sentences).
                            Ensure the output is complete and valid JSON.
                            Output ONLY the JSON object in this exact format: 
                        {\"slides\": [{\"title\": \"\", \"bullets\": [\"\"]}]}.";

                $systemPrompt = "You are a JSON generator. Always output only valid JSON as specified in the prompt.";

                for ($try = 1; $try <= 3; $try++) {
                    $response = Http::timeout(240)->post('http://127.0.0.1:11434/api/generate', [
                        'model' => 'llama3.1',
                        'prompt' => $prompt,
                        'system' => $systemPrompt,
                        'format' => 'json',
                        'stream' => false,
                    ]);

                    if ($response->successful()) {
                        $ollamaData = json_decode($response->body(), true);
                        $llmOutput = $ollamaData['response'] ?? '';
                        $parsedData = json_decode($llmOutput, true);
                        if (json_last_error() === JSON_ERROR_NONE && isset($parsedData['slides']))
                            break;
                    }

                    $parsedData = null;
                }
            }

            if (!isset($parsedData['slides']) || !is_array($parsedData['slides'])) {
                Log::error('Could not obtain slides data from LLM after retries or from mock data.');
                return response()->json(['error' => 'Could not obtain valid slides data.'], 500);
            }

            $data = [
                'topic' => $topic,
                'slides' => $parsedData['slides'],
            ];

            $dataFile = 'presentation_data_' . time() . '.json';
            $dataPath = storage_path('app/temp/' . $dataFile);
            if (!file_exists(dirname($dataPath))) {
                mkdir(dirname($dataPath), 0755, true);
            }
            file_put_contents($dataPath, json_encode($data));

            $filePath = storage_path('app/public/presentation_' . time() . '.pptx');

            $pythonScript = base_path('scripts/generate_presentation.py');
            $command = escapeshellcmd('python ' . $pythonScript . ' ' . escapeshellarg($templateFile) . ' ' . escapeshellarg($filePath) . ' ' . escapeshellarg($dataPath));
            $output = shell_exec($command . ' 2>&1');

            unlink($dataPath);

            if (!file_exists($filePath)) {
                Log::error('Python script failed to generate PPTX: ' . $output);
                return response()->json(['error' => 'Failed to generate presentation via Python: ' . $output], 500);
            }

            Presentation::create([
                'user_id' => auth()->id(),
                'title' => $topic,
                'filename' => basename($filePath),
            ]);

            return response()->json(['message' => 'Presentation generated successfully', 'file' => basename($filePath)]);

        } catch (\Throwable $ex) {
            Log::error('Unhandled exception in generate(): ' . $ex->getMessage() . "\n" . $ex->getTraceAsString());
            return response()->json(['error' => 'Server error: ' . $ex->getMessage()], 500);
        }
    }

    private function sanitizeText($s)
    {
        $s = (string) $s;
        $s = preg_replace('/[\x00-\x8\x0B\x0C\x0E-\x1F\x7F]/', '', $s);
        $s = preg_replace("/\r\n|\r/", "\n", $s);
        if (!mb_check_encoding($s, 'UTF-8')) {
            $s = mb_convert_encoding($s, 'UTF-8', 'UTF-8');
        }
        $s = trim($s);
        return $s;
    }

    public function downloadPresentation($filename)
    {
        $safeFilename = basename($filename);
        $path = storage_path('app/public/' . $safeFilename);
        if (!file_exists($path)) {
            \Log::error("Presentation not found for download: {$path}");
            abort(404);
        }
        while (ob_get_level() > 0) {
            @ob_end_clean();
        }
        return response()->download($path, 'presentation.pptx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ]);
    }
}