# Thay đổi về Cua và Ghẹ - Crab and Blue Crab Changes

## Tổng quan (Overview)

Đã cập nhật cách hiển thị của các món cua (sea crab) và ghẹ (blue crab) để có các option trọng lượng tương tự như tôm hùm, với tính năng nhập số gram trong giỏ hàng và thông báo đặc biệt.

## Các thay đổi đã thực hiện (Changes Made)

### 1. Cập nhật menu-data.json

#### Category "crabs" (Ghẹ):
- **steamed_blue_crab**: 600.000đ/kg (từ 300.000đ/500g)
- **blue_crab_tamarind_sauce**: 650.000đ/kg (từ 325.000đ/500g)
- **tri_hang_special_sauce_crab**: 650.000đ/kg (từ 325.000đ/500g)
- **blue_crab_garlic_butter_sauce**: 650.000đ/kg (từ 325.000đ/500g)

#### Category "sea_crab" (Cua biển):
- **steamed_sea_crab**: 750.000đ/kg (từ 375.000đ/500g)
- **sea_crab_tamarind_sauce**: 800.000đ/kg (từ 400.000đ/500g)
- **roasted_sea_crab_fish_sauce**: 800.000đ/kg (từ 400.000đ/500g)

### 2. Cập nhật script.js

#### Special Seafood Groups:
- Thêm tất cả các món cua và ghẹ vào `specialSeafoodGroups`
- Cập nhật giá per kg cho từng nhóm
- Thêm trigger thông báo khi nhập gram trong giỏ hàng

#### Tính năng mới:
- Input nhập số gram trong giỏ hàng cho các món theo kg
- Thông báo đặc biệt khi có món hải sản theo kg trong giỏ hàng
- Validation input (border đỏ khi giá trị <= 0)
- Tính giá tự động dựa trên số gram nhập

### 3. Thông báo đặc biệt

Khi người dùng thêm món cua/ghẹ vào giỏ hàng hoặc nhập số gram, hệ thống sẽ hiển thị thông báo:

**Tiếng Việt:**
> "Lưu ý: Các món hải sản theo kg sẽ được cân thực tế khi thanh toán. Giá hiển thị là tạm tính!"

**English:**
> "Note: Seafood items sold by weight will be weighed at actual weight when payment is made. The displayed price is estimated!"

## Cách hoạt động (How it works)

### 1. Hiển thị menu:
- Các món cua/ghẹ hiển thị với các option: 500g, 600g, 700g
- Giá được tính theo công thức: `(gram × pricePerKg) / 1000`

### 2. Trong giỏ hàng:
- Input field để nhập số gram tùy ý
- Giá tự động cập nhật khi thay đổi số gram
- Border đỏ khi nhập giá trị <= 0

### 3. Thông báo:
- Hiển thị 1 lần mỗi phiên khi có món hải sản theo kg
- Trigger khi thêm món hoặc thay đổi số gram

## Test

Sử dụng file `test-crab-changes.html` để kiểm tra:
- Cấu trúc menu-data.json
- Special seafood groups
- Translations

## Lưu ý (Notes)

- Giá hiển thị là ước tính, sẽ được cân thực tế khi thanh toán
- Thông báo chỉ hiển thị 1 lần mỗi phiên để tránh spam
- Tất cả các món cua/ghẹ đều có minWeightGram = 500g
- Options mặc định: 500g, 600g, 700g 