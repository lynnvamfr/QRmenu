# Tính năng Ghi chú và Option Cay

## Tổng quan
Đã thêm tính năng cho phép khách hàng:
1. **Ghi chú** cho từng món trong giỏ hàng (textarea trong giỏ hàng)
2. **Chọn mức độ cay** cho các món có thể nấu cay (option gọn gàng trong modal)
3. **Hiển thị thông tin** trong giỏ hàng

## Các thay đổi chính

### 1. Menu Data (menu-data.json)
- Thêm thuộc tính `canBeSpicy: true` cho các món có thể nấu cay
- Hiện tại chỉ có **Fish Hotpot** được đánh dấu có thể nấu cay

### 2. Translations (translations.json)
Thêm các bản dịch cho:
- **Spicy Options**: 3 mức độ cay ngắn gọn (Không, Ít, Bình thường)
- **Notes**: Tiêu đề và placeholder cho ghi chú
- Hỗ trợ đa ngôn ngữ: EN, VI, TH, ZH, KO, JA, RU

### 3. UI/UX (script.js)
- **Modal chi tiết món**: Chỉ có option cay gọn gàng trên 1 dòng
- **Option cay**: 3 buttons nhỏ với title inline, text ngắn gọn, mặc định "Bình thường"
- **Ghi chú**: Textarea trong giỏ hàng cho phép nhập yêu cầu đặc biệt
- **Tự động kết hợp**: Thông tin cay được tự động thêm vào ghi chú

### 4. Giỏ hàng (script.js)
- **Hiển thị ghi chú**: Thêm phần hiển thị ghi chú trong mỗi món
- **Cập nhật ghi chú**: Khi thêm món cùng loại, ghi chú mới sẽ thay thế ghi chú cũ
- **CSS styling**: Ghi chú có background và border đặc biệt

### 5. CSS (style.css)
- **Cart item notes**: Style cho phần ghi chú trong giỏ hàng
- **Responsive**: Tối ưu hiển thị trên mobile
- **Visual feedback**: Border và background để phân biệt ghi chú

## Cách sử dụng

### Cho khách hàng:
1. **Chọn món** → Click vào món để mở modal chi tiết
2. **Chọn mức độ cay** (nếu món có thể nấu cay):
   - Không
   - Ít  
   - Bình thường (mặc định)
3. **Thêm vào giỏ** → Thông tin cay sẽ được lưu
4. **Nhập ghi chú** trong giỏ hàng (tùy chọn):
   - Yêu cầu đặc biệt
   - Không hành, không ớt
   - Ít muối, ít dầu

### Cho nhà hàng:
1. **Xem giỏ hàng** → Hiển thị đầy đủ thông tin ghi chú
2. **Xử lý đơn hàng** → Có thể thấy yêu cầu cụ thể của khách
3. **Đa ngôn ngữ** → Ghi chú hiển thị theo ngôn ngữ khách chọn

## Cấu trúc dữ liệu

### Trong menu-data.json:
```json
{
  "id": "fish_hotpot",
  "canBeSpicy": true,
  "options": [...]
}
```

### Trong giỏ hàng:
```javascript
{
  id: "fish_hotpot_ca_chim",
  name: "Fish Hotpot - Cá Chim",
  price: 150000,
  notes: "Cay bình thường | Ít muối",
  quantity: 1
}
```

## Mở rộng trong tương lai

### Thêm món có thể nấu cay:
1. Thêm `"canBeSpicy": true` vào món trong menu-data.json
2. Hệ thống sẽ tự động hiển thị option cay

### Thêm mức độ cay mới:
1. Cập nhật translations.json với mức độ mới
2. Cập nhật script.js để xử lý option mới

### Thêm loại option khác:
1. Tương tự như spicy options
2. Có thể thêm: độ chín, loại nước sốt, v.v.

## Test
File `test-notes-spicy.html` để kiểm tra tính năng:
- Test option cay cho Fish Hotpot
- Test ghi chú cho món thường
- Test hiển thị trong giỏ hàng
- Test cập nhật ghi chú khi thêm món cùng loại 