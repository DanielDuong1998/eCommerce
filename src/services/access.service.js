'use strict'

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
// const crypto = require('crypto');
const crypto = require('node:crypto');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
}

class AccessService {
    static signUp = async ({name, email, password}) =>{
        try{
            const holderShop = await shopModel.findOne({email}).lean();
            
            if(holderShop) {
                return {
                    code: 'xxxx', 
                    message: 'Shop already registered!'
                }
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if(newShop){
                //created privateKey, publicKey
                // const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1', 
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // });
                const privateKey = crypto.randomBytes(64).toString('hex');
                const publicKey = crypto.randomBytes(64).toString('hex');

                console.log({privateKey, publicKey});

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                });

                if(!keyStore){
                    return {
                        code: 'xxxx',
                        message: `keyStore error`
                    }
                }

                //create token pair
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey);
                console.log(`Created token success:: `, tokens);

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fileds: ['_id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                };
            }

            return {
                code: 200,
                metadata: null
            }
        } 
        catch(error){
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService;