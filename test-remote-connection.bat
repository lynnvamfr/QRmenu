@echo off
echo ========================================
echo Test kết nối Remote AI Server
echo ========================================

set /p REMOTE_IP="Nhập IP Tailscale của máy remote: "

echo.
echo 1. Test ping...
ping -n 1 %REMOTE_IP%
if errorlevel 1 (
    echo ❌ Không thể ping đến %REMOTE_IP%
    echo Kiểm tra Tailscale connection
    pause
    exit /b 1
)

echo.
echo 2. Test health check...
curl -s http://%REMOTE_IP%:5000/health
if errorlevel 1 (
    echo ❌ Không thể kết nối đến AI server
    echo Kiểm tra server có đang chạy không
    pause
    exit /b 1
)

echo.
echo 3. Test chat API...
curl -X POST http://%REMOTE_IP%:5000/api/chat -H "Content-Type: application/json" -d "{\"message\": \"test\"}"
if errorlevel 1 (
    echo ❌ Chat API không hoạt động
    pause
    exit /b 1
)

echo.
echo ✅ Tất cả test đều thành công!
echo Bây giờ có thể mở http://localhost:8080 và test chatbot
echo.
pause 