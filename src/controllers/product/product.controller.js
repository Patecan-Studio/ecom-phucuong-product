'use strict'

const {SuccessResponse} = require("../../common/response/success.response");
const ProductServiceV2 = require("../../services/product/product.service");

class ProductController {
    createProduct = async (req, res, next) => {

        /**
         * @req.user is the user object that we get from JWT token
         */
        const result =await ProductServiceV2.createProduct(
            req.body.product_type,
            {...req.body, product_shopId: req.user.userId}
        )

        new SuccessResponse({
            message: 'Create product successfully',
            metadata: result
        }).send(res);

    }

    publishProductByShop = async (req, res, next) => {

        const result =await ProductServiceV2.publishProductByShop(
            {
                product_shop: req.user.userId,
                product_id: req.params.id
            }
        )

        new SuccessResponse({
            message: 'Update product to PUBLISHED successfully',
            metadata: result
        }).send(res);

    }

    unPublishProductByShop = async (req, res, next) => {

        const result =await ProductServiceV2.unPublishProductByShop(
            {
                product_shop: req.user.userId,
                product_id: req.params.id
            }
        )

        new SuccessResponse({
            message: 'Update product to UN-PUBLISHED successfully',
            metadata: result
        }).send(res);

    }

    // QUERY //
    /**
     * @desc Get all draft product of a shop
     * @param {Number} limit
     * @param {Number} skip
     * @return {JSON} products
     */
    getAllDraftProductsForShop = async (req, res, next) => {
        const result =await ProductServiceV2.findAllDraftForShop({
            product_shop: req.user.userId,
        });

        new SuccessResponse({
            message: 'Get products list successfully',
            metadata: result
        }).send(res);
    }

    getAllPublishProductsForShop = async (req, res, next) => {
        const result =await ProductServiceV2.findAllPublishForShop({
            product_shop: req.user.userId,
        });

        new SuccessResponse({
            message: 'Get products list successfully',
            metadata: result
        }).send(res);
    }

    findAllProducts = async (req, res, next) => {
        const result =await ProductServiceV2.findAllProducts(req.query);

        new SuccessResponse({
            message: 'Get all products successfully',
            metadata: result
        }).send(res);
    }

    findOneProduct = async (req, res, next) => {
        const result =await ProductServiceV2.findOneProduct(req.params.product_id);

        new SuccessResponse({
            message: 'Get one products successfully',
            metadata: result
        }).send(res);
    }



    // SEARCH //
    getSearchedProductsList = async (req, res, next) => {
        const result =await ProductServiceV2.searchProducts(req.params);

        new SuccessResponse({
            message: 'Get searched products list successfully',
            metadata: result
        }).send(res);
    }

    // UPDATE //
    updateProduct = async (req, res, next) => {
        const result =await ProductServiceV2.updateProduct(req.body.product_type,req.params.productId,{...req.body,product_shop: req.user.userId});

        new SuccessResponse({
            message: 'Update Product successfully',
            metadata: result
        }).send(res);
    }


}

module.exports = new ProductController();
