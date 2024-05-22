'use strict'

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
// const crypto = require('crypto');
const crypto = require('node:crypto');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, ConflictRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
}

class AccessService {

    static handlerRefreshTokenV2 = async ({keyStore, user, refreshToken}) =>{
        const {userId, email} = user;

        if(keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyTokenService.deleteKeyById(userId);
            throw new BadRequestError('Something wrong happend! Pls relogin');
        }

        if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop not registered!');
        
        const foundShop = await findByEmail({email});
        if(!foundShop) throw new AuthFailureError('Shop not registered');
        
        const tokens = await createTokenPair({userId, email}, keyStore.publicKey, keyStore.privateKey);
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user,
            tokens
        }
    }

    /**
     * check this token used?
     * 
     */
    static handlerRefreshToken = async (refreshToken) =>{
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
        if(foundToken){
            const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey);
            console.log("userId, email: ", {userId, email});

            await KeyTokenService.deleteKeyById(userId);
            throw new BadRequestError('Something wrong happend! Pls relogin');
        }

        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if(!holderToken) throw new AuthFailureError('Shop not registered!');

        const {userId, email} = await verifyJWT(refreshToken, holderToken.privateKey);
        const foundShop = await findByEmail({email});

        if(!foundShop) throw new AuthFailureError('shop not registered');

        //create token
        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey);

        //update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user: {userId, email}, 
            tokens
        }
    }

    static logout = async(keyStore) =>{
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log('delKey: ', delKey);
        return delKey;
    }

    /**
     * 1 - Check email in dbs
     * 2 - match password
     * 3 - create AccessToken and RefreshToken and save
     * 4 - generate tokens
     * 5 - get data return login
     */
    static login = async({email, password, refreshToken = null}) =>{
        const foundShop = await findByEmail({email});
        if(!foundShop) throw new BadRequestError('Shop not registered');

        console.log("foundShop: ", foundShop);

        const match = await bcrypt.compare(password, foundShop.password);
        if(!match) throw new AuthFailureError('Authentication error');

        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        const {_id: userId} = foundShop;
        const tokens = await createTokenPair({userId, email}, publicKey, privateKey);

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey, userId
        });

        return {
            shop: getInfoData({fileds: ['_id', 'name', 'email'], object: foundShop}),
            tokens
        };
    }

    static signUp = async ({name, email, password}) =>{
            const holderShop = await shopModel.findOne({email}).lean();
            
            if(holderShop) {
                throw new BadRequestError('Error: Shop already registered!');
            
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if(newShop){
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
}

module.exports = AccessService;