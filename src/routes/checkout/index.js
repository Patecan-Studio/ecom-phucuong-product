'use strict';

const express = require("express");
const checkoutController = require('../../controllers/checkout.controller');
const {asyncErrorHandler} = require("../../common/response/errorHandlerMiddleWare");



const router = express.Router();

router.post('/review', asyncErrorHandler(checkoutController.checkoutReview));

module.exports = router
