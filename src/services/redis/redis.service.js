'use strict'

const redis = require('redis');
const { promisify } = require('util');
const {reservationInventory} = require("../../repositories/inventory.repository");
const redisClient = redis.createClient({});


const pExpireAsync = promisify(redisClient.pExpire).bind(redisClient);
const setNXAsync = promisify(redisClient.setNX).bind(redisClient);


const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_ecom_phucuong:${productId}`;
    const retryTime = 10;
    const expireTime = 3000;

    for (let i = 0; i < retryTime; i++) {
        // Tạo 1 Lock Key, ai nắm giữ Lock Key này thì được phép thực hiện hành động
        const result = await setNXAsync(key, cartId);
        console.log(`result:::`, result)

        if (result === 1) {
            // Thao tác với Inventory
            const isReserved = await reservationInventory({productId, quantity, cartId});

            if(isReserved.modifiedCount){
                await pExpireAsync(key, expireTime);
                return key;
            }

            return null

        } else {
            await new Promise((resolve)=> setTimeout(resolve, 50));
        }
    }
}

const releaseLock = async (keyLock) => {
    const deleteLock = promisify(redisClient.del).bind(redisClient);
    return await deleteLock(keyLock);
}

module.exports = {
    acquireLock,
    releaseLock
}
