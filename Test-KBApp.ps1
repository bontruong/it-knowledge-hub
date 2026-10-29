$ErrorActionPreference = 'Stop'
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Passed = 0
$Failed = 0

function Assert-Test {
    param([string]$Name, [bool]$Condition, [string]$Detail = '')
    if ($Condition) {
        Write-Host "[PASS] $Name" -ForegroundColor Green
        $script:Passed++
    } else {
        Write-Host "[FAIL] $Name - $Detail" -ForegroundColor Red
        $script:Failed++
    }
}

# 1. File Existence Checks
$RequiredFiles = @(
    'index.html',
    'styles.css',
    'app.js',
    'Start-KBServer.ps1',
    'Publish-ToGitHub.ps1',
    '.gitignore',
    '.github\workflows\deploy-pages.yml',
    'data\kb-seed.json'
)
foreach ($f in $RequiredFiles) {
    $p = Join-Path $RootDir $f
    Assert-Test "File exists: $f" (Test-Path -LiteralPath $p) $p
}

# 2. Seed Data Schema Validation
$SeedJson = Get-Content -LiteralPath (Join-Path $RootDir 'data\kb-seed.json') -Raw -Encoding UTF8 | ConvertFrom-Json
Assert-Test "Seed JSON contains 15 IT KB articles" ($SeedJson.Count -ge 15) "Count=$($SeedJson.Count)"

$RequiredProps = @('id','title','docType','system','severity','status','owner','reviewDate','summary','steps','commands','rollback','checklist','tags')
$AllPropsValid = $true
foreach ($item in $SeedJson) {
    foreach ($prop in $RequiredProps) {
        if ($null -eq $item.$prop) {
            $AllPropsValid = $false
        }
    }
}
Assert-Test "All 15 articles have complete metadata & content fields" $AllPropsValid

# 3. Accessibility & Security Guardrails Check
$Html = Get-Content -LiteralPath (Join-Path $RootDir 'index.html') -Raw -Encoding UTF8
$Js   = Get-Content -LiteralPath (Join-Path $RootDir 'app.js') -Raw -Encoding UTF8

Assert-Test "HTML includes WCAG Skip Link & ARIA landmarks" ($Html.Contains('class="skip-link"') -and $Html.Contains('role="search"') -and $Html.Contains('aria-modal="true"'))
Assert-Test "HTML includes GitHub RBAC Modal & Role Badge" ($Html.Contains('id="githubModal"') -and $Html.Contains('id="currentRoleBadge"'))
Assert-Test "HTML includes User Management Modal & User Button" ($Html.Contains('id="userModal"') -and $Html.Contains('id="btnUserManager"'))
Assert-Test "JS implements escapeHtml XSS sanitization" ($Js.Contains('function escapeHtml('))
Assert-Test "JS implements Tier 1 Zero Secret Leakage Guardrail" ($Js.Contains('function detectPlaintextSecrets('))
Assert-Test "JS implements RBAC permission checks (Admin/Editor/Viewer)" ($Js.Contains('function canCreateOrEdit(') -and $Js.Contains('function canDeleteOrImport('))
Assert-Test "JS implements User Management and Switch User" ($Js.Contains('function openUserModal(') -and $Js.Contains('function handleCreateUserSubmit('))
Assert-Test "JS implements GitHub REST API v3 sync & commit" ($Js.Contains('function connectAndSyncFromGitHub(') -and $Js.Contains('function pushArticlesToGitHub('))

# 4. E2E HTTP Server & REST API Test
$TestPort = 18089
$ServerJob = Start-Job -ScriptBlock {
    param($ScriptPath, $Port)
    & powershell -NoProfile -ExecutionPolicy Bypass -File $ScriptPath -Port $Port -MaxRequests 3
} -ArgumentList (Join-Path $RootDir 'Start-KBServer.ps1'), $TestPort

Start-Sleep -Seconds 2

try {
    $HomeRes = Invoke-WebRequest -Uri "http://localhost:$TestPort/" -UseBasicParsing -TimeoutSec 5
    Assert-Test "HTTP GET / returns 200 OK & HTML content" ($HomeRes.StatusCode -eq 200 -and $HomeRes.Content.Contains('Knowledge Hub'))
    Assert-Test "HTTP security header X-Content-Type-Options=nosniff present" ($HomeRes.Headers['X-Content-Type-Options'] -eq 'nosniff')

    $ApiRes = Invoke-RestMethod -Uri "http://localhost:$TestPort/api/articles" -Method Get -TimeoutSec 5
    Assert-Test "HTTP GET /api/articles returns 15 JSON articles" ($ApiRes.Count -ge 15)

    $SeedBytes = [System.IO.File]::ReadAllBytes((Join-Path $RootDir 'data\kb-seed.json'))
    $PostRes = Invoke-RestMethod -Uri "http://localhost:$TestPort/api/articles" -Method Post -Body $SeedBytes -ContentType 'application/json; charset=utf-8' -TimeoutSec 5
    Assert-Test "HTTP POST /api/articles persists JSON payload" ($PostRes.status -eq 'saved')
}
finally {
    Stop-Job $ServerJob -ErrorAction SilentlyContinue
    Remove-Job $ServerJob -Force -ErrorAction SilentlyContinue
}

Write-Host "----------------------------------------------------------"
Write-Host "Total Passed: $Passed | Total Failed: $Failed"
if ($Failed -gt 0) { exit 1 }
