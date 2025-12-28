@echo off
echo Limpando porta 3000...
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo Processos encontrados na porta 3000:
    netstat -ano | findstr :3000
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        echo Matando processo PID: %%a
        taskkill /PID %%a /F > nul 2>&1
    )
    echo Porta 3000 liberada!
) else (
    echo Porta 3000 ja esta livre.
)
timeout /t 2 /nobreak > nul