@echo off
chcp 65001 >nul
echo 正在清理旧进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul
echo 启动服务...
cd /d "%~dp0"
node src/app.js
