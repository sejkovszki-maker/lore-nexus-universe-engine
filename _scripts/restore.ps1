$ErrorActionPreference = "Stop"

$data = [System.IO.File]::ReadAllText("c:\Users\Lezli\Desktop\Diablo\data.js")
$idx = $data.IndexOf("/* KINGDOM OF SHADOW ARTICLES */")
if ($idx -ge 0) {
    # Find the end part
    $timelineIdx = $data.IndexOf("const timelineData = [", $idx)
    if ($timelineIdx -ge 0) {
        $before = $data.Substring(0, $idx)
        $after = $data.Substring($timelineIdx)
        
        # We need to make sure we restore `  }` correctly
        $restored = $before + "};`r`n`r`n" + $after
        [System.IO.File]::WriteAllText("c:\Users\Lezli\Desktop\Diablo\data.js", $restored, [System.Text.Encoding]::UTF8)
        Write-Host "Restored!"
    } else {
        Write-Host "Could not find timelineData"
    }
} else {
    Write-Host "Could not find injected section"
}
