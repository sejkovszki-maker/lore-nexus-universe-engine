param(
    [string]$DestinationDirectory = $env:UNIVERSE_ENGINE_OFFSITE_BACKUP
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$localBackupRoot = Join-Path $projectRoot "backups"

if ([string]::IsNullOrWhiteSpace($DestinationDirectory)) {
    throw "No independent backup destination configured. Set UNIVERSE_ENGINE_OFFSITE_BACKUP or pass -DestinationDirectory."
}

$destination = [System.IO.Path]::GetFullPath($DestinationDirectory)
if ($destination.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "The disaster-recovery destination must be outside the project directory."
}

New-Item -ItemType Directory -Force -Path $destination | Out-Null
$latestArchive = Get-ChildItem -LiteralPath $localBackupRoot -Filter "diablo-project-*.zip" |
    Sort-Object LastWriteTimeUtc -Descending |
    Select-Object -First 1
if (-not $latestArchive) { throw "No local backup is available for replication." }

$checksumPath = "$($latestArchive.FullName).sha256"
if (-not (Test-Path -LiteralPath $checksumPath)) { throw "Backup checksum is missing: $checksumPath" }

$targetArchive = Join-Path $destination $latestArchive.Name
$targetChecksum = Join-Path $destination ([System.IO.Path]::GetFileName($checksumPath))
Copy-Item -LiteralPath $latestArchive.FullName -Destination $targetArchive -Force
Copy-Item -LiteralPath $checksumPath -Destination $targetChecksum -Force

$sourceHash = (Get-FileHash -LiteralPath $latestArchive.FullName -Algorithm SHA256).Hash
$targetHash = (Get-FileHash -LiteralPath $targetArchive -Algorithm SHA256).Hash
if ($sourceHash -ne $targetHash) { throw "Offsite replication hash mismatch." }

Write-Output "OFFSITE REPLICATION VERIFIED"
Write-Output "Source: $($latestArchive.FullName)"
Write-Output "Destination: $targetArchive"
Write-Output "SHA-256: $($targetHash.ToLowerInvariant())"
