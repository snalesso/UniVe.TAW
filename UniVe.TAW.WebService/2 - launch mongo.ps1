$dbPath = $(Get-Location).path + "\data\db"
Set-Location -Path $dbPath
mongo
