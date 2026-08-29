$ErrorActionPreference = "Stop"

Write-Host "Reading file..."
$lines = [System.IO.File]::ReadAllLines("c:\Users\Lezli\Desktop\Diablo\qxns4830 - Ismeretlen.txt", [System.Text.Encoding]::UTF8)

$validLines = New-Object System.Collections.Generic.List[string]
foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if ($trimmed.Length -gt 0) {
        $validLines.Add($trimmed)
    }
}

Write-Host "Total non-empty lines: $($validLines.Count)"

$huLines = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -lt $validLines.Count; $i += 2) {
    $huLines.Add($validLines[$i])
}

Write-Host "Total HU lines: $($huLines.Count)"

$chapterNames = @(
    'EGY', 'KÉT', 'KETTŐ', 'HÁROM', 'NÉGY', 'ÖT', 'HAT', 'HÉT', 'NYOLC', 'KILENC', 'TÍZ',
    'TIZENEGY', 'TIZENKETTŐ', 'TIZENHÁROM', 'TIZENNÉGY', 'TIZENÖT', 'TIZENHAT', 'TIZENHÉT', 'TIZENNYOLC', 'TIZENKILENC',
    'HÚSZ', 'HUSZONEGY', 'HUSZONKETTŐ', 'HUSZONHÁROM', 'HUSZONNÉGY', 'HUSZONÖT', 'HUSZONHAT', 'HUSZONHÉT', 'HUSZONNYOLC', 'HUSZONKILENC',
    'HARMINC', 'HARMINCEGY', 'HARMINCKETTŐ', 'HARMINCHÁROM', 'HARMINCNÉGY', 'HARMINCÖT'
)

$chapters = New-Object System.Collections.Generic.List[PSObject]
$currentChapter = $null

foreach ($line in $huLines) {
    $upperLine = $line.ToUpper()
    if ($chapterNames -contains $upperLine) {
        if ($currentChapter -ne $null) {
            $chapters.Add($currentChapter)
        }
        $currentChapter = New-Object PSObject -Property @{
            Number = $upperLine
            Content = New-Object System.Collections.Generic.List[string]
        }
    } else {
        if ($currentChapter -ne $null) {
            $currentChapter.Content.Add($line)
        }
    }
}
if ($currentChapter -ne $null) {
    $chapters.Add($currentChapter)
}

Write-Host "Found $($chapters.Count) chapters."

$outFile = "c:\Users\Lezli\Desktop\Diablo\new_articles.js"
$outStream = [System.IO.StreamWriter]::new($outFile, $false, [System.Text.Encoding]::UTF8)

$outStream.WriteLine("/* KINGDOM OF SHADOW ARTICLES */")
$chapterCounter = 1

foreach ($ch in $chapters) {
    $id = "kingdom-of-shadow-ch$chapterCounter"
    $title = "Az Árnyak Királysága - $chapterCounter. Fejezet"
    $subtitle = "Richard A. Knaak: Az Árnyak Királysága ($($ch.Number))"
    
    $outStream.WriteLine("  `"$id`": {")
    $outStream.WriteLine("    id: `"$id`",")
    $outStream.WriteLine("    category: `"Lore / Könyvek - Olvasó`",")
    $outStream.WriteLine("    title: `"$title`",")
    $outStream.WriteLine("    subtitle: `"$subtitle`",")
    $outStream.WriteLine("    infobox: {")
    $outStream.WriteLine("      `"Szerző`": `"Richard A. Knaak`",")
    $outStream.WriteLine("      `"Műfaj`": `"Hivatalos Diablo Regény`",")
    $outStream.WriteLine("      `"Fejezet`": `"$($ch.Number)`"")
    $outStream.WriteLine("    },")
    $outStream.WriteLine("    content: ``")
    
    foreach ($p in $ch.Content) {
        $safeP = $p.Replace("``", "\``").Replace("$", "\$")
        $outStream.WriteLine("<p>$safeP</p>")
    }
    
    $outStream.WriteLine("``")
    $outStream.WriteLine("  },")
    
    $chapterCounter++
}

$outStream.Close()
Write-Host "Successfully generated new_articles.js!"
