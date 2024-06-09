'use strict'

const { Types } = require('mongoose');
const {product, electronic, clothing, furniture} = require('../../models/product.model');
const { getSelectData, unGetSelectData, convertToObjectIdMongodb } = require('../../utils');

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

const findAllProducts = async ({limit, sort, page, filter, select}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1};
    const products = await product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

    return products;
}

const findProduct = async ({product_id, unSelect}) => {
    return await product.findById(product_id).select(unGetSelectData(unSelect));
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

const updateProductById = async ({
    productId,
    bodyUpdate,
    model,
    isNew = true
    })=>{
    return await model.findByIdAndUpdate(productId, bodyUpdate,{
        new: isNew
    });
}

const getProductById = async({productId})=>{
    return await product.findOne({_id: convertToObjectIdMongodb(productId)}).lean();
}

const checkProductByServer = async (products) =>{
    return await Promise.all(products.map(async product =>{
        const foundProduct = await getProductById({productId: product.productId});
        console.log("foundProduct: ", foundProduct);
        if(foundProduct){
            return {
                price: foundProduct.product_price,
                quantity: product.quantity,
                productId: product.productId
            }
        }
    }))
}

module.exports = {
    findAllDraftsForShop,
    findAllPublishForShop,
    publishProductByShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
    checkProductByServer,
}