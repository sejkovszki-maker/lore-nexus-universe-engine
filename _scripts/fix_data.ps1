$ErrorActionPreference = "Stop"

$lines = [System.IO.File]::ReadAllLines("c:\Users\Lezli\Desktop\Diablo\data.js", [System.Text.Encoding]::UTF8)

# Find the start and end of the broken block
$startIndex = -1
$endIndex = -1

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i].Trim() -eq "`"kingdom-of-shadow`": {") {
        $startIndex = $i
    }
    if ($startIndex -ge 0 -and $lines[$i].Trim() -eq "`"kingdom-of-shadow-ch1`": {") {
        $endIndex = $i - 1 # The line just before kingdom-of-shadow-ch1 is the end of the broken block
        break
    }
}

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $newLines = New-Object System.Collections.Generic.List[string]
    
    # Add everything before the broken block
    for ($i = 0; $i -lt $startIndex; $i++) {
        $newLines.Add($lines[$i])
    }
    
    # Add the correct block
    $correctBlock = @"
  "kingdom-of-shadow": {
    id: "kingdom-of-shadow",
    category: "Lore / Könyvek",
    title: "Diablo: The Kingdom of Shadow (Az Árnyak Királysága)",
    subtitle: "Richard A. Knaak regényének teljes kánon magyar fordítása",
    infobox: {
      "Szerző": "Richard A. Knaak",
      "Kiadás Éve": "2002",
      "Korszak": "A Bűn Háborúja Után",
      "Főszereplő": "Kentril Dumon, Zayl",
      "Helyszín": "Ureh, Kehjistan",
      "Téma": "Elveszett város, nekromancia"
    },
    content: ``
      <h2>Bevezetés és Jelentőség</h2>
      <p>A <strong>The Kingdom of Shadow</strong> (Az Árnyak Királysága) Richard A. Knaak klasszikus Diablo regénye. A történet bemutatja Ureh, a legendás elveszett város sötét titkait, és bevezeti a rajongók egyik kedvenc karakterét, Zayl-t, a nekromantát, valamint hűséges (és beszédes) koponyáját, Humbartot. Ez az archívum a könyv teljes, hivatalos kánon magyar nyelvű fordítását tartalmazza.</p>
      
      <h2>Tartalomjegyzék: Az Árnyak Királysága</h2>
      <p>Kattints az alábbi gombokra az adott fejezet megnyitásához:</p>
      <div style="display: flex; gap: 10px; margin-top: 20px; margin-bottom: 20px; flex-wrap: wrap;">
        <button onclick="openWikiArticle('kingdom-of-shadow-ch1')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">1. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch2')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">2. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch3')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">3. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch4')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">4. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch5')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">5. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch6')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">6. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch7')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">7. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch8')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">8. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch9')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">9. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch10')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">10. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch11')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">11. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch12')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">12. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch13')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">13. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch14')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">14. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch15')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">15. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch16')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">16. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch17')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">17. Fejezet</button>
        <button onclick="openWikiArticle('kingdom-of-shadow-ch18')" style="background: rgba(212,175,55,0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: var(--font-title);">18. Fejezet</button>
      </div>
    ``
  },
"@
    
    foreach ($line in $correctBlock.Split("`n")) {
        $newLines.Add($line.TrimEnd("`r"))
    }
    
    # Add everything after the broken block
    for ($i = $endIndex + 1; $i -lt $lines.Count; $i++) {
        $newLines.Add($lines[$i])
    }
    
    [System.IO.File]::WriteAllLines("c:\Users\Lezli\Desktop\Diablo\data.js", $newLines, [System.Text.Encoding]::UTF8)
    Write-Host "Replaced broken block!"
} else {
    Write-Host "Could not find the bounds of the broken block."
}
