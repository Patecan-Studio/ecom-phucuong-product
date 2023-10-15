'use strict'

const express = require("express");
const categoryController = require('../../controllers/category/category.controller');
const {asyncErrorHandler} = require("../../common/response/errorHandlerMiddleWare");
const {authenticate} = require("../../auth/jwtUtils");


const router = express.Router();

router.get('/:categoryId', asyncErrorHandler(categoryController.findOneCategory));
router.get('', asyncErrorHandler(categoryController.findAllCategories));


router.post('', asyncErrorHandler(categoryController.createCategory));
router.post('/:categoryId/addProducts', asyncErrorHandler(categoryController.addProductsToCategory));
router.post('/:categoryId/removeProducts', asyncErrorHandler(categoryController.removeProductsFromCategory));
router.delete('/:categoryId', asyncErrorHandler(categoryController.deleteOneCategory));
router.patch('/:categoryId', asyncErrorHandler(categoryController.updateOneCategory));

/// [ MIDDLEWARE ] Authenticate Token ///
router.use(authenticate);

module.exports = router
