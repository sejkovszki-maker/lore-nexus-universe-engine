param([string]$DesktopPath = '', [string]$ProgramsPath = '')
$ErrorActionPreference = 'Stop'

$desktop = if ($DesktopPath) { $DesktopPath } else { [Environment]::GetFolderPath('Desktop') }
$programs = if ($ProgramsPath) { $ProgramsPath } else { [Environment]::GetFolderPath('Programs') }
$desktopShortcut = Join-Path $desktop 'Lore Nexus.lnk'
$startFolder = Join-Path $programs 'Lore Nexus'
if (Test-Path -LiteralPath $desktopShortcut) { Remove-Item -LiteralPath $desktopShortcut -Force }
if (Test-Path -LiteralPath $startFolder) { Remove-Item -LiteralPath $startFolder -Recurse -Force }
Write-Host 'A Lore Nexus parancsikonjai eltávolítva. A helyi adatok és a program mappája megmaradt.'
