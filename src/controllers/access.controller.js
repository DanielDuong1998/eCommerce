'use strict'

const { Created, OK, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController{
    handlerRefreshToken = async (req, res, next) =>{
        //V1
        // new SuccessResponse({
        //     message: 'Get Token success',
        //     metadata: await AccessService.handlerRefreshToken(req.body.refreshToken)
        // }).send(res);

        //V2 Fixed, no need accessToken
        new SuccessResponse({
            message: 'Get token success!',
            metadata: await AccessService.handlerRefreshTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore
            })
        }).send(res);
    }

    logout = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Logout success',
            metadata: await AccessService.logout(req.keyStore)
        }).send(res);
    }

    login = async (req, res, next) =>{
        new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res);
    }

    signUp = async (req, res, next) =>{
        // return res.status(200).json({
        //     message: '',
            
        // })
        new Created({
            message: 'Registered OK!',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res);
    }
}

module.exports = new AccessController();