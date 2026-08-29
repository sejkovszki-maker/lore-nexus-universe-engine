param(
    [string]$DestinationDirectory = ""
)

$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ([string]::IsNullOrWhiteSpace($DestinationDirectory)) {
    $DestinationDirectory = Join-Path $projectRoot "backups"
}

$destination = [System.IO.Path]::GetFullPath($DestinationDirectory)
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupName = "diablo-project-$timestamp"
$archivePath = Join-Path $destination "$backupName.zip"
$archiveHashPath = Join-Path $destination "$backupName.zip.sha256"
$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) $backupName

$excludedDirectoryNames = @("node_modules", "dist", "backups", ".git", ".python-deps")

New-Item -ItemType Directory -Force -Path $destination | Out-Null
New-Item -ItemType Directory -Force -Path $temporaryRoot | Out-Null

try {
    $sourceFiles = Get-ChildItem -LiteralPath $projectRoot -Recurse -File -Force |
        Where-Object {
            $relative = [System.IO.Path]::GetRelativePath($projectRoot, $_.FullName)
            $segments = $relative -split '[\\/]'
            -not ($segments | Where-Object { $excludedDirectoryNames -contains $_ })
        } |
        Sort-Object FullName

    $manifestEntries = foreach ($file in $sourceFiles) {
        $relativePath = [System.IO.Path]::GetRelativePath($projectRoot, $file.FullName)
        $targetPath = Join-Path $temporaryRoot $relativePath
        $targetDirectory = Split-Path -Parent $targetPath
        New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null
        Copy-Item -LiteralPath $file.FullName -Destination $targetPath

        [ordered]@{
            path = $relativePath.Replace('\\', '/')
            size = $file.Length
            sha256 = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
            lastWriteTimeUtc = $file.LastWriteTimeUtc.ToString("o")
        }
    }

    $totalBytes = ($sourceFiles | Measure-Object -Property Length -Sum).Sum
    $manifest = [ordered]@{
        formatVersion = 1
        createdAtUtc = (Get-Date).ToUniversalTime().ToString("o")
        projectRootAtCreation = $projectRoot
        exclusions = $excludedDirectoryNames
        fileCount = @($manifestEntries).Count
        totalBytes = $totalBytes
        files = @($manifestEntries)
    }

    $manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $temporaryRoot "BACKUP_MANIFEST.json") -Encoding utf8
    Compress-Archive -Path (Join-Path $temporaryRoot "*") -DestinationPath $archivePath -CompressionLevel Optimal

    $archiveHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
    "$archiveHash  $([System.IO.Path]::GetFileName($archivePath))" | Set-Content -LiteralPath $archiveHashPath -Encoding ascii

    Write-Output "Archive: $archivePath"
    Write-Output "Checksum: $archiveHashPath"
    Write-Output "Files: $(@($manifestEntries).Count)"
    Write-Output "Source bytes: $($manifest.totalBytes)"
}
finally {
    if (Test-Path -LiteralPath $temporaryRoot) {
        Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
    }
}
