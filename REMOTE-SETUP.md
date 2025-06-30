# 🚀 Setup AI Server Remote qua Tailscale

## 📋 Tổng quan

Chạy AI server trên máy mạnh khác và kết nối qua Tailscale để tiết kiệm tài nguyên máy test.

## 🖥️ Máy Remote (Máy mạnh)

### 1. Cài đặt cần thiết
```bash
# Cài Python 3.8+
# Cài Ollama
# Cài Tailscale
```

### 2. Copy thư mục ai-server
```bash
# Copy toàn bộ thư mục ai-server lên máy remote
# Hoặc clone từ git repository
```

### 3. Cài đặt và khởi động
```bash
cd ai-server

# Cài dependencies
pip install -r requirements.txt

# Khởi động server
start-remote-server.bat
# Hoặc: python ollama-proxy.py
```

### 4. Lấy IP Tailscale
```bash
tailscale ip
# Ví dụ: 100.64.0.1
```

## 💻 Máy Local (Máy test)

### 1. Cập nhật cấu hình
```bash
# Chạy script cập nhật
update-config.bat

# Nhập IP Tailscale của máy remote khi được hỏi
# Ví dụ: 100.64.0.1
```

### 2. Test kết nối
```bash
# Test kết nối
test-remote-connection.bat

# Hoặc test thủ công
curl http://100.64.0.1:5000/health
```

### 3. Khởi động web server
```bash
run_web_server.bat
```

### 4. Test chatbot
- Mở `http://localhost:8080`
- Nhấn nút 🤖
- Test chat

## 🔧 Scripts có sẵn

### Máy Remote
- `ai-server/start-remote-server.bat` - Khởi động AI server
- `ai-server/check-services.bat` - Kiểm tra services
- `ai-server/restart-all.bat` - Restart tất cả

### Máy Local
- `update-config.bat` - Cập nhật IP remote
- `test-remote-connection.bat` - Test kết nối
- `run_web_server.bat` - Khởi động web server

## 🧪 Testing

### Test từ máy local
```bash
# 1. Test ping
ping 100.64.0.1

# 2. Test health check
curl http://100.64.0.1:5000/health

# 3. Test chat API
curl -X POST http://100.64.0.1:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Xin chào"}'
```

### Test frontend
- Mở `http://localhost:8080`
- Nhấn nút 🤖
- Kiểm tra console (F12) xem có lỗi không

## 🔒 Bảo mật

### Firewall trên máy remote
```bash
# Mở port 5000 cho Tailscale
sudo ufw allow from 100.64.0.0/10 to any port 5000
sudo ufw allow from 100.64.0.0/10 to any port 11434
```

### CORS đã được cấu hình
Proxy server đã hỗ trợ CORS cho:
- `localhost:8080`
- `100.64.0.0/10` (Tailscale)
- `192.168.0.0/16` (Local network)

## 📱 Monitoring

### Kiểm tra trạng thái
```bash
# Trên máy remote
tailscale status
ollama list
ps aux | grep ollama-proxy
```

### Logs
```bash
# Xem logs proxy server
tail -f ai-server/ollama-proxy.log
```

## 🚨 Troubleshooting

### Lỗi kết nối
1. **Kiểm tra Tailscale**: `tailscale status`
2. **Kiểm tra firewall**: `sudo ufw status`
3. **Test ping**: `ping 100.64.0.1`
4. **Test port**: `telnet 100.64.0.1 5000`

### Lỗi CORS
1. Kiểm tra cấu hình CORS trong proxy
2. Kiểm tra IP trong `ollama-config.js`
3. Xem console browser (F12)

### Lỗi Ollama
1. **Kiểm tra Ollama**: `ollama list`
2. **Kiểm tra model**: `ollama show qwen2.5:0.5b`
3. **Restart Ollama**: `sudo systemctl restart ollama`

### Lỗi Python
1. **Kiểm tra Python**: `python --version`
2. **Cài dependencies**: `pip install -r requirements.txt`
3. **Kiểm tra port**: `netstat -tulpn | grep 5000`

## 📊 Performance

### Máy Remote
- **CPU**: Tối thiểu 4 cores
- **RAM**: Tối thiểu 8GB
- **GPU**: Không bắt buộc (CPU inference)

### Máy Local
- **CPU**: Bất kỳ
- **RAM**: Tối thiểu 2GB
- **Network**: Kết nối internet ổn định

## 🔄 Workflow

1. **Setup máy remote**: Cài đặt và khởi động AI server
2. **Setup máy local**: Cập nhật cấu hình IP
3. **Test kết nối**: Đảm bảo có thể kết nối
4. **Khởi động web**: Chạy web server local
5. **Test chatbot**: Kiểm tra hoạt động

## 💡 Tips

- **Backup cấu hình**: Lưu IP Tailscale để dùng lại
- **Auto-start**: Cấu hình AI server tự động khởi động
- **Monitoring**: Theo dõi logs để phát hiện lỗi sớm
- **Backup**: Backup thư mục ai-server định kỳ

---

**Lưu ý**: Đảm bảo cả hai máy đều kết nối Tailscale và có thể ping được nhau trước khi test. 