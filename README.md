# api-ecommerce-nodejs

API bán hàng (shop, sản phẩm, mã giảm giá) viết bằng Node.js và Express.

## Yêu cầu

- Node.js
- MongoDB đang chạy ở `localhost:27017` (database mặc định: `shopDEV`)

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

## Biến môi trường (tùy chọn)

Tạo file `.env` ở thư mục gốc nếu muốn đổi cổng hoặc MongoDB:

```env
PORT=3056
NODE_ENV=dev
DEV_DB_HOST=localhost
DEV_DB_PORT=27017
DEV_DB_NAME=shopDEV
```
