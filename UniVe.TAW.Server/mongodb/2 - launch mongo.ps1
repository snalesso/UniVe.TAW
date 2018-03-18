$dbPath = $(Get-Location).path + "\src\web-service\data\db"
Set-Location -Path $dbPath
mongo
