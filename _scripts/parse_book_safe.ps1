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

$huLines = New-Object System.Collections.Generic.List[string]
for ($i = 1; $i -lt $validLines.Count; $i += 2) {
    $huLines.Add($validLines[$i])
}

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

$categoryStr = "Lore / K" + [char]0x00F6 + "nyvek - Olvas" + [char]0x00F3
$titleBase = "Az " + [char]0x00C1 + "rnyak Kir" + [char]0x00E1 + "lys" + [char]0x00E1 + "ga - "
$subtitleBase = "Richard A. Knaak: Az " + [char]0x00C1 + "rnyak Kir" + [char]0x00E1 + "lys" + [char]0x00E1 + "ga ("
$szerzoStr = "Szerz" + [char]0x0151
$mufajStr = "M" + [char]0x0171 + "faj"
$regenyStr = "Hivatalos Diablo Reg" + [char]0x00E9 + "ny"

$outFile = "c:\Users\Lezli\Desktop\Diablo\new_articles.js"
$outStream = [System.IO.StreamWriter]::new($outFile, $false, [System.Text.Encoding]::UTF8)

$outStream.WriteLine("/* KINGDOM OF SHADOW ARTICLES */")
$chapterCounter = 1

foreach ($ch in $chapters) {
    $id = "kingdom-of-shadow-ch$chapterCounter"
    $title = $titleBase + "$chapterCounter. Fejezet"
    $subtitle = $subtitleBase + "$($ch.Number))"
    
    $outStream.WriteLine("  `"$id`": {")
    $outStream.WriteLine("    id: `"$id`",")
    $outStream.WriteLine("    category: `"$categoryStr`",")
    $outStream.WriteLine("    title: `"$title`",")
    $outStream.WriteLine("    subtitle: `"$subtitle`",")
    $outStream.WriteLine("    infobox: {")
    $outStream.WriteLine("      `"$szerzoStr`": `"Richard A. Knaak`",")
    $outStream.WriteLine("      `"$mufajStr`": `"$regenyStr`",")
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
