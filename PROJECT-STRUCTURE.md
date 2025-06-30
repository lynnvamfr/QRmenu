# Cấu trúc Dự án Menu Hải sản

## 📁 Cấu trúc thư mục

```
MENU/
├── 📄 index.html              # Trang chính
├── 📄 script.js               # JavaScript chính
├── 📄 style.css               # CSS styles
├── 📄 menu-data.json          # Dữ liệu menu
├── 📄 translations.json       # Bản dịch đa ngôn ngữ
├── 📄 ollama-config.js        # Cấu hình AI
├── 📄 run_web_server.bat      # Khởi động web server
├── 📄 start-ai-server.bat     # Khởi động AI server
├── 📄 test-ai-server.bat      # Test AI server
├── 📄 PROJECT-STRUCTURE.md    # File này
│
├── 🖼️ images/                 # Thư mục ảnh
│   ├── bia-larue-smooth-330ml.jpg
│   ├── bia-tiger-bac.jpg
│   ├── coca.jpg
│   └── ... (các ảnh khác)
│
└── 🤖 ai-server/              # Thư mục AI server
    ├── 📄 ollama-proxy.py     # Proxy server chính
    ├── 📄 requirements.txt    # Python dependencies
    ├── 📄 test-chat.py        # Script test API
    ├── 📄 debug-frontend.html # Test frontend
    ├── 📄 start-ollama-proxy.bat
    ├── 📄 restart-all.bat
    ├── 📄 check-services.bat
    ├── 📄 find-ip.bat
    ├── 📄 README.md           # README cho AI server
    ├── 📄 README-OLLAMA.md    # Hướng dẫn chi tiết
    ├── 📄 SERVER-ARCHITECTURE.md
    └── 📄 DEBUG-GUIDE.md
```

## 🚀 Khởi động dự án

### 1. Khởi động Web Server
```bash
run_web_server.bat
```
- Mở `http://localhost:8080`

### 2. Khởi động AI Server
```bash
start-ai-server.bat
```
- Proxy server chạy trên `http://localhost:5000`

### 3. Test AI Server
```bash
test-ai-server.bat
```

## 🔧 Cấu hình

### Frontend (Thư mục gốc)
- **Web Server**: Port 8080
- **Config**: `ollama-config.js`
- **Main Files**: `index.html`, `script.js`, `style.css`

### AI Server (Thư mục ai-server/)
- **Proxy Server**: Port 5000
- **Model**: qwen2.5:0.5b
- **Dependencies**: `requirements.txt`

## 🧪 Testing

### Test Web
- Mở `http://localhost:8080`
- Nhấn nút 🤖 để test kết nối

### Test AI Server
- Chạy `test-ai-server.bat`
- Hoặc mở `http://localhost:8080/ai-server/debug-frontend.html`

## 📚 Tài liệu

### Thư mục gốc
- **PROJECT-STRUCTURE.md** - Cấu trúc dự án (file này)

### Thư mục ai-server/
- **README.md** - Tổng quan AI server
- **README-OLLAMA.md** - Hướng dẫn chi tiết
- **SERVER-ARCHITECTURE.md** - Kiến trúc server
- **DEBUG-GUIDE.md** - Hướng dẫn debug

## 🔄 Workflow

1. **Development**: Chỉnh sửa file trong thư mục gốc
2. **AI Server**: Tất cả file AI trong `ai-server/`
3. **Testing**: Sử dụng các script test
4. **Debug**: Xem `ai-server/DEBUG-GUIDE.md`

## 💡 Lợi ích của cấu trúc mới

- ✅ **Gọn gàng**: Tách biệt AI server và frontend
- ✅ **Dễ quản lý**: Mỗi phần có thư mục riêng
- ✅ **Dễ debug**: File debug tập trung
- ✅ **Dễ deploy**: Có thể deploy riêng từng phần
- ✅ **Dễ mở rộng**: Thêm tính năng mới dễ dàng

---

**Lưu ý**: Tất cả file AI server đã được tổ chức trong thư mục `ai-server/` để dễ quản lý và bảo trì. 