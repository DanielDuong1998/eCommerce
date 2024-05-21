'use strict'

const shopModel = require("../models/shop.model")

const findByEmail = async ({email, select = {
    email: 1, password: 2, name: 1, status: 1, roles: 1
}}) =>{
    const user = await shopModel.findOne({email}).select(select).lean();
    console.log("user: " , user.password);
    return user;
}

module.exports = {
    findByEmail
}