# api-ecommerce-nodejs

API bán hàng (shop, sản phẩm, mã giảm giá) viết bằng Node.js và Express.

## Yêu cầu

- Node.js
- MySQL đang chạy ở `127.0.0.1:3306` (database `shopDEV`, xem bằng Navicat)

## Cài đặt

```bash
npm install
```

## Chạy

Phát triển (tự reload khi sửa file):

```bash
npm run dev
```

Chạy bình thường:

```bash
npm start
```

Server mặc định: http://localhost:3056

Xem và thử API trên Swagger: http://localhost:3056/api-docs

Mọi route `/v1/api` cần header `x-api-key`. Route cần đăng nhập thêm `x-client-id` và `authorization`. Refresh token gửi qua `x-rtoken-id`.

## MySQL và Navicat

Trong Navicat tạo kết nối MySQL:

- Host: `127.0.0.1`
- Port: `3306`
- User / Password: cùng tài khoản trong file `.env`

```env
PORT=3056
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=shopDEV
MYSQL_USER=root
MYSQL_PASSWORD=mật_khẩu_navicat
```

Điền `MYSQL_PASSWORD` bằng mật khẩu bạn đang dùng trong Navicat, rồi chạy lại `npm run dev`. Lần chạy thành công sẽ tạo database `shopDEV` và các bảng (`shops`, `products`, `discounts`, ...). Mở database đó trong Navicat để xem dữ liệu.

API key local được tạo sẵn nếu bảng `apikeys` trống: header `x-api-key: dev-api-key`.

Tạo tài khoản shop test:

```bash
npm run seed
```

Đăng nhập bằng `shop@example.com` / `123456`. Trên Swagger bấm **Authorize** và điền `x-api-key` = `dev-api-key` trước khi gọi API, nếu không server trả 403.
