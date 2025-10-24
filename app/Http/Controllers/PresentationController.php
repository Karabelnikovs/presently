<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Presentation;
use PhpOffice\PhpWord\IOFactory;
use ZipArchive;
use DOMDocument;
use DOMXPath;

class PresentationController extends Controller
{
    // Kontrolieris, kas apstrādā prezentāciju ģenerēšanu un lejupielādi.

    public function index()
    {
        // Iegūst visas pašreizējā lietotāja prezentācijas un atgriež JSON.
        $presentations = auth()->user()->presentations;
        return response()->json($presentations);
    }

    public function generate(Request $request)
    {
        // Galvenā funkcija prezentācijas izveidei.
        $useMockData = false;
        set_time_limit(300);
        ini_set('max_execution_time', 300);

        try {
            // Validē ienākošos datus no formas.
            $request->validate([
                'topic' => 'string|nullable',
                'slides' => 'integer|min:1|max:20',
                'template' => 'string|required',
                'docx_file' => 'nullable|file|mimes:docx|max:5120',
            ]);

            // Noklusējuma vērtības, ja netiek iedotas.
            $topic = $request->input('topic', 'AI in Healthcare');
            $slideCount = (int) $request->input('slides', 5);
            $templateId = $request->input('template', 'default');

            $documentContent = '';

            if ($request->hasFile('docx_file')) {
                // Ja lietotājs augšupielādē .docx, saglabā to pagaidām.
                $file = $request->file('docx_file');
                $tempPath = $file->store('temp');

                $fullPath = Storage::path($tempPath);

                if (!file_exists($fullPath)) {
                    return response()->json(['error' => 'Uploaded file could not be processed.'], 500);
                }

                $loadAttempts = 0;
                $maxAttempts = 2;

                while ($loadAttempts < $maxAttempts) {
                    try {
                        // Mēģina ielādēt .docx ar PhpWord.
                        $phpWord = IOFactory::load($fullPath);
                        $sections = $phpWord->getSections();
                        $documentContent = '';

                        // Nolasām tekstu no visām sadaļām.
                        foreach ($sections as $section) {
                            $elements = $section->getElements();
                            foreach ($elements as $element) {
                                if (method_exists($element, 'getText')) {
                                    $text = $element->getText();
                                    if (is_array($text)) {
                                        $text = implode(' ', $text);
                                    }
                                    $documentContent .= $text . "\n";
                                }
                            }
                        }

                        // Attīrām tekstu no nepareizām rakstzīmēm.
                        $documentContent = $this->sanitizeText($documentContent);
                        break;
                    } catch (\PhpOffice\PhpWord\Exception\Exception $e) {
                        // Ja rodas kļūda, reģistrējam un mēģinām novērst noteiktu problēmu.
                        Log::error('Error loading DOCX file: ' . $e->getMessage() . ' Path: ' . $fullPath);

                        if (strpos($e->getMessage(), 'Cannot add PageBreak in Cell') !== false && $loadAttempts === 0) {
                            // Mēģinām noņemt lapu pārrāvumus tabulas šūnās un ielādēt vēlreiz.
                            if ($this->removePageBreaksInCells($fullPath)) {
                                Log::info('Attempted to remove invalid page breaks from DOCX file: ' . $fullPath);
                                $loadAttempts++;
                                continue;
                            } else {
                                Log::error('Failed to remove invalid page breaks from DOCX file: ' . $fullPath);
                            }
                        }

                        return response()->json(['error' => 'The uploaded file is not a valid .docx document. ' . $e->getMessage()], 400);
                    } finally {
                        // Dzēš pagaidu failu, ja esam beiguši mēģinājumus vai jau ir saturs.
                        if ($loadAttempts >= $maxAttempts || !empty($documentContent)) {
                            Storage::delete($tempPath);
                        }
                    }
                }

                if (empty($topic)) {
                    // Ja nav tēmas, izmanto vispārīgu nosaukumu.
                    $topic = 'Presentation based on uploaded document';
                }
            }

            // Nosaka pieejamo template faila ceļu.
            $templateDir = config('presentation.templates_dir', resource_path('templates'));
            $templateFile = $templateDir . DIRECTORY_SEPARATOR . "{$templateId}.potx";

            if (!file_exists($templateFile)) {
                return response()->json(['error' => "The selected design template '{$templateId}' is not available."], 400);
            }

            $parsedData = null;

            if ($useMockData) {
                // Testēšanas režīms ar parauga datiem.
                $mockJson = '{
                    "slides": [
                        { "title": "The Dawn of a New Era", "bullets": ["Artificial Intelligence is revolutionizing the healthcare industry.", "From diagnostics to treatment, AI is enhancing capabilities.", "This presentation will explore the key impacts of AI in modern medicine."]},
                        { "title": "AI in Medical Diagnostics", "bullets": ["AI algorithms can analyze medical images (X-rays, MRIs) with high accuracy.", "It helps in early detection of diseases like cancer and diabetic retinopathy.", "Machine learning models predict patient risk factors from EHR data."]},
                        { "title": "Challenges and Ethical Considerations", "bullets": ["Data privacy and security are paramount concerns.", "Ensuring the fairness and avoiding bias in AI algorithms is crucial.", "Regulatory approval and integration into existing workflows pose challenges."]}
                    ]
                }';
                $parsedData = json_decode($mockJson, true);
            } else {
                // Sagatavojam promptu iekšējam LLM vai ģeneratoram.
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

                // Mēģinām sazināties ar lokālu LLM servisu līdz 3 reizes.
                for ($try = 1; $try <= 3; $try++) {
                    $response = Http::timeout(240)->post('http://127.0.0.1:11434/api/generate', [
                        'model' => 'llama3.1:8b',
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
                // Ja nevar iegūt derīgus slaidu datus, atgriež kļūdu.
                return response()->json(['error' => 'Could not obtain valid slides data.'], 500);
            }

            if (isset($parsedData['slides'][0])) {
                // Pirmajam slaidam uzstāda tēmu kā nosaukumu.
                $parsedData['slides'][0]['title'] = $topic;
            }

            $data = [
                'topic' => $topic,
                'slides' => $parsedData['slides'],
            ];

            // Saglabājam datus īslaicīgā JSON failā, ko izmantos Python skripts.
            $dataFile = 'presentation_data_' . time() . '.json';
            $dataPath = storage_path('app/temp/' . $dataFile);
            if (!file_exists(dirname($dataPath))) {
                mkdir(dirname($dataPath), 0755, true);
            }
            file_put_contents($dataPath, json_encode($data));

            // Gala PPTX faila ceļš publiskajā storage.
            $filePath = storage_path('app/public/presentation_' . time() . '.pptx');

            // Izsaucam ārējo Python skriptu, kas uzbūvē prezentāciju no template un datiem.
            $pythonScript = base_path('scripts/generate_presentation.py');
            $command = escapeshellcmd('python3 ' . $pythonScript . ' ' . escapeshellarg($templateFile) . ' ' . escapeshellarg($filePath) . ' ' . escapeshellarg($dataPath));
            $output = shell_exec($command . ' 2>&1');

            // Noņemam pagaidu JSON failu pēc skripta izpildes.
            unlink($dataPath);

            if (!file_exists($filePath)) {
                // Ja fails netika izveidots, atgriežam kļūdu ar skripta izvadāmo info.
                return response()->json(['error' => 'Failed to generate presentation via Python: ' . $output], 500);
            }

            // Saglabā ierakstu datubāzē par jauno prezentāciju.
            Presentation::create([
                'user_id' => auth()->id(),
                'title' => $topic,
                'filename' => basename($filePath),
            ]);

            return response()->json(['message' => 'Presentation generated successfully', 'file' => basename($filePath)]);

        } catch (\Throwable $ex) {
            // Vispārēja kļūdu apstrāde un ierakstīšana logā.
            Log::error('Unhandled exception in generate(): ' . $ex->getMessage() . "\n" . $ex->getTraceAsString());
            return response()->json(['error' => 'Server error: ' . $ex->getMessage()], 500);
        }
    }

    private function removePageBreaksInCells($filePath)
    {
        // Atver .docx (ZIP), meklē lapu pārrāvumus tabulu šūnās un tos noņem.
        $zip = new ZipArchive();
        if ($zip->open($filePath) !== true) {
            return false;
        }

        $xml = $zip->getFromName('word/document.xml');
        if ($xml === false) {
            $zip->close();
            return false;
        }

        $dom = new DOMDocument();
        if (!$dom->loadXML($xml)) {
            $zip->close();
            return false;
        }

        $xp = new DOMXPath($dom);
        $xp->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

        // Atrod un izdzēš visus w:br elementus ar tipu "page" šūnās.
        $breaks = $xp->query('//w:tc//w:br[@w:type="page"]');
        foreach ($breaks as $break) {
            $break->parentNode->removeChild($break);
        }

        $newXml = $dom->saveXML();
        if (!$zip->addFromString('word/document.xml', $newXml)) {
            $zip->close();
            return false;
        }

        $zip->close();
        return true;
    }

    private function sanitizeText($s)
    {
        // Vienkārša teksta attīrīšana: noņem kontrolrakstzīmes, normalizē jaunās rindas, pārbauda UTF-8.
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
        // Lejupielādes funkcija: atgriež PPTX failu lietotājam.
        $safeFilename = basename($filename);
        $path = storage_path('app/public/' . $safeFilename);
        if (!file_exists($path)) {
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
