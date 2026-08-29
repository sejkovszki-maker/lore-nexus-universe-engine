param(
    [string]$ArchivePath = ""
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ([string]::IsNullOrWhiteSpace($ArchivePath)) {
    $ArchivePath = (Get-ChildItem -LiteralPath (Join-Path $projectRoot "backups") -Filter "diablo-project-*.zip" |
        Sort-Object LastWriteTimeUtc -Descending |
        Select-Object -First 1).FullName
}
if ([string]::IsNullOrWhiteSpace($ArchivePath)) { throw "No backup archive is available for restore testing." }

$resolvedArchive = (Resolve-Path -LiteralPath $ArchivePath).Path
$restoreRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("diablo-restore-test-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $restoreRoot | Out-Null

try {
    Expand-Archive -LiteralPath $resolvedArchive -DestinationPath $restoreRoot
    $manifestPath = Join-Path $restoreRoot "BACKUP_MANIFEST.json"
    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json

    foreach ($entry in $manifest.files) {
        $restoredPath = Join-Path $restoreRoot $entry.path.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        if (-not (Test-Path -LiteralPath $restoredPath -PathType Leaf)) { throw "Restore missing file: $($entry.path)" }
        $actualHash = (Get-FileHash -LiteralPath $restoredPath -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actualHash -ne $entry.sha256) { throw "Restore hash mismatch: $($entry.path)" }
    }

    $rawStoreScript = Join-Path $restoreRoot "_scripts\raw-source-store.mjs"
    $rawStore = Join-Path $restoreRoot "raw-source-store"
    if ((Test-Path -LiteralPath $rawStoreScript) -and (Test-Path -LiteralPath $rawStore)) {
        & node $rawStoreScript verify $rawStore
        if ($LASTEXITCODE -ne 0) { throw "Restored Raw Source Store verification failed." }
    }

    Write-Output "RESTORE TEST PASSED"
    Write-Output "Archive: $resolvedArchive"
    Write-Output "Restored files: $($manifest.fileCount)"
}
finally {
    if (Test-Path -LiteralPath $restoreRoot) { Remove-Item -LiteralPath $restoreRoot -Recurse -Force }
}
