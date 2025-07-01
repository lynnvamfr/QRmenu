# Chatbot Hướng Dẫn Sử Dụng

## Cách Chạy Web Server

1. **Chạy web server từ thư mục QRmenu:**
   ```bash
   cd QRmenu
   python -m http.server 8080
   ```

2. **Hoặc sử dụng file batch:**
   ```bash
   run_web_server.bat
   ```

3. **Truy cập website:**
   - Mở trình duyệt và truy cập: `http://localhost:8080`
   - Hoặc test chatbot: `http://localhost:8080/test-chatbot.html`

## Các File Quan Trọng

- `index.html` - Trang chính với chatbot
- `script.js` - Logic JavaScript cho chatbot
- `style.css` - CSS styling cho chatbot
- `ollama-config.js` - Cấu hình kết nối AI
- `test-chatbot.html` - File test chatbot đơn giản

## Tính Năng Chatbot

### 1. Hiển Thị
- Nút chat màu xanh ở góc phải dưới
- Khung chat hiển thị khi click vào nút
- Responsive trên mobile

### 2. Chức Năng
- Trả lời về menu, giá cả, giờ mở cửa
- Hỗ trợ đa ngôn ngữ (Việt, Anh, Thái, Trung, Hàn, Nhật, Nga)
- Kết nối AI qua Ollama (nếu có)
- Lưu lịch sử chat trong localStorage

### 3. Quick Actions
- Nút nhanh: "Xem menu", "Giờ mở cửa", "Đặt món", "Giá cả"

## Debug và Test

### 1. Test File
- Mở `test-chatbot.html` để test chatbot đơn giản
- Mở `debug-chatbot.html` để debug chi tiết

### 2. Console Logs
- Mở Developer Tools (F12) để xem logs
- Kiểm tra lỗi JavaScript

### 3. Các Nút Test
- 🦞 Test: Test thông báo tôm hùm
- 🔄 Reset: Reset thông báo đặc biệt
- 🗑️ Clear: Xóa dữ liệu chat
- 🤖: Test kết nối Ollama

## Sửa Lỗi Thường Gặp

### 1. Chatbot không hiển thị
- Kiểm tra console logs
- Đảm bảo file CSS và JS được load
- Kiểm tra z-index trong CSS

### 2. Không thể click vào nút chat
- Kiểm tra event listeners
- Đảm bảo elements được tìm thấy
- Kiểm tra JavaScript errors

### 3. Chat window không mở
- Kiểm tra CSS class `.active`
- Đảm bảo `display: flex !important` được áp dụng
- Kiểm tra z-index và positioning

## Cấu Trúc CSS

```css
.chatbot-container {
    position: fixed;
    bottom: 100px;
    right: 20px;
    z-index: 9999;
}

.chat-window {
    display: none;
    /* ... */
}

.chat-window.active {
    display: flex !important;
}
```

## Cấu Trúc JavaScript

```javascript
// Khởi tạo chatbot
function initChatbot() {
    // Event listeners
    chatButton.addEventListener('click', () => {
        isChatOpen = !isChatOpen;
        chatWindow.classList.toggle('active');
    });
}
```

## Kết Nối AI (Ollama)

1. **Cài đặt Ollama server**
2. **Cấu hình trong `ollama-config.js`**
3. **Chạy proxy server trong thư mục `ai-server/`**

## Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra console logs
2. Test với file `test-chatbot.html`
3. Đảm bảo tất cả files được load đúng
4. Kiểm tra network connectivity 