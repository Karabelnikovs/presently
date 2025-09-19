<?php
// tools/inspect_pptx.php
if ($argc < 2) {
    echo "Usage: php inspect_pptx.php path/to/file.pptx\n";
    exit(1);
}
$path = $argv[1];
if (!file_exists($path)) {
    echo "File not found: $path\n";
    exit(2);
}

$zip = new ZipArchive();
if ($zip->open($path) !== true) {
    echo "Cannot open zip: $path\n";
    exit(3);
}

echo "PPTX contains {$zip->numFiles} files. Listing up to 200 entries:\n";
$limit = min(200, $zip->numFiles);
for ($i = 0; $i < $limit; $i++) {
    echo " - " . $zip->getNameIndex($i) . "\n";
}

$checkFiles = [
    '[Content_Types].xml',
    '_rels/.rels',
    'ppt/presentation.xml',
    'ppt/_rels/presentation.xml.rels',
    'ppt/slides/slide1.xml',
    'ppt/slides/_rels/slide1.xml.rels',
];

echo "\nChecking existence of important parts:\n";
foreach ($checkFiles as $f) {
    echo (($zip->locateName($f) !== false) ? "[OK] " : "[MISSING] ") . $f . "\n";
}

echo "\nAttempting to parse ppt/slides/slide1.xml if present:\n";
$idx = $zip->locateName('ppt/slides/slide1.xml');
if ($idx !== false) {
    $xml = $zip->getFromIndex($idx);
    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    if ($dom->loadXML($xml) === false) {
        echo "slide1.xml is NOT well-formed XML. libxml errors:\n";
        foreach (libxml_get_errors() as $err) {
            echo "- " . trim($err->message) . " (line {$err->line})\n";
        }
    } else {
        echo "slide1.xml parsed OK. Root node: " . $dom->documentElement->nodeName . "\n";
        // show small excerpt
        $excerpt = substr($xml, 0, 800);
        echo "\nslide1.xml excerpt (first 800 chars):\n";
        echo $excerpt . "\n";
    }
} else {
    echo "slide1.xml not found.\n";
}

$zip->close();
