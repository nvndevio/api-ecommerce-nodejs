'use strict'

const redis = require('redis')
const { promisify } = require('util')
const { reserveInventory } = require('../models/repositories/inventory.repo')
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
})

// pexpire(key, milliseconds): đặt thời gian sống của key, tính bằng mili giây.
// Hết hạn Redis tự xóa key. Dùng để khóa chỉ giữ trong một khoảng ngắn.
const pexpire = promisify(redisClient.pexpire).bind(redisClient)

// setnx(key, value): SET if Not eXists. Chỉ ghi key khi key chưa có.
// Trả về 1 nếu ghi được (giành được khóa), 0 nếu key đã tồn tại (có người khác đang giữ).
const setnxAsync = promisify(redisClient.setnx).bind(redisClient)

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2023_${productId}`
    const retryTime = 10;
    const expireTime = 3000; // 3 seconds tam lock

    for (let i = 0; i < retryTime; i++) {
        //tao 1 key, thang nao nam giu duoc vao thanh toan
        const result = await setnxAsync(key, expireTime)
        console.log('[1]', result)

        if (result === 1) {
            // ghi vao redis thanh cong, thao tac voi inventory
            const isReversation = await reserveInventory({
                productId,
                quantity,
                cartId,
            })

            if(isReversation.modifiedCount) {
                await pexpire(key, expireTime)
                return key;
            }

            return null;
        }else {
            await new Promise(resolve => setTimeout(resolve, 50))
        }
    }
}

// xoa key lock
const releaseLock = async keyLock => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey(keyLock)
}

module.exports = {
    acquireLock,
    releaseLock,
}