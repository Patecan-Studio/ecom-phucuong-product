'use strict'

const {SuccessResponse} = require("../common/response/success.response");
const CartService = require("../services/cart/cart.service");


class CartController {

    /**
     * @Features: Add Product to Cart [USER]
     */
    addToCart = async (req, res, next) => {
        const result = await CartService.addProductToCart(req.body);

        new SuccessResponse({
            message: 'Add to Cart Successfully',
            metadata: result
        }).send(res);
    }

    /**
     * @Features: Increase / decrease product [USER]
     **/
    updateProductQuantity = async (req, res, next) => {
        const result = await CartService.updateProductQuantity(req.body);

        new SuccessResponse({
            message: 'Update product quantity successfully',
            metadata: result
        }).send(res);
    }

    /**
     * @Features: Delete Product in Cart [USER]
     **/
    deleteProductInCart = async (req, res, next) => {
        const result = await CartService.deleteProductInUserCart(req.body);

        new SuccessResponse({
            message: "Delete product from Cart successfully",
            metadata: result
        }).send(res);
    }

    /**
     * @Features: List All Products in Cart [USER]
     **/
    listAllProductsInCart = async (req, res, next) => {
        const result = await CartService.listProductInUserCart(req.query);

        new SuccessResponse({
            message: 'Get all product from Cart successfully',
            metadata: result
        }).send(res);
    }


}

module.exports = new CartController();
