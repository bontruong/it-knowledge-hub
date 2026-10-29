param(
    [int]$Port = 8085,
    [switch]$OpenBrowser,
    [int]$MaxRequests = 0
)

$ErrorActionPreference = 'Stop'
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataDir = Join-Path $RootDir 'data'
$SeedFile = Join-Path $DataDir 'kb-seed.json'
$DbFile = Join-Path $DataDir 'kb-articles.json'

if (-not (Test-Path -LiteralPath $DbFile)) {
    Copy-Item -LiteralPath $SeedFile -Destination $DbFile -Force
}

$Prefix = "http://localhost:$Port/"
$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add($Prefix)
$Listener.Start()

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " IT Engineering Knowledge Hub Server is running!" -ForegroundColor Green
Write-Host " URL:      $Prefix" -ForegroundColor Yellow
Write-Host " Database: $DbFile" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

if ($OpenBrowser) {
    Start-Process $Prefix
}

$MimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
}

$HandledCount = 0

try {
    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $Response.Headers.Add('X-Content-Type-Options', 'nosniff')
        $Response.Headers.Add('X-Frame-Options', 'SAMEORIGIN')

        $UrlPath = $Request.Url.AbsolutePath

        try {
            $Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
            if ($UrlPath -eq '/api/articles' -and $Request.HttpMethod -eq 'GET') {
                $JsonText = [System.IO.File]::ReadAllText($DbFile, [System.Text.Encoding]::UTF8).TrimStart([char]0xFEFF)
                $JsonBytes = $Utf8NoBom.GetBytes($JsonText)
                $Response.ContentType = 'application/json; charset=utf-8'
                $Response.StatusCode = 200
                $Response.ContentLength64 = $JsonBytes.Length
                $Response.OutputStream.Write($JsonBytes, 0, $JsonBytes.Length)
            }
            elseif ($UrlPath -eq '/api/articles' -and $Request.HttpMethod -eq 'POST') {
                $Reader = New-Object System.IO.StreamReader($Request.InputStream, [System.Text.Encoding]::UTF8)
                $Body = $Reader.ReadToEnd().TrimStart([char]0xFEFF)
                $Reader.Close()

                # Validate JSON structure before saving
                $Parsed = $Body | ConvertFrom-Json
                if ($null -eq $Parsed) {
                    throw "Invalid JSON payload"
                }

                [System.IO.File]::WriteAllText($DbFile, $Body, $Utf8NoBom)
                $OkBytes = $Utf8NoBom.GetBytes('{"status":"saved"}')
                $Response.ContentType = 'application/json; charset=utf-8'
                $Response.StatusCode = 200
                $Response.ContentLength64 = $OkBytes.Length
                $Response.OutputStream.Write($OkBytes, 0, $OkBytes.Length)
            }
            else {
                $RelPath = if ($UrlPath -eq '/') { 'index.html' } else { $UrlPath.TrimStart('/').Replace('/', '\') }
                $FullPath = [System.IO.Path]::GetFullPath((Join-Path $RootDir $RelPath))

                # Path traversal defense
                if (-not $FullPath.StartsWith($RootDir, [System.StringComparison]::OrdinalIgnoreCase)) {
                    $Response.StatusCode = 403
                }
                elseif (Test-Path -LiteralPath $FullPath -PathType Leaf) {
                    $Ext = [System.IO.Path]::GetExtension($FullPath).ToLowerInvariant()
                    $Response.ContentType = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { 'application/octet-stream' }
                    $FileBytes = [System.IO.File]::ReadAllBytes($FullPath)
                    $Response.StatusCode = 200
                    $Response.ContentLength64 = $FileBytes.Length
                    $Response.OutputStream.Write($FileBytes, 0, $FileBytes.Length)
                }
                else {
                    $Response.StatusCode = 404
                }
            }
        }
        catch {
            $Response.StatusCode = 500
            $ErrBytes = [System.Text.Encoding]::UTF8.GetBytes(('{"error":"' + $_.Exception.Message.Replace('"', '\"') + '"}'))
            $Response.ContentType = 'application/json; charset=utf-8'
            $Response.ContentLength64 = $ErrBytes.Length
            $Response.OutputStream.Write($ErrBytes, 0, $ErrBytes.Length)
        }
        finally {
            $Response.OutputStream.Close()
        }

        $HandledCount++
        if ($MaxRequests -gt 0 -and $HandledCount -ge $MaxRequests) {
            break
        }
    }
}
finally {
    $Listener.Stop()
    $Listener.Close()
}
