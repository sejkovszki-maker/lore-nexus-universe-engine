$ErrorActionPreference = "Stop"

$data = Get-Content -Path 'data.js' -Raw -Encoding UTF8
$newArticles = Get-Content -Path 'new_articles.js' -Raw -Encoding UTF8

$target = "    ``
  }

};

const timelineData = ["

# Ensure CRLF/LF matches
$target = $target -replace "`r`n", "`n"
$data = $data -replace "`r`n", "`n"

$replacement = "    ``
  },
$newArticles

};

const timelineData = ["

$data = $data.Replace($target, $replacement)

Set-Content -Path 'data.js' -Value $data -Encoding UTF8
Write-Host "Injection complete!"
