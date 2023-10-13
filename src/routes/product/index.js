'use strict'

const express = require("express");
const productController = require('../../controllers/product/product.controller');
const {asyncErrorHandler} = require("../../common/response/errorHandlerMiddleWare");
const {authenticate} = require("../../auth/jwtUtils");


const router = express.Router();

// SEARCH //
router.get('/search/:keySearch', asyncErrorHandler(productController.getSearchedProductsList));
router.get('', asyncErrorHandler(productController.findAllProducts));
router.get('/:product_id', asyncErrorHandler(productController.findOneProduct));

// [ MIDDLEWARE ] Authenticate Token
router.use(authenticate);

router.post('', asyncErrorHandler(productController.createProduct));
router.patch('/:productId', asyncErrorHandler(productController.updateProduct));
router.put('/publish/:id', asyncErrorHandler(productController.publishProductByShop));
router.put('/unPublish/:id', asyncErrorHandler(productController.unPublishProductByShop));

// QUERY //
router.get('/draft/all', asyncErrorHandler(productController.getAllDraftProductsForShop));
router.get('/published/all', asyncErrorHandler(productController.getAllPublishProductsForShop));






module.exports = router
