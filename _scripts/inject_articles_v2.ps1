$ErrorActionPreference = "Stop"

$data = [System.IO.File]::ReadAllText("c:\Users\Lezli\Desktop\Diablo\data.js", [System.Text.Encoding]::UTF8)
$newArticles = [System.IO.File]::ReadAllText("c:\Users\Lezli\Desktop\Diablo\new_articles.js", [System.Text.Encoding]::UTF8)

# Find where to inject
$idx = $data.IndexOf("const timelineData = [")
if ($idx -lt 0) {
    Write-Host "Could not find timelineData array"
    exit
}

# The block right before timelineData is `};`
$target = "};`r`n`r`nconst timelineData = ["
$replacement = $newArticles + "`r`n};`r`n`r`nconst timelineData = ["

if ($data.Contains($target)) {
    $data = $data.Replace($target, $replacement)
    [System.IO.File]::WriteAllText("c:\Users\Lezli\Desktop\Diablo\data.js", $data, [System.Text.Encoding]::UTF8)
    Write-Host "Injection complete!"
} else {
    Write-Host "Could not find exactly matching target string."
    # Fallback target (LF instead of CRLF)
    $targetLF = "};`n`nconst timelineData = ["
    $replacementLF = $newArticles + "`n};`n`nconst timelineData = ["
    if ($data.Contains($targetLF)) {
        $data = $data.Replace($targetLF, $replacementLF)
        [System.IO.File]::WriteAllText("c:\Users\Lezli\Desktop\Diablo\data.js", $data, [System.Text.Encoding]::UTF8)
        Write-Host "Injection complete (LF)!"
    } else {
        # Another fallback
        $targetFallback = "};`r`nconst timelineData = ["
        if ($data.Contains($targetFallback)) {
            $data = $data.Replace($targetFallback, $replacement)
            [System.IO.File]::WriteAllText("c:\Users\Lezli\Desktop\Diablo\data.js", $data, [System.Text.Encoding]::UTF8)
            Write-Host "Injection complete (Fallback 1)!"
        } else {
            Write-Host "Could not find target with LF either."
        }
    }
}
