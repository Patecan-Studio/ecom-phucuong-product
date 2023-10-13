'use strict'


const cart = require("../../models/cart.model");
const {BadRequestError, NotFoundError} = require("../../common/response/error.response");
const {convertStringIdToObjectId} = require("../../utils");
const {
    createUserCart,
    updateExistedProductQuantityInCart,
    deleteProductInUserCart,
    getListProductCart,
    pushProductToUserCart
} = require("../../repositories/cart.repository");
const {findOneProduct} = require("../../repositories/product.repository");

/**

 [USER FUNCTION]
 @Features: Add Product to Cart [USER]
 @Features: Increase / Decrease Product Quantity
 @Features: Get Cart Detail
 @Features: Remove Product from Cart
 @Features: Remove Cart

  [SHOP FUNCTION]
 */

class CartService {

    /**
     * @Features: Add Product to Cart [USER]
     */
    static async addProductToCart({userId, product = {}}) {
        const userCart = await cart.findOne({cart_userId: userId});

        /**
         * @RULE-1: Giỏ hàng chưa tồn tại
         */

        if (!userCart) {
            return await createUserCart({userId, product});
        }

        const result = await pushProductToUserCart({userId, userCart, product});

        if(!result) {
            throw new BadRequestError("Cannot add product right now, please try again later");
        }

        return result;
    }

    /**
     * @Features: Increase / decrease product [USER]
     *
     * shop_order_ids: [
     *     {
     *         shopId,
     *         item_products: [
     *             {
     *              quantity,
     *              @price --> Get from DB, not from FE,
     *              price,
     *              shopId,
     *              old_quantity,
     *              productId
     *             }
     *         ],
     *         version
     *     }
     * ]
     */
    static async updateProductQuantity({userId, shop_order_ids}) {
        const {productId, quantity, old_quantity} = shop_order_ids[0]?.item_products[0];

        const foundProduct = await findOneProduct({
            product_id: productId,
            unSelect: ['isDraft', 'isPublished', 'createdAt', 'updateAt', '__v']
        })


        if (!foundProduct) {
            throw new NotFoundError("Product is not existed");
        }

        console.log(foundProduct.product_shop.toString())

        if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.item_products[0].shopId.toString()) {
            throw new NotFoundError("Product do not belong to the shop");
        }

        if (quantity === 0) {
            // DELETE //
        }

        return await updateExistedProductQuantityInCart({
            userId, product: {
                productId,
                quantity: quantity - old_quantity
            }
        });

    }


    /**
     * @Features: Delete product [USER]
     **/
    static async deleteProductInUserCart({userId, productId}) {
        return await deleteProductInUserCart({userId, productId});
    }

    /**
     * @Features: Delete product [USER]
     **/
    static async listProductInUserCart({userId, productId}) {
        return await getListProductCart({userId});
    }
}


module.exports = CartService;
