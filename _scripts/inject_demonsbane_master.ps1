$ErrorActionPreference = "Stop"

$data = [System.IO.File]::ReadAllText("c:\Users\Lezli\Desktop\Diablo\data.js", [System.Text.Encoding]::UTF8)
$newArticle = [System.IO.File]::ReadAllText("c:\Users\Lezli\Desktop\Diablo\demonsbane_master.js", [System.Text.Encoding]::UTF8)

# Find where to inject
$target = "`n  }`n};"
if (!$data.Contains($target)) {
    $target = "`r`n  }`r`n};"
}

if ($data.Contains($target)) {
    $replacement = "`n  },`n" + $newArticle + "`n};"
    $data = $data.Replace($target, $replacement)
    [System.IO.File]::WriteAllText("c:\Users\Lezli\Desktop\Diablo\data.js", $data, [System.Text.Encoding]::UTF8)
    Write-Host "Injection complete!"
} else {
    Write-Host "Could not find target to inject."
}
