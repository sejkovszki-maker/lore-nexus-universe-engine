$data = [System.IO.File]::ReadAllText("c:\Users\Lezli\Desktop\Diablo\new_articles.js", [System.Text.Encoding]::UTF8)

$data = $data.Replace("KĂ¶nyvek - OlvasĂł", "Könyvek - Olvasó")
$data = $data.Replace("Az Ă rnyak KirĂˇlysĂˇga", "Az Árnyak Királysága")
$data = $data.Replace("SzerzĹ‘", "Szerző")
$data = $data.Replace("MĹ±faj", "Műfaj")
$data = $data.Replace("RegĂ©ny", "Regény")

[System.IO.File]::WriteAllText("c:\Users\Lezli\Desktop\Diablo\new_articles.js", $data, [System.Text.Encoding]::UTF8)
Write-Host "Fixed encoding in new_articles.js"
