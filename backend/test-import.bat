@echo off
echo.
echo ==========================================
echo  PRUEBA DE IMPORTACION DE JUGADORES
echo ==========================================
echo.

echo Probando importacion CSV...
echo.

REM Usar curl real (no el alias de PowerShell)
where curl >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    curl -X POST -F "file=@test-players.csv" http://localhost:3002/api/players/import
    echo.
    echo.
    echo Probando importacion JSON...
    echo.
    curl -X POST -F "file=@test-players.json" http://localhost:3002/api/players/import
    echo.
) else (
    echo CURL no esta disponible. Instalalo o usa un navegador web para probar:
    echo http://localhost:3002/api/info
)

echo.
echo ==========================================
echo.
pause
