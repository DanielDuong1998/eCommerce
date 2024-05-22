'use strict'

const JWT = require('jsonwebtoken');
const { asyncHandler } = require('../helpers/asyncHandler');
const {AuthFailureError, NotFoundError} = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESH_TOKEN: 'refresh-token'
}

const createTokenPair = async (payload, publicKey, privateKey)=>{
    try{
        // accessToken
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '2 days'
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '2 days'
        });

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if(err){
                console.error(`error verify::`, err);
            }
            else {
                console.log(`decode verify: `, decode);
            }
        })
        
        return {accessToken, refreshToken};
    } catch(error){

    }
}

const authentication = asyncHandler(async (req, res, next) =>{
    /**
     * 1 - Check userID missing?
     * 2 - get accessToken
     * 3 - verifyToken
     * 4 - check user in dbs?
     * 5 - check keyStore with this userID?
     * 6 - ok -> return next()
     */

    const userId = req.headers[HEADER.CLIENT_ID];
    if(!userId) throw new AuthFailureError('Invalid Request');

    const keyStore = await findByUserId(userId);
    if(!keyStore) throw new NotFoundError('Not found keyStore');

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if(!accessToken) throw new AuthFailureError('Invalid Request');

    try{
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId');

        req.keyStore = keyStore;
        
        return next();
    } 
    catch(error){
        throw error;
    }
})

const authenticationV2 = asyncHandler(async (req, res, next) =>{
    /**
     * 1 - Check userID missing?
     * 2 - get accessToken
     * 3 - verifyToken
     * 4 - check user in dbs?
     * 5 - check keyStore with this userID?
     * 6 - ok -> return next()
     */

    const userId = req.headers[HEADER.CLIENT_ID];
    if(!userId) throw new AuthFailureError('Invalid Request');

    const keyStore = await findByUserId(userId);
    if(!keyStore) throw new NotFoundError('Not found keyStore');

    if(req.headers[HEADER.REFRESH_TOKEN]){
        try{
            const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
            if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId');

            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;
            return next();
        }
        catch(error){
            throw error;
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if(!accessToken) throw new AuthFailureError('Invalid Request');

    try{
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId');

        req.keyStore = keyStore;
        req.user = decodeUser;
        
        return next();
    } 
    catch(error){
        throw error;
    }
})

const verifyJWT = async (token, keyScret)=> {
    return await JWT.verify(token, keyScret);
}

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2,
    verifyJWT
}