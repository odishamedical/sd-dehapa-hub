$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("e:\web-app-projects-2026\sd-dehapa-hub\drdeepak.doc")
$text = $doc.Content.Text
$doc.Close()
$word.Quit()
Write-Output $text
