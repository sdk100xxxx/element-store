@echo off
REM Fix Prisma EPERM: delete .prisma\client then generate. Run with dev server CLOSED.
cd /d "%~dp0.."
if exist "node_modules\.prisma\client" (
  echo Removing node_modules\.prisma\client ...
  rmdir /s /q "node_modules\.prisma\client"
  echo Done.
)
echo Running prisma generate ...
call npx prisma generate
if %ERRORLEVEL% equ 0 call npx prisma db push
pause
