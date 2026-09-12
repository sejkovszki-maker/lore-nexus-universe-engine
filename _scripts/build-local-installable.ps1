$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$artifactRoot = Join-Path $projectRoot 'artifacts\local-installable'
$packageRoot = Join-Path $artifactRoot 'Lore-Nexus-Telepitheto'
$zipPath = Join-Path $artifactRoot 'Lore-Nexus-Telepitheto.zip'

Push-Location $projectRoot
try {
  npm run build
  if ($LASTEXITCODE -ne 0) { throw 'A telepíthető production build sikertelen.' }

  $required = @('dist\index.html', 'dist\manifest.webmanifest', 'dist\sw.js', 'dist\assets\lore-nexus-icon-192.svg', 'dist\assets\lore-nexus-icon-512.svg')
  foreach ($relativePath in $required) {
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot $relativePath))) {
      throw "Hiányzó telepítési fájl: $relativePath"
    }
  }

  if (Test-Path -LiteralPath $packageRoot) { Remove-Item -LiteralPath $packageRoot -Recurse -Force }
  if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
  New-Item -ItemType Directory -Path $packageRoot -Force | Out-Null
  Copy-Item -Path (Join-Path $projectRoot 'dist\*') -Destination $packageRoot -Recurse -Force
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'email-server.mjs') -Destination (Join-Path $packageRoot 'local-server.mjs')
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'INSTALLALHATO-OLVASSEL.txt') -Destination (Join-Path $packageRoot 'OLVASSEL-TELEPITES.txt')
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'local-install.ps1') -Destination (Join-Path $packageRoot 'local-install.ps1')
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'local-uninstall.ps1') -Destination (Join-Path $packageRoot 'local-uninstall.ps1')

  $launcher = "@echo off`r`ntitle Lore Nexus - Helyi telepitheto valtozat`r`nwhere node >nul 2>nul || (echo A Node.js nincs telepitve. Lasd: OLVASSEL-TELEPITES.txt & pause & exit /b 1)`r`nnode local-server.mjs`r`npause`r`n"
  [System.IO.File]::WriteAllText((Join-Path $packageRoot 'INDITAS.cmd'), $launcher, [System.Text.UTF8Encoding]::new($false))
  $unixLauncher = "#!/usr/bin/env sh`ncd -- `"`$(dirname -- `"`$0`")`" || exit 1`nnode local-server.mjs`n"
  [System.IO.File]::WriteAllText((Join-Path $packageRoot 'INDITAS.sh'), $unixLauncher, [System.Text.UTF8Encoding]::new($false))
  $installer = "@echo off`r`npowershell -NoProfile -ExecutionPolicy Bypass -File `%~dp0local-install.ps1`r`npause`r`n"
  $uninstaller = "@echo off`r`npowershell -NoProfile -ExecutionPolicy Bypass -File `%~dp0local-uninstall.ps1`r`npause`r`n"
  [System.IO.File]::WriteAllText((Join-Path $packageRoot 'TELEPITES.cmd'), $installer, [System.Text.UTF8Encoding]::new($false))
  [System.IO.File]::WriteAllText((Join-Path $packageRoot 'ELTAVOLITAS.cmd'), $uninstaller, [System.Text.UTF8Encoding]::new($false))

  Compress-Archive -LiteralPath $packageRoot -DestinationPath $zipPath -CompressionLevel Optimal
  $hash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash
  $size = (Get-Item -LiteralPath $zipPath).Length
  Write-Host "Telepíthető helyi csomag elkészült: $zipPath"
  Write-Host "Méret: $size byte"
  Write-Host "SHA-256: $hash"
} finally {
  Pop-Location
}
