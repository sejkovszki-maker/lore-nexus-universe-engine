param(
    [string]$DestinationDirectory = "",
    [switch]$SkipRetention
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$policyPath = Join-Path $projectRoot "config\backup-policy.json"
$policy = Get-Content -LiteralPath $policyPath -Raw | ConvertFrom-Json

if ([string]::IsNullOrWhiteSpace($DestinationDirectory)) {
    $DestinationDirectory = Join-Path $projectRoot "backups"
}

& (Join-Path $PSScriptRoot "create-project-backup.ps1") -DestinationDirectory $DestinationDirectory

$latestArchive = Get-ChildItem -LiteralPath $DestinationDirectory -Filter "diablo-project-*.zip" |
    Sort-Object LastWriteTimeUtc -Descending |
    Select-Object -First 1
if (-not $latestArchive) { throw "The newly created backup archive was not found." }

& (Join-Path $PSScriptRoot "verify-project-backup.ps1") -ArchivePath $latestArchive.FullName

if (-not $SkipRetention) {
    $keepDaily = [int]$policy.retention.daily
    $archives = @(Get-ChildItem -LiteralPath $DestinationDirectory -Filter "diablo-project-*.zip" |
        Sort-Object LastWriteTimeUtc -Descending)
    $expired = @($archives | Select-Object -Skip $keepDaily)
    foreach ($archive in $expired) {
        $checksum = "$($archive.FullName).sha256"
        Remove-Item -LiteralPath $archive.FullName -Force
        if (Test-Path -LiteralPath $checksum) { Remove-Item -LiteralPath $checksum -Force }
    }
}

$offsiteDestination = [Environment]::GetEnvironmentVariable("UNIVERSE_ENGINE_OFFSITE_BACKUP", "User")
if ([string]::IsNullOrWhiteSpace($offsiteDestination)) {
    $offsiteDestination = $env:UNIVERSE_ENGINE_OFFSITE_BACKUP
}
if (-not [string]::IsNullOrWhiteSpace($offsiteDestination)) {
    & (Join-Path $PSScriptRoot "replicate-backup-offsite.ps1") -DestinationDirectory $offsiteDestination
}

Write-Output "AUTOMATED BACKUP COMPLETED: $($latestArchive.FullName)"
