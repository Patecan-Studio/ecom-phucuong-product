'use strict';


const express = require("express");
const cartController = require('../../controllers/cart.controller');
const {asyncErrorHandler} = require("../../common/response/errorHandlerMiddleWare");
const {authenticate} = require("../../auth/jwtUtils");


const router = express.Router();


router.post('', asyncErrorHandler(cartController.addToCart));
router.get('', asyncErrorHandler(cartController.listAllProductsInCart));
router.delete('', asyncErrorHandler(cartController.deleteProductInCart));
router.post('/update', asyncErrorHandler(cartController.updateProductQuantity));



module.exports = router
