# Fix Prisma EPERM on Windows: delete the client so generate can create it fresh (no rename).
# Run with dev server and Cursor CLOSED. In PowerShell:
#   cd C:\Users\charl\Desktop\cursor\element-store
#   .\scripts\prisma-regenerate.ps1

$clientPath = Join-Path $PSScriptRoot "..\node_modules\.prisma\client"
if (Test-Path $clientPath) {
  Write-Host "Removing node_modules\.prisma\client ..."
  Remove-Item -Recurse -Force $clientPath
  Write-Host "Done. Running prisma generate ..."
} else {
  Write-Host "No .prisma\client folder found. Running prisma generate ..."
}

Set-Location (Join-Path $PSScriptRoot "..")
npx prisma generate
if ($LASTEXITCODE -eq 0) {
  npx prisma db push
}
