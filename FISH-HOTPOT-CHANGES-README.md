# Thay đổi về Fish Hotpot - Fish Hotpot Options Changes

## Tổng quan (Overview)

Đã cập nhật món Lẩu Cá (Fish Hotpot) để có các option chọn loại cá khác nhau, tương tự như cách hiển thị của Còi Mây Nướng, với 6 loại cá khác nhau và giá cả tương ứng.

## Các thay đổi đã thực hiện (Changes Made)

### 1. Cập nhật menu-data.json

#### Fish Hotpot Options:
- **Cá Mú**: 200.000đ (từ 150.000đ cũ)
- **Cá Đuối**: 200.000đ (từ 150.000đ cũ)
- **Cá Chim**: 150.000đ (giữ nguyên)
- **Cá Cu**: 250.000đ (từ 150.000đ cũ)
- **Cá Mâm Thâu**: 150.000đ (giữ nguyên)
- **Cá Bớp**: 170.000đ (từ 150.000đ cũ)

### 2. Cập nhật translations.json

#### Thêm bản dịch cho các loại cá:
- **fish_hotpot_ca_mu**: Lẩu Cá Mú / Fish hotpot - Grouper
- **fish_hotpot_ca_duoi**: Lẩu Cá Đuối / Fish hotpot - Stingray
- **fish_hotpot_ca_chim**: Lẩu Cá Chim / Fish hotpot - Pomfret
- **fish_hotpot_ca_cu**: Lẩu Cá Cu / Fish hotpot - Red Snapper
- **fish_hotpot_ca_mam_thau**: Lẩu Cá Mâm Thâu / Fish hotpot - Threadfin
- **fish_hotpot_ca_bop**: Lẩu Cá Bớp / Fish hotpot - Grouper

### 3. Cập nhật script.js

#### Xử lý hiển thị options:
- Sử dụng `opt.size` để hiển thị tên loại cá thay vì `getItemTranslationById(opt.id)`
- Đảm bảo tương thích với cấu trúc options hiện có

## Cách hoạt động (How it works)

### 1. Hiển thị menu:
- Fish hotpot hiển thị với giá thấp nhất từ các options: "từ 150.000đ"
- Khi click vào món, mở modal để chọn loại cá

### 2. Modal chọn loại cá:
- **Dropdown (6 options > 3)**: Hiển thị dropdown với tất cả 6 loại cá
- **Bản dịch đa ngôn ngữ**: Sử dụng bản dịch từ translations.json
- **Sắp xếp theo giá**: Options được sắp xếp theo giá tăng dần
- Người dùng có thể chọn loại cá mong muốn
- Nút "Thêm vào giỏ" hiển thị giá của option đã chọn

### 3. Trong giỏ hàng:
- Hiển thị tên loại cá đã chọn
- Giá tương ứng với loại cá
- Có thể thay đổi số lượng như các món thường

## Cấu trúc dữ liệu (Data Structure)

```json
{
  "id": "fish_hotpot",
  "image": "images/hotpot.jpg",
  "priceType": "options",
  "unit": "1 pcs",
  "options": [
    { "id": "fish_hotpot_ca_chim", "price": 150000, "size": "Cá Chim" },
    { "id": "fish_hotpot_ca_mam_thau", "price": 150000, "size": "Cá Mâm Thâu" },
    { "id": "fish_hotpot_ca_bop", "price": 170000, "size": "Cá Bớp" },
    { "id": "fish_hotpot_ca_mu", "price": 200000, "size": "Cá Mú" },
    { "id": "fish_hotpot_ca_duoi", "price": 200000, "size": "Cá Đuối" },
    { "id": "fish_hotpot_ca_cu", "price": 250000, "size": "Cá Cu" }
  ]
}
```

**Lưu ý**: Options được sắp xếp theo giá tăng dần (150.000đ → 250.000đ)

## Test

Sử dụng file `test-fish-hotpot-dropdown.html` để kiểm tra:
- Cấu trúc menu-data.json cho fish hotpot với options đã sắp xếp
- Translations cho các loại cá
- Demo dropdown với 6 options
- Tính năng chọn option

## Lưu ý (Notes)

- Giá hiển thị trong menu là giá thấp nhất (150.000đ)
- Mỗi loại cá có giá riêng biệt
- **Bản dịch đa ngôn ngữ**: Sử dụng `getItemTranslationById(opt.id)` để hiển thị tên theo ngôn ngữ hiện tại
- **Dropdown tự động**: Khi có > 3 options, tự động chuyển sang dropdown
- **Sắp xếp theo giá**: Options luôn được sắp xếp theo giá tăng dần
- Tương thích với hệ thống options hiện có
- Có thể dễ dàng thêm/bớt loại cá trong tương lai 