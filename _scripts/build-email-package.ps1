$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$artifactRoot = Join-Path $projectRoot 'artifacts\email-package'
$packageRoot = Join-Path $artifactRoot 'Lore-Nexus-Offline'
$zipPath = Join-Path $artifactRoot 'Lore-Nexus-Offline.zip'

Push-Location $projectRoot
try {
  $previousEmailPackage = $env:EMAIL_PACKAGE
  $env:EMAIL_PACKAGE = '1'
  npm run build
  if ($LASTEXITCODE -ne 0) { throw 'A production build sikertelen.' }
  if ($null -eq $previousEmailPackage) { Remove-Item Env:EMAIL_PACKAGE } else { $env:EMAIL_PACKAGE = $previousEmailPackage }

  if (Test-Path -LiteralPath $packageRoot) { Remove-Item -LiteralPath $packageRoot -Recurse -Force }
  if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
  New-Item -ItemType Directory -Path $packageRoot -Force | Out-Null
  Copy-Item -Path (Join-Path $projectRoot 'dist\*') -Destination $packageRoot -Recurse -Force
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'email-server.mjs') -Destination (Join-Path $packageRoot 'email-server.mjs')
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'EMAIL-OLVASSEL.txt') -Destination (Join-Path $packageRoot 'OLVASSEL.txt')

  $launcher = "@echo off`r`ntitle Lore Nexus Offline`r`nwhere node >nul 2>nul || (echo A Node.js nincs telepitve. Lasd: OLVASSEL.txt & pause & exit /b 1)`r`nnode email-server.mjs`r`npause`r`n"
  [System.IO.File]::WriteAllText((Join-Path $packageRoot 'INDITAS.cmd'), $launcher, [System.Text.UTF8Encoding]::new($false))
  $unixLauncher = "#!/usr/bin/env sh`ncd -- `"`$(dirname -- `"`$0`")`" || exit 1`nnode email-server.mjs`n"
  [System.IO.File]::WriteAllText((Join-Path $packageRoot 'INDITAS.sh'), $unixLauncher, [System.Text.UTF8Encoding]::new($false))

  Compress-Archive -LiteralPath $packageRoot -DestinationPath $zipPath -CompressionLevel Optimal
  $hash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash
  $size = (Get-Item -LiteralPath $zipPath).Length
  Write-Host "E-mail csomag elkészült: $zipPath"
  Write-Host "Méret: $size byte"
  Write-Host "SHA-256: $hash"
} finally {
  if ($null -eq $previousEmailPackage) { Remove-Item Env:EMAIL_PACKAGE -ErrorAction SilentlyContinue } else { $env:EMAIL_PACKAGE = $previousEmailPackage }
  Pop-Location
}
