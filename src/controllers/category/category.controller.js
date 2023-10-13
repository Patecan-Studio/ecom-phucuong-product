'use strict'

const {SuccessResponse} = require("../../common/response/success.response");
const CategoryService = require("../../services/category/category.service");
const ProductServiceV2 = require("../../services/product/product.service");


class CategoryController {

    /**
     * @Features: Add New Category [ADMIN]
     */
    createCategory = async (req, res, next) => {
        const result = await CategoryService.createCategory(req.body);

        new SuccessResponse({
            message: 'Create New Category Successfully',
            metadata: result
        }).send(res);
    }


    /**
     * @Features: Add New Brand [ADMIN]
     */
    findOneCategory = async (req, res, next) => {
        const result = await CategoryService.findOneCategoryById(req.params.categoryId);

        new SuccessResponse({
            message: 'Get one category successfully',
            metadata: result
        }).send(res);
    }

    findAllCategories = async (req, res, next) => {
        const result = await CategoryService.findAllCategories(req.query);

        new SuccessResponse({
            message: 'Get categories list successfully',
            metadata: result
        }).send(res);
    }

    deleteOneCategory = async (req, res, next) => {
        const result = await CategoryService.deleteCategoryById(req.params.categoryId);

        new SuccessResponse({
            message: 'Delete one category successfully',
            metadata: result
        }).send(res);
    }

    updateOneCategory = async (req, res, next) => {
        const result = await CategoryService.updateCategory(
            req.params.categoryId,
            {...req.body}
        );

        new SuccessResponse({
            message: 'Update Product successfully',
            metadata: result
        }).send(res);
    }

    addProductsToCategory = async (req, res, next) => {

        const result = await CategoryService.addProductsToCategory({
            categoryId: req.params.categoryId,
            payload: req.body
        });

        new SuccessResponse({
            message: 'Add Products To Category successfully',
            metadata: result
        }).send(res);
    }

    removeProductsFromCategory = async (req, res, next) => {

        const result = await CategoryService.removeProductsFromCategory({
            categoryId: req.params.categoryId,
            payload: req.body
        });

        new SuccessResponse({
            message: 'Remove Products To Category successfully',
            metadata: result
        }).send(res);
    }

}


module.exports = new CategoryController();
