# Hướng dẫn Cập nhật Menu (GitHub Pages)

## Cách cập nhật menu-data.json để reload trang tự động

### 1. Cache Busting (Đã được cài đặt)
- Script đã được cập nhật để thêm timestamp vào URL fetch
- Mỗi lần reload trang sẽ fetch menu-data.json mới
- Không cần thêm gì thêm

### 2. Auto-reload Script (Tự động kiểm tra thay đổi)
- File `auto-reload.js` sẽ tự động kiểm tra thay đổi menu mỗi 30 giây
- Nếu phát hiện thay đổi, trang sẽ tự động reload
- Để tắt auto-reload: `MenuAutoReload.stop()`
- Để bật lại: `MenuAutoReload.start()`

### 3. GitHub Pages Workflow
- Commit và push thay đổi lên GitHub
- GitHub Pages sẽ tự động deploy sau vài phút
- Trang web sẽ cập nhật với dữ liệu mới

### 4. Cách thủ công để Force Reload
```javascript
// Trong console browser
window.location.reload();

// Hoặc thêm parameter
window.location.href = window.location.href + '?v=' + Date.now();
```

### 5. Cấu trúc menu-data.json
```json
{
  "restaurantName": "Hai san Tri Hang",
  "openingHours": [...],
  "menu": [
    {
      "category": "category_name",
      "items": [
        {
          "id": "item_id",
          "price": 100000,
          "unit": "1 pcs",
          "image": "images/image.jpg"
        }
      ]
    }
  ]
}
```

### 6. Lưu ý quan trọng cho GitHub Pages
- Luôn backup file menu-data.json trước khi chỉnh sửa
- Kiểm tra JSON syntax trước khi commit
- Test trên localhost trước khi push lên GitHub
- Đảm bảo tất cả images tồn tại trong thư mục images/
- GitHub Pages có thể mất 1-5 phút để deploy thay đổi

### 7. Troubleshooting
- Nếu menu không cập nhật: Clear browser cache (Ctrl+F5)
- Nếu auto-reload không hoạt động: Kiểm tra console errors
- Nếu images không hiển thị: Kiểm tra đường dẫn file images
- Nếu GitHub Pages không cập nhật: Kiểm tra Actions tab trong repository

### 8. Best Practices cho GitHub Pages
- Cập nhật giá cả vào buổi sáng trước khi mở cửa
- Commit với message rõ ràng: "Update menu prices - [date]"
- Test menu trên mobile và desktop sau khi deploy
- Kiểm tra tất cả ngôn ngữ sau khi cập nhật
- Backup định kỳ file menu-data.json
- Sử dụng GitHub Desktop hoặc VS Code để dễ quản lý 