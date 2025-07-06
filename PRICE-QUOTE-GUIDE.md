# Hướng Dẫn Sử Dụng Chức Năng Báo Giá

## Tổng Quan
Chức năng báo giá đã được tích hợp vào web menu, cho phép khách hàng nhập số gram và nhận báo giá nhanh cho các món theo kg.

## Cách Sử Dụng

### 1. Thêm món theo kg vào giỏ hàng
- Chọn món có `priceType: "per_kg"` từ menu
- Món sẽ được thêm vào giỏ hàng với giá trị gram mặc định

### 2. Báo giá từ giỏ hàng
- Mở giỏ hàng (click vào icon giỏ hàng)
- Với mỗi món theo kg, sẽ có nút "Báo giá" màu xanh lá
- Click vào nút "Báo giá" để mở modal nhập số gram

### 3. Sử dụng modal báo giá
Modal báo giá có các tính năng:
- **Bàn phím số**: Click các số 0-9 để nhập gram
- **Nút Xóa**: Xóa toàn bộ số đã nhập
- **Nút Báo Giá**: Hiển thị giá theo số gram đã nhập
- **Nút OK**: Cập nhật số gram trong giỏ hàng

### 4. Kết quả báo giá
- Khi click "Báo Giá": Hiển thị toast thông báo với giá
- Khi click "OK": Cập nhật số gram trong giỏ hàng và tính lại giá

## Các Món Theo Kg Hiện Có
Các món sau có chức năng báo giá:
- Mực Ống
- Mực Lá  
- Mực Khô
- Tôm Hùm
- Ghẹ
- Cua
- Cá Nhói
- Cá Chìa Vôi
- Cá Bả trầu
- Và nhiều món khác...

## Tính Năng Kỹ Thuật

### Modal Báo Giá
- **Z-index**: 10001 (cao hơn các modal khác)
- **Responsive**: Tự động điều chỉnh trên mobile
- **Keyboard**: Bàn phím số ảo dễ sử dụng

### Toast Thông Báo
- **Duration**: 8 giây
- **Auto-hide**: Tự động ẩn sau thời gian
- **Progress bar**: Hiển thị thời gian còn lại

### Cập Nhật Giỏ Hàng
- **Real-time**: Cập nhật ngay lập tức
- **Animation**: Hiệu ứng số nhảy khi thay đổi
- **Validation**: Kiểm tra giá trị hợp lệ

## Troubleshooting

### Modal không mở
- Kiểm tra console để xem lỗi JavaScript
- Đảm bảo các element ID tồn tại trong HTML

### Nút không hoạt động
- Kiểm tra event listeners đã được đăng ký
- Đảm bảo các function được định nghĩa đúng

### Giá tính sai
- Kiểm tra `pricePerKg` trong menu-data.json
- Đảm bảo hàm `calculatePerKgPrice` hoạt động đúng

## Cấu Trúc Code

### HTML Elements
```html
<!-- Modal Báo Giá -->
<div id="price-quote-modal" class="price-quote-modal">
    <div class="price-quote-content">
        <!-- Header -->
        <div class="price-quote-header">
            <h2 id="price-quote-title">Báo Giá</h2>
            <button id="price-quote-close" class="price-quote-close">&times;</button>
        </div>
        <!-- Body -->
        <div class="price-quote-body">
            <div class="gram-input-section">
                <input type="text" id="gramInput" placeholder="Nhập số gram" readonly>
                <div class="number-grid">
                    <!-- Number buttons 0-9 -->
                    <button class="number-btn clear-btn" onclick="clearGramInput()">Xóa</button>
                </div>
            </div>
            <div class="action-buttons">
                <button id="quote-price-btn" class="quote-btn">Báo Giá</button>
                <button id="update-weight-btn" class="update-btn">OK</button>
            </div>
        </div>
    </div>
</div>
```

### JavaScript Functions
```javascript
// Mở modal báo giá
function openPriceQuoteModal(item, cartIndex = -1)

// Đóng modal
function closePriceQuoteModal()

// Thêm số vào input
window.addNumber = function(num)

// Xóa input
window.clearGramInput = function()

// Báo giá
function quotePrice()

// Cập nhật trọng lượng
function updateWeight()
```

### CSS Classes
```css
.price-quote-modal          /* Modal container */
.price-quote-content        /* Modal content */
.price-quote-header         /* Header section */
.price-quote-body          /* Body section */
.number-grid               /* Number pad grid */
.number-btn                /* Number buttons */
.action-buttons            /* Action buttons container */
.quote-btn                 /* Quote button */
.update-btn                /* Update button */
```

## Lưu Ý
- Chức năng chỉ hoạt động với món có `priceType: "per_kg"`
- Giá được tính theo công thức: `gram * pricePerKg / 1000`
- Toast thông báo sẽ tự động ẩn sau 8 giây
- Modal có thể đóng bằng cách click bên ngoài hoặc nút X 