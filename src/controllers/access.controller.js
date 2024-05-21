'use strict'

const { Created, OK, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController{
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