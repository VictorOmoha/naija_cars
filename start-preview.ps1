$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$previewRoot = Join-Path $projectRoot '.preview'
$logRoot = Join-Path $projectRoot 'design-qa'
$nodePath = (Get-Command node.exe).Source
if (-not (Test-Path -LiteralPath (Join-Path $previewRoot 'db-password.txt'))) {
    throw 'This machine needs the isolated preview database setup. See PREVIEW.md.'
}
New-Item -ItemType Directory -Force -Path $logRoot | Out-Null
function PortIsOpen([int]$Port) {
    $client = New-Object System.Net.Sockets.TcpClient
    try { $client.Connect('127.0.0.1', $Port); return $true } catch { return $false } finally { $client.Dispose() }
}
if (-not (PortIsOpen 5432)) {
    $postgres = Join-Path $previewRoot 'postgres\pgsql\bin\postgres.exe'
    $dataPath = Join-Path $previewRoot 'data'
    Start-Process -FilePath $postgres -ArgumentList @('-D', ('"' + $dataPath + '"'), '-h', '127.0.0.1', '-p', '5432') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $previewRoot 'database.log') -RedirectStandardError (Join-Path $previewRoot 'database-error.log') | Out-Null
    for ($attempt = 0; $attempt -lt 20 -and -not (PortIsOpen 5432); $attempt++) { Start-Sleep -Milliseconds 500 }
    if (-not (PortIsOpen 5432)) { throw 'The preview database did not start. Check .preview/database-error.log.' }
}
if (-not (PortIsOpen 5056)) {
    Start-Process -FilePath $nodePath -ArgumentList 'scripts/full-preview.cjs' -WorkingDirectory (Join-Path $projectRoot 'naija-cars-backend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logRoot 'preview-api.log') -RedirectStandardError (Join-Path $logRoot 'preview-api-error.log') | Out-Null
}
if (-not (PortIsOpen 5173)) {
    $previousApiUrl = $env:VITE_API_URL
    try {
        $env:VITE_API_URL = 'http://127.0.0.1:5056/api'
        Start-Process -FilePath $nodePath -ArgumentList @('node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5173', '--strictPort') -WorkingDirectory (Join-Path $projectRoot 'naija-cars-app') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logRoot 'preview-web.log') -RedirectStandardError (Join-Path $logRoot 'preview-web-error.log') | Out-Null
    } finally { $env:VITE_API_URL = $previousApiUrl }
}
for ($attempt = 0; $attempt -lt 30 -and (-not (PortIsOpen 5056) -or -not (PortIsOpen 5173)); $attempt++) { Start-Sleep -Milliseconds 500 }
if (-not (PortIsOpen 5056) -or -not (PortIsOpen 5173)) { throw 'A preview service did not start. Check design-qa/preview-*-error.log.' }
Write-Output 'NaijaCars preview: http://127.0.0.1:5173/'
