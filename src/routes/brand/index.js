'use strict'

const express = require("express");
const brandController = require('../../controllers/brand/brand.controller');
const {asyncErrorHandler} = require("../../common/response/errorHandlerMiddleWare");
const {authenticate} = require("../../auth/jwtUtils");


const router = express.Router();


// [ MIDDLEWARE ] Authenticate Token
router.use(authenticate);

router.post('', asyncErrorHandler(brandController.createBrand));


module.exports = router
