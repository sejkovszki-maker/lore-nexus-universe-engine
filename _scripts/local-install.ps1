param([string]$DesktopPath = '', [string]$ProgramsPath = '')
$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcher = Join-Path $packageRoot 'INDITAS.cmd'
if (-not (Test-Path -LiteralPath $launcher)) { throw 'Az INDITAS.cmd nem található.' }

$shell = New-Object -ComObject WScript.Shell
$desktop = if ($DesktopPath) { $DesktopPath } else { [Environment]::GetFolderPath('Desktop') }
$programs = if ($ProgramsPath) { $ProgramsPath } else { [Environment]::GetFolderPath('Programs') }
New-Item -ItemType Directory -Path $desktop -Force | Out-Null
New-Item -ItemType Directory -Path $programs -Force | Out-Null
$startFolder = Join-Path $programs 'Lore Nexus'
New-Item -ItemType Directory -Path $startFolder -Force | Out-Null

foreach ($shortcutPath in @((Join-Path $desktop 'Lore Nexus.lnk'), (Join-Path $startFolder 'Lore Nexus.lnk'))) {
  $shortcut = $shell.CreateShortcut($shortcutPath)
  $shortcut.TargetPath = $launcher
  $shortcut.WorkingDirectory = $packageRoot
  $shortcut.Description = 'Lore Nexus – helyi Diablo-enciklopédia'
  $shortcut.Save()
}

$removeShortcut = $shell.CreateShortcut((Join-Path $startFolder 'Lore Nexus eltávolítása.lnk'))
$removeShortcut.TargetPath = (Join-Path $packageRoot 'ELTAVOLITAS.cmd')
$removeShortcut.WorkingDirectory = $packageRoot
$removeShortcut.Description = 'Lore Nexus helyi parancsikonjainak eltávolítása'
$removeShortcut.Save()

Write-Host 'A Lore Nexus parancsikonjai elkészültek az Asztalon és a Start menüben.'
