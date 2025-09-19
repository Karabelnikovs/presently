<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpPresentation\PhpPresentation;
use PhpOffice\PhpPresentation\IOFactory;
use PhpOffice\PhpPresentation\Style\Alignment;
use PhpOffice\PhpPresentation\Style\Bullet;
use PhpOffice\PhpPresentation\Style\Color;
use PhpOffice\PhpPresentation\Slide\Background\Color as SlideBackgroundColor;
use PhpOffice\PhpPresentation\Slide\Note;
use Illuminate\Support\Facades\Response;
use App\Models\Presentation;

class PresentationController extends Controller
{


    public function index()
    {
        $presentations = auth()->user()->presentations;
        return response()->json($presentations);
    }

    public function generate(Request $request)
    {
        try {
            $topic = $request->input('topic', 'AI in Healthcare');
            $slideCount = (int) $request->input('slides', 5);
            $template = $request->input('template', 'default');

            switch ($template) {
                case 'modern':
                    $bgColor = 'FF475569';
                    $titleColor = 'FFFFFFFF';
                    $textColor = 'FFFFFFFF';
                    break;
                case 'corporate':
                    $bgColor = 'FF065F46';
                    $titleColor = 'FFFFFFFF';
                    $textColor = 'FFFFFFFF';
                    break;
                case 'vibrant':
                    $bgColor = 'FFF97316';
                    $titleColor = 'FF1F2937';
                    $textColor = 'FF1F2937';
                    break;
                case 'minimalist':
                    $bgColor = 'FFF3F4F6';
                    $titleColor = 'FF000000';
                    $textColor = 'FF000000';
                    break;
                case 'professional':
                    $bgColor = 'FF1E3A8A';
                    $titleColor = 'FFFFFFFF';
                    $textColor = 'FFFFFFFF';
                    break;
                case 'creative':
                    $bgColor = 'FF7C3AED';
                    $titleColor = 'FFF3F4F6';
                    $textColor = 'FFF3F4F6';
                    break;
                case 'light':
                    $bgColor = 'FFFFFFCC';
                    $titleColor = 'FF000000';
                    $textColor = 'FF000000';
                    break;
                default:
                    $bgColor = 'FFFFFFFF';
                    $titleColor = 'FF000000';
                    $textColor = 'FF000000';
                    break;
            }

            $prompt = "Generate a detailed presentation outline for '$topic' with exactly $slideCount slides. For each slide, provide: a concise but engaging title, 3-5 informative bullet points (use full sentences with examples, benefits, or key facts where possible), and a short speaker note (1-2 sentences for delivery tips). Ensure the output is complete and valid JSON. Output ONLY the JSON object in this exact format: {\"slides\": [{\"title\": \"\", \"bullets\": [\"\", \"\"], \"note\": \"\"}]}. Do not include any additional text, explanations, introductions, or notes outside the JSON. Respond only with valid JSON.";
            Log::info('Prompt: ' . $prompt);

            $systemPrompt = "You are a JSON generator. Always output only valid JSON as specified in the prompt.";

            $parsedData = null;
            for ($try = 1; $try <= 3; $try++) {
                $response = Http::timeout(240)
                    ->retry(3, 1000)
                    ->post('http://127.0.0.1:11434/api/generate', [
                        'model' => 'llama3',
                        'prompt' => $prompt,
                        'system' => $systemPrompt,
                        'format' => 'json',
                        'stream' => false,
                        'options' => ['temperature' => 0.5, 'num_predict' => -1]
                    ]);

                if ($response->failed()) {
                    Log::error("LLM request failed on try {$try}: {$response->status()} - " . substr($response->body(), 0, 400));
                    continue;
                }

                $ollamaData = json_decode($response->body(), true);
                if (json_last_error() !== JSON_ERROR_NONE || !isset($ollamaData['response'])) {
                    Log::warning("Invalid LLM wrapper JSON on try {$try}: " . json_last_error_msg());
                    continue;
                }

                $llmOutput = $ollamaData['response'];
                $parsedData = json_decode($llmOutput, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    $start = strpos($llmOutput, '{');
                    $end = strrpos($llmOutput, '}');
                    if ($start !== false && $end !== false && $end > $start) {
                        $jsonStr = substr($llmOutput, $start, $end - $start + 1);
                        $jsonStr = preg_replace('/,\s*]/', ']', $jsonStr);
                        $parsedData = json_decode($jsonStr, true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            Log::warning("Fallback parse still failed: " . json_last_error_msg());
                        }
                    } else {
                        Log::warning("No JSON braces found in LLM output.");
                    }
                }

                if (json_last_error() === JSON_ERROR_NONE && isset($parsedData['slides']) && is_array($parsedData['slides'])) {
                    break;
                }
                $parsedData = null;
            }

            if (!isset($parsedData['slides']) || !is_array($parsedData['slides'])) {
                Log::error('Could not obtain slides data from LLM after retries.');
                return response()->json(['error' => 'Could not obtain slides data from LLM'], 500);
            }

            $slidesData = $parsedData['slides'];
            Log::info('Parsed slides count: ' . count($slidesData));

            $presentation = new PhpPresentation();
            $presentation->getDocumentProperties()->setTitle($topic);

            $firstSlide = null;
            try {
                if (method_exists($presentation, 'getActiveSlide')) {
                    $firstSlide = $presentation->getActiveSlide();
                } elseif (method_exists($presentation, 'getSlide')) {
                    $firstSlide = $presentation->getSlide(0);
                } elseif (method_exists($presentation, 'getSlideByIndex')) {
                    $firstSlide = $presentation->getSlideByIndex(0);
                }
            } catch (\Throwable $e) {
                $firstSlide = null;
            }
            if ($firstSlide === null) {
                $firstSlide = $presentation->createSlide();
            }

            $created = 0;
            foreach ($slidesData as $index => $slideData) {
                $title = $this->sanitizeText($slideData['title'] ?? 'Untitled Slide');
                $bullets = isset($slideData['bullets']) && is_array($slideData['bullets']) ? array_map([$this, 'sanitizeText'], $slideData['bullets']) : [];
                $noteText = $this->sanitizeText($slideData['note'] ?? '');

                $slide = ($index === 0) ? $firstSlide : $presentation->createSlide();
                $created++;

                // Clear existing shapes if any
                try {
                    if (method_exists($slide, 'getShapes')) {
                        $shapes = $slide->getShapes();
                        if (is_array($shapes)) {
                            foreach ($shapes as $s) {
                                if (method_exists($slide, 'removeShape')) {
                                    try {
                                        $slide->removeShape($s);
                                    } catch (\Throwable $e) {
                                    }
                                }
                            }
                        }
                    }
                } catch (\Throwable $e) {
                }

                // Set slide background
                $background = new SlideBackgroundColor();
                $background->setColor(new Color($bgColor));
                $slide->setBackground($background);

                // Title shape
                $titleShape = $slide->createRichTextShape()
                    ->setHeight(100)
                    ->setWidth(900)
                    ->setOffsetX(40)
                    ->setOffsetY(40);
                $textRun = $titleShape->createTextRun($title);
                $textRun->getFont()
                    ->setName('Arial')
                    ->setBold(true)
                    ->setSize(32)
                    ->setColor(new Color($titleColor));
                $titleShape->getActiveParagraph()->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // Bullet points
                if (!empty($bullets)) {
                    $bodyShape = $slide->createRichTextShape()
                        ->setHeight(400)
                        ->setWidth(900)
                        ->setOffsetX(40)
                        ->setOffsetY(150);

                    // First bullet
                    $textRun = $bodyShape->createTextRun($bullets[0]);
                    $textRun->getFont()
                        ->setName('Arial')
                        ->setSize(18)
                        ->setColor(new Color($textColor));
                    $paragraph = $bodyShape->getActiveParagraph();
                    $paragraph->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    $paragraph->getBulletStyle()->setBulletType(Bullet::TYPE_BULLET);
                    $paragraph->getAlignment()->setMarginLeft(20);
                    $paragraph->getAlignment()->setIndent(-10);

                    for ($i = 1; $i < count($bullets); $i++) {
                        $bodyShape->createParagraph();
                        $textRun = $bodyShape->createTextRun($bullets[$i]);
                        $textRun->getFont()
                            ->setName('Arial')
                            ->setSize(18)
                            ->setColor(new Color($textColor));
                        $paragraph = $bodyShape->getActiveParagraph();
                        $paragraph->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $paragraph->getBulletStyle()->setBulletType(Bullet::TYPE_BULLET);
                        $paragraph->getAlignment()->setMarginLeft(20);
                        $paragraph->getAlignment()->setIndent(-10);
                    }
                }

                // Speaker note
                if (!empty($noteText)) {
                    $note = $slide->getNote();
                    $noteShape = $note->createRichTextShape()
                        ->setHeight(300)
                        ->setWidth(600)
                        ->setOffsetX(10)
                        ->setOffsetY(10);
                    $textRun = $noteShape->createTextRun($noteText);
                    $textRun->getFont()
                        ->setName('Arial')
                        ->setSize(12)
                        ->setColor(new Color('FF000000'));
                    $noteShape->getActiveParagraph()->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                }
            }

            if ($created === 0) {
                $presentation->createSlide();
            }

            $filePath = storage_path('app/public/presentation_' . time() . '.pptx');
            $dir = dirname($filePath);
            if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
                Log::error('Failed to create directory for presentation: ' . $dir);
                return response()->json(['error' => 'Server error saving presentation'], 500);
            }

            try {
                $writer = IOFactory::createWriter($presentation, 'PowerPoint2007');
                $writer->save($filePath);
            } catch (\Throwable $e) {
                Log::error('Failed to save presentation: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to save presentation: ' . $e->getMessage()], 500);
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
        $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $s);
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
            'Content-Length' => filesize($path),
            'Content-Transfer-Encoding' => 'binary',
            'Cache-Control' => 'private, max-age=0, must-revalidate'
        ]);
    }
}