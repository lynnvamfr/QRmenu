@echo off
echo ========================================
echo Cập nhật cấu hình cho máy remote
echo ========================================

set /p REMOTE_IP="Nhập IP Tailscale của máy remote: "

echo.
echo Cập nhật ollama-config.js...
powershell -Command "(Get-Content ollama-config.js) -replace 'localhost:5000', '%REMOTE_IP%:5000' | Set-Content ollama-config.js"

echo.
echo ✅ Đã cập nhật cấu hình!
echo Base URL mới: http://%REMOTE_IP%:5000
echo.
echo Để test kết nối:
echo 1. Chạy: curl http://%REMOTE_IP%:5000/health
echo 2. Mở: http://localhost:8080
echo 3. Nhấn nút 🤖 để test chat
echo.
pause 