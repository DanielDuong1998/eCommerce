'use strict'

const express = require('express');
const productController = require('../../controllers/product.controller');
const router = express.Router();
const {asyncHandler} = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

//authentication
router.use(authenticationV2);

router.post('', asyncHandler(productController.createProduct));
router.post('/publish/:id', asyncHandler(productController.publishProductByShop));
router.post('/un-publish/:id', asyncHandler(productController.unPublishProductByShop));


//QUERY
router.get('/drafts/all', asyncHandler(productController.getAllDraftForShop));
router.get('/publish/all', asyncHandler(productController.getAllPublishForShop));

module.exports = router;