param(
    [string]$TaskName = "UniverseEngine-DailyBackup",
    [string]$DailyAt = "03:00"
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$runner = Join-Path $PSScriptRoot "run-automated-backup.ps1"
$pwshPath = (Get-Command pwsh -ErrorAction Stop).Source
$time = [datetime]::ParseExact($DailyAt, "HH:mm", [System.Globalization.CultureInfo]::InvariantCulture)

$action = New-ScheduledTaskAction -Execute $pwshPath -Argument "-NoProfile -File `"$runner`""
$trigger = New-ScheduledTaskTrigger -Daily -At $time
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 2)
$description = "Verified daily backup for Universe Engine project: $projectRoot"

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description $description -Force | Out-Null
$task = Get-ScheduledTask -TaskName $TaskName
$taskInfo = Get-ScheduledTaskInfo -TaskName $TaskName

Write-Output "BACKUP SCHEDULE INSTALLED"
Write-Output "Task: $($task.TaskName)"
Write-Output "State: $($task.State)"
Write-Output "Next run: $($taskInfo.NextRunTime.ToString('o'))"
