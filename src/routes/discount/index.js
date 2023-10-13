'use strict';


const express = require("express");
const discountController = require('../../controllers/discount.controller');
const {asyncErrorHandler} = require("../../common/response/errorHandlerMiddleWare");
const {authenticate} = require("../../auth/jwtUtils");


const router = express.Router();


// GET Amount of discount
router.post('/amount', asyncErrorHandler(discountController.getDiscountAmount));
router.get('/list_product_code', asyncErrorHandler(discountController.getAllProductsCanApplyThisDiscountCode));

// AUTHENTICATE

router.use(authenticate);

router.post('', asyncErrorHandler(discountController.createDiscountCode));
router.get('', asyncErrorHandler(discountController.getAllDiscountCodes));







module.exports = router
