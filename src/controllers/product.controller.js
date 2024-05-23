'user strict'

const ProductService = require('../services/product.service');
const ProductServiceV2 = require('../services/product.service.xxx');
const {SuccessResponse} = require('../core/success.response');

class ProductController{
    createProduct = async(req, res, next) =>{
        new SuccessResponse({
            message: 'Create new Product success',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res);
    }

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Publish product success!',
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res);
    }

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'un publish product success!',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res);
    }

    /**
     * @desc Get all Drafts for shop
     * @param {*} req 
     * @param {*} res 
     * @return {JSON}  
     */
    getAllDraftForShop = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Get list Draft success!',
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res);
    }

    getAllPublishForShop = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Get list Publish success!',
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res);
    }
}

module.exports = new ProductController();