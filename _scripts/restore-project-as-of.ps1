param(
    [Parameter(Mandatory = $true)]
    [datetime]$AsOfUtc,
    [Parameter(Mandatory = $true)]
    [string]$DestinationDirectory,
    [string[]]$BackupDirectories = @()
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ($BackupDirectories.Count -eq 0) {
    $BackupDirectories = @((Join-Path $projectRoot "backups"))
    $offsite = [Environment]::GetEnvironmentVariable("UNIVERSE_ENGINE_OFFSITE_BACKUP", "User")
    if (-not [string]::IsNullOrWhiteSpace($offsite)) { $BackupDirectories += $offsite }
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$recoveryPoints = foreach ($directory in $BackupDirectories | Select-Object -Unique) {
    if (-not (Test-Path -LiteralPath $directory)) { continue }
    foreach ($archive in Get-ChildItem -LiteralPath $directory -Filter "diablo-project-*.zip" -File) {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($archive.FullName)
        try {
            $manifestEntry = $zip.GetEntry("BACKUP_MANIFEST.json")
            if (-not $manifestEntry) { continue }
            $reader = [System.IO.StreamReader]::new($manifestEntry.Open())
            try { $manifest = $reader.ReadToEnd() | ConvertFrom-Json -DateKind String } finally { $reader.Dispose() }
            [pscustomobject]@{
                Archive = $archive.FullName
                CreatedAtUtc = [datetimeoffset]::Parse($manifest.createdAtUtc).UtcDateTime
                FileCount = [int]$manifest.fileCount
            }
        }
        finally { $zip.Dispose() }
    }
}

$targetTime = $AsOfUtc.ToUniversalTime()
$selected = $recoveryPoints |
    Where-Object { $_.CreatedAtUtc -le $targetTime } |
    Sort-Object CreatedAtUtc -Descending |
    Select-Object -First 1
if (-not $selected) { throw "No recovery point exists at or before $($targetTime.ToString('o'))." }

$destination = [System.IO.Path]::GetFullPath($DestinationDirectory)
if (Test-Path -LiteralPath $destination) {
    if ((Get-ChildItem -LiteralPath $destination -Force | Select-Object -First 1)) {
        throw "The PITR destination must be empty: $destination"
    }
} else {
    New-Item -ItemType Directory -Path $destination | Out-Null
}

& (Join-Path $PSScriptRoot "verify-project-backup.ps1") -ArchivePath $selected.Archive
Expand-Archive -LiteralPath $selected.Archive -DestinationPath $destination

Write-Output "POINT-IN-TIME RESTORE PASSED"
Write-Output "Requested as-of UTC: $($targetTime.ToString('o'))"
Write-Output "Selected recovery point UTC: $($selected.CreatedAtUtc.ToString('o'))"
Write-Output "Archive: $($selected.Archive)"
Write-Output "Destination: $destination"
Write-Output "Files: $($selected.FileCount)"
