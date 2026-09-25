'use strict'

/**
 * OpenAPI spec for the ecommerce API.
 * UI: GET /api-docs
 */
const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'API Ecommerce',
        version: '1.0.0',
        description: 'Tài liệu các đầu API shop, sản phẩm và mã giảm giá. Mọi route `/v1/api` cần header `x-api-key`. Route có khóa cần thêm `x-client-id` và `authorization` (access token). Refresh token gửi qua header `x-rtoken-id`.',
    },
    servers: [
        {
            url: 'http://localhost:{port}',
            variables: {
                port: {
                    default: process.env.PORT || '3056',
                },
            },
        },
    ],
    tags: [
        { name: 'Access', description: 'Đăng ký, đăng nhập, đăng xuất, làm mới token' },
        { name: 'Product', description: 'Sản phẩm' },
        { name: 'Discount', description: 'Mã giảm giá' },
    ],
    components: {
        securitySchemes: {
            ApiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'x-api-key',
                description: 'API key của hệ thống',
            },
            ClientId: {
                type: 'apiKey',
                in: 'header',
                name: 'x-client-id',
                description: 'userId của shop (trả về khi login/signup)',
            },
            AccessToken: {
                type: 'apiKey',
                in: 'header',
                name: 'authorization',
                description: 'Access token (không thêm tiền tố Bearer)',
            },
            RefreshToken: {
                type: 'apiKey',
                in: 'header',
                name: 'x-rtoken-id',
                description: 'Refresh token, dùng cho /shop/handleRefreshToken',
            },
        },
        schemas: {
            SignUp: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                    name: { type: 'string', example: 'Shop ABC' },
                    email: { type: 'string', example: 'shop@example.com' },
                    password: { type: 'string', example: '123456' },
                },
            },
            Login: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', example: 'shop@example.com' },
                    password: { type: 'string', example: '123456' },
                },
            },
            Product: {
                type: 'object',
                required: ['product_name', 'product_thumb', 'product_description', 'product_price', 'product_quantity', 'product_type', 'product_attributes'],
                properties: {
                    product_name: { type: 'string', example: 'Ao thun' },
                    product_thumb: { type: 'string', example: 'https://example.com/thumb.png' },
                    product_description: { type: 'string', example: 'Ao cotton' },
                    product_price: { type: 'number', example: 120000 },
                    product_quantity: { type: 'number', example: 20 },
                    product_type: { type: 'string', enum: ['Clothing', 'Electronic', 'Furniture'], example: 'Clothing' },
                    product_attributes: {
                        type: 'object',
                        description: 'Clothing/Furniture: brand, size, material. Electronic: manufacturer, model, color.',
                        example: { brand: 'Uniqlo', size: 'M', material: 'cotton' },
                    },
                },
            },
            Discount: {
                type: 'object',
                required: ['name', 'description', 'type', 'value', 'code', 'start_date', 'end_date', 'max_uses', 'uses_count', 'max_uses_per_user', 'applies_to'],
                properties: {
                    name: { type: 'string', example: 'Giam 10%' },
                    description: { type: 'string', example: 'Giam gia don hang' },
                    type: { type: 'string', enum: ['fixed_amount', 'percentage'], example: 'percentage' },
                    value: { type: 'number', example: 10 },
                    code: { type: 'string', example: 'SALE10' },
                    start_date: { type: 'string', format: 'date-time' },
                    end_date: { type: 'string', format: 'date-time' },
                    max_uses: { type: 'number', example: 100 },
                    uses_count: { type: 'number', example: 0 },
                    users_used: { type: 'array', items: { type: 'string' }, example: [] },
                    max_uses_per_user: { type: 'number', example: 1 },
                    min_order_value: { type: 'number', example: 0 },
                    max_value: { type: 'number', example: 50000 },
                    is_active: { type: 'boolean', example: true },
                    applies_to: { type: 'string', enum: ['all', 'specific'], example: 'all' },
                    product_ids: { type: 'array', items: { type: 'string' }, example: [] },
                },
            },
            DiscountAmount: {
                type: 'object',
                required: ['codeId', 'userId', 'shopId', 'products'],
                properties: {
                    codeId: { type: 'string', example: 'SALE10' },
                    userId: { type: 'string' },
                    shopId: { type: 'string' },
                    products: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                productId: { type: 'string' },
                                quantity: { type: 'number', example: 1 },
                                price: { type: 'number', example: 120000 },
                            },
                        },
                    },
                },
            },
            DiscountProductsQuery: {
                type: 'object',
                properties: {
                    code: { type: 'string', example: 'SALE10' },
                    shopId: { type: 'string' },
                    userId: { type: 'string' },
                    limit: { type: 'number', example: 50 },
                    page: { type: 'number', example: 1 },
                },
            },
        },
    },
    security: [{ ApiKeyAuth: [] }],
    paths: {
        '/v1/api/shop/signup': {
            post: {
                tags: ['Access'],
                summary: 'Đăng ký shop',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/SignUp' } } },
                },
                responses: { 201: { description: 'Registered OK' } },
            },
        },
        '/v1/api/shop/login': {
            post: {
                tags: ['Access'],
                summary: 'Đăng nhập shop',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } },
                },
                responses: { 200: { description: 'Login success, trả tokens và shop' } },
            },
        },
        '/v1/api/shop/logout': {
            post: {
                tags: ['Access'],
                summary: 'Đăng xuất',
                security: [{ ApiKeyAuth: [], ClientId: [], AccessToken: [] }],
                responses: { 200: { description: 'Logout success' } },
            },
        },
        '/v1/api/shop/handleRefreshToken': {
            post: {
                tags: ['Access'],
                summary: 'Làm mới access token',
                security: [{ ApiKeyAuth: [], ClientId: [], RefreshToken: [] }],
                responses: { 200: { description: 'Get token success' } },
            },
        },
        '/v1/api/product/search/{keySearch}': {
            get: {
                tags: ['Product'],
                summary: 'Tìm sản phẩm theo từ khóa',
                parameters: [
                    { name: 'keySearch', in: 'path', required: true, schema: { type: 'string' }, example: 'ao' },
                ],
                responses: { 200: { description: 'Danh sách sản phẩm' } },
            },
        },
        '/v1/api/product': {
            get: {
                tags: ['Product'],
                summary: 'Danh sách sản phẩm đã publish',
                parameters: [
                    { name: 'limit', in: 'query', schema: { type: 'number', default: 50 } },
                    { name: 'page', in: 'query', schema: { type: 'number', default: 1 } },
                    { name: 'sort', in: 'query', schema: { type: 'string', default: 'ctime' } },
                ],
                responses: { 200: { description: 'Danh sách sản phẩm' } },
            },
            post: {
                tags: ['Product'],
                summary: 'Tạo sản phẩm',
                security: [{ ApiKeyAuth: [], ClientId: [], AccessToken: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
                },
                responses: { 200: { description: 'Create product success' } },
            },
        },
        '/v1/api/product/{product_id}': {
            get: {
                tags: ['Product'],
                summary: 'Chi tiết sản phẩm',
                parameters: [
                    { name: 'product_id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: { 200: { description: 'Chi tiết sản phẩm' } },
            },
        },
        '/v1/api/product/{productId}': {
            patch: {
                tags: ['Product'],
                summary: 'Cập nhật sản phẩm',
                security: [{ ApiKeyAuth: [], ClientId: [], AccessToken: [] }],
                parameters: [
                    { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
                },
                responses: { 200: { description: 'Update product success' } },
            },
        },
        '/v1/api/product/publish/{id}': {
            post: {
                tags: ['Product'],
                summary: 'Publish sản phẩm của shop',
                security: [{ ApiKeyAuth: [], ClientId: [], AccessToken: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: { 200: { description: 'Publish success' } },
            },
        },
        '/v1/api/product/unpublish/{id}': {
            post: {
                tags: ['Product'],
                summary: 'Unpublish sản phẩm của shop',
                security: [{ ApiKeyAuth: [], ClientId: [], AccessToken: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: { 200: { description: 'Unpublish success' } },
            },
        },
        '/v1/api/product/drafts/all': {
            get: {
                tags: ['Product'],
                summary: 'Danh sách bản nháp của shop',
                security: [{ ApiKeyAuth: [], ClientId: [], AccessToken: [] }],
                responses: { 200: { description: 'Danh sách draft' } },
            },
        },
        '/v1/api/product/published/all': {
            get: {
                tags: ['Product'],
                summary: 'Danh sách sản phẩm đã publish của shop',
                security: [{ ApiKeyAuth: [], ClientId: [], AccessToken: [] }],
                responses: { 200: { description: 'Danh sách published' } },
            },
        },
        '/v1/api/discount/amount': {
            post: {
                tags: ['Discount'],
                summary: 'Tính số tiền giảm',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/DiscountAmount' } } },
                },
                responses: { 200: { description: 'Số tiền sau giảm' } },
            },
        },
        '/v1/api/discount/list_product_code': {
            get: {
                tags: ['Discount'],
                summary: 'Sản phẩm áp dụng một mã giảm giá',
                description: 'Handler đọc body: code, shopId, userId, limit, page.',
                requestBody: {
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/DiscountProductsQuery' } } },
                },
                responses: { 200: { description: 'Danh sách sản phẩm' } },
            },
        },
        '/v1/api/discount': {
            post: {
                tags: ['Discount'],
                summary: 'Tạo mã giảm giá',
                security: [{ ApiKeyAuth: [], ClientId: [], AccessToken: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Discount' } } },
                },
                responses: { 200: { description: 'Create discount code success' } },
            },
            get: {
                tags: ['Discount'],
                summary: 'Sản phẩm theo mã giảm giá (yêu cầu đăng nhập)',
                security: [{ ApiKeyAuth: [], ClientId: [], AccessToken: [] }],
                requestBody: {
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/DiscountProductsQuery' } } },
                },
                responses: { 200: { description: 'Danh sách sản phẩm' } },
            },
        },
    },
}

module.exports = swaggerSpec
