$ErrorActionPreference = "Stop"
$testRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("diablo-pitr-test-" + [guid]::NewGuid().ToString("N"))
try {
    & (Join-Path $PSScriptRoot "restore-project-as-of.ps1") -AsOfUtc ([datetime]::UtcNow) -DestinationDirectory $testRoot
    if (-not (Test-Path -LiteralPath (Join-Path $testRoot "BACKUP_MANIFEST.json"))) {
        throw "PITR did not restore the backup manifest."
    }
    & node (Join-Path $testRoot "_scripts\raw-source-store.mjs") verify (Join-Path $testRoot "raw-source-store")
    if ($LASTEXITCODE -ne 0) { throw "PITR Raw Source Store verification failed." }
    Write-Output "PITR TEST PASSED"
}
finally {
    if (Test-Path -LiteralPath $testRoot) { Remove-Item -LiteralPath $testRoot -Recurse -Force }
}
