'use strict'

const { Types } = require('mongoose');
const {product, electronic, clothing, furniture} = require('../../models/product.model');

const findAllDraftsForShop = async({query, limit, skip}) =>{
    return await queryProduct({query, limit, skip});
}

const findAllPublishForShop = async({query, limit, skip}) =>{
    return await queryProduct({query, limit, skip});
}

const publishProductByShop = async({product_shop, product_id}) =>{
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })

    if(!foundShop) return null;


    // foundShop.isDraft = false;
    // foundShop.isPublished = true;
    const {modifiedCount} = await foundShop.updateOne({
        $set: {
            "isDraft": false,
            "isPublished":  true
        }
    }); // modifiedCount = 0 khi khong co update, = 1 khi co update

    console.log("modifiedCount: ", modifiedCount);

    return modifiedCount;
}

const unPublishProductByShop = async({product_shop, product_id}) =>{
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })

    if(!foundShop) return null;

    const {modifiedCount} = await foundShop.updateOne({
        $set: {
            "isDraft": true,
            "isPublished":  false
        }
    }); // modifiedCount = 0 khi khong co update, = 1 khi co update

    console.log("modifiedCount: ", modifiedCount);

    return modifiedCount;
}

const searchProductByUser = async ({keySearch}) => {
    const regexSearch = new RegExp(keySearch);
    const result = await product.find(
        {   isPublished: true,
            $text: {$search: regexSearch}},
        {score: {$meta: 'textScore'}})
        .sort({score: {$meta: 'textScore'}})
        .lean();

    return result;
}

const queryProduct = async ({query, limit, skip}) =>{
    return await product.find(query)
    .populate('product_shop', 'name email -_id')
    .sort({updateAt: -1})
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}

module.exports = {
    findAllDraftsForShop,
    findAllPublishForShop,
    publishProductByShop,
    unPublishProductByShop,
    searchProductByUser,
}