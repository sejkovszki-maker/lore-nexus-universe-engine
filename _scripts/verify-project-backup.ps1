param(
    [Parameter(Mandatory = $true)]
    [string]$ArchivePath
)

$ErrorActionPreference = "Stop"

$resolvedArchive = (Resolve-Path -LiteralPath $ArchivePath).Path
$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("diablo-backup-verify-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $temporaryRoot | Out-Null

try {
    Expand-Archive -LiteralPath $resolvedArchive -DestinationPath $temporaryRoot
    $manifestPath = Join-Path $temporaryRoot "BACKUP_MANIFEST.json"
    if (-not (Test-Path -LiteralPath $manifestPath)) {
        throw "A mentés nem tartalmaz BACKUP_MANIFEST.json fájlt."
    }

    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    $errors = [System.Collections.Generic.List[string]]::new()

    foreach ($entry in $manifest.files) {
        $relativePath = $entry.path.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $filePath = Join-Path $temporaryRoot $relativePath
        if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
            $errors.Add("Hiányzó fájl: $($entry.path)")
            continue
        }

        $file = Get-Item -LiteralPath $filePath
        if ($file.Length -ne [long]$entry.size) {
            $errors.Add("Eltérő méret: $($entry.path)")
        }

        $actualHash = (Get-FileHash -LiteralPath $filePath -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actualHash -ne $entry.sha256) {
            $errors.Add("Eltérő SHA-256: $($entry.path)")
        }
    }

    $verifiedFiles = Get-ChildItem -LiteralPath $temporaryRoot -Recurse -File |
        Where-Object { $_.FullName -ne $manifestPath }
    if (@($verifiedFiles).Count -ne [int]$manifest.fileCount) {
        $errors.Add("Eltérő fájlszám: manifest=$($manifest.fileCount), archívum=$(@($verifiedFiles).Count)")
    }

    if ($errors.Count -gt 0) {
        $errors | ForEach-Object { Write-Error $_ }
        throw "A mentés ellenőrzése sikertelen: $($errors.Count) hiba."
    }

    Write-Output "BACKUP VERIFIED"
    Write-Output "Archive: $resolvedArchive"
    Write-Output "Files: $($manifest.fileCount)"
    Write-Output "Source bytes: $($manifest.totalBytes)"
}
finally {
    if (Test-Path -LiteralPath $temporaryRoot) {
        Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
    }
}
