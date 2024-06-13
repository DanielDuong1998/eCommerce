'use strict'

const redis = require('redis');
const {promisify} = require('util');
const { reservationInventory } = require('../models/repositories/inventory.repo');
const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pexpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setnxAsync).bind(redisClient);

const acquiredLock = async (productId, quantity, cartId) => {
    const key = `lock_v2023_${productId}`;
    const retryTimes = 10;
    const expireTime = 3000; //3 seconds
    
    for(let i = 0; i < retryTimes; i++){
        // tao mot key, thang nao nam giu duoc vao thanh toan
        const result = await setnxAsync(key, expireTime);
        console.log(`result:: `, result);
        if(result === 1){
            // thao tac voi inventory
            const isReversation = await reservationInventory({
                productId, quantity, cartId
            });

            if(isReversation.modifiedCount){
                await pexpire(key, expireTime);
                return key;
            }

            return null;
        }
        else {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }
}

const releaseLock = async keyLock => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient);
    return await delAsyncKey(keyLock);
}

module.exports = {
    acquiredLock,
    releaseLock,
}