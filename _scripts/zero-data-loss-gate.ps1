$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$localBackupRoot = Join-Path $projectRoot "backups"
$offsiteRoot = [Environment]::GetEnvironmentVariable("UNIVERSE_ENGINE_OFFSITE_BACKUP", "User")

& node (Join-Path $PSScriptRoot "raw-source-store.mjs") verify (Join-Path $projectRoot "raw-source-store")
if ($LASTEXITCODE -ne 0) { throw "Zero Data Loss Gate: Raw Source Store verification failed." }
& node (Join-Path $PSScriptRoot "audit-log.mjs") verify (Join-Path $projectRoot "audit\events.jsonl")
if ($LASTEXITCODE -ne 0) { throw "Zero Data Loss Gate: audit chain verification failed." }

$localArchive = Get-ChildItem -LiteralPath $localBackupRoot -Filter "diablo-project-*.zip" |
    Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
if (-not $localArchive) { throw "Zero Data Loss Gate: no local backup." }
if (((Get-Date).ToUniversalTime() - $localArchive.LastWriteTimeUtc).TotalHours -gt 24) {
    throw "Zero Data Loss Gate: latest local backup is older than 24 hours."
}
& (Join-Path $PSScriptRoot "verify-project-backup.ps1") -ArchivePath $localArchive.FullName

if ([string]::IsNullOrWhiteSpace($offsiteRoot) -or -not (Test-Path -LiteralPath $offsiteRoot)) {
    throw "Zero Data Loss Gate: independent backup destination is unavailable."
}
$offsiteArchive = Join-Path $offsiteRoot $localArchive.Name
if (-not (Test-Path -LiteralPath $offsiteArchive)) {
    throw "Zero Data Loss Gate: latest local backup has not been replicated offsite."
}
$localHash = (Get-FileHash -LiteralPath $localArchive.FullName -Algorithm SHA256).Hash
$offsiteHash = (Get-FileHash -LiteralPath $offsiteArchive -Algorithm SHA256).Hash
if ($localHash -ne $offsiteHash) { throw "Zero Data Loss Gate: local/offsite hash mismatch." }

$projectDrive = (Split-Path -Qualifier $projectRoot).TrimEnd(':')
$offsiteDrive = (Split-Path -Qualifier $offsiteRoot).TrimEnd(':')
$projectDisk = (Get-Partition -DriveLetter $projectDrive).DiskNumber
$offsiteDisk = (Get-Partition -DriveLetter $offsiteDrive).DiskNumber
if ($projectDisk -eq $offsiteDisk) { throw "Zero Data Loss Gate: backup copies are on the same physical disk." }

$scheduledTask = Get-ScheduledTask -TaskName "UniverseEngine-DailyBackup" -ErrorAction Stop
if ($scheduledTask.State -eq 'Disabled') { throw "Zero Data Loss Gate: daily backup task is disabled." }

Write-Output "ZERO DATA LOSS GATE PASSED"
Write-Output "Raw objects: verified"
Write-Output "Audit chain: verified"
Write-Output "Local backup: $($localArchive.FullName)"
Write-Output "Independent backup: $offsiteArchive"
Write-Output "Physical disks: project=$projectDisk, offsite=$offsiteDisk"
Write-Output "Schedule state: $($scheduledTask.State)"
