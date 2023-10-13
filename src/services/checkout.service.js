'use strict'

const {BadRequestError, NotFoundError} = require("../common/response/error.response");
const DiscountService = require("./discount/discount.service");
const {findOneCartById} = require("../repositories/cart.repository");
const {checkProductCurrentlyAvailableByServer} = require("../repositories/product.repository");
const {acquireLock, releaseLock} = require("./redis/redis.service");
const order = require("../models/order.model");

class CheckoutService {

    /**
     * @Payload-From-FE: {
     *     cartId,
     *     userId,
     *     shop_order_ids: [
     *         {
     *             shopId,
     *             shop_discount: [],
     *             item_products: [
     *                 [
     *                     price,
     *                     quantity,
     *                     productId,
     *                 ]
     *             ]
     *         },
     *         {
     *             shopId,
     *             shop_discount: [
     *                 {
     *                     discountId,
     *                     discountCode
     *                 }
     *             ],
     *             item_products: [
     *                 [
     *                    @price --> Get from DB, not from FE,
     *                     price
     *                     quantity,
     *                     productId,
     *                 ]
     *             ]
     *         }
     *     ]
     * }
     */

    static async checkoutReview({cartId, userId, shop_order_ids}) {
        const foundCart = await findOneCartById(cartId);
        if (!foundCart) {
            throw new NotFoundError("Cart not found");
        }

        const checkout_order = {
            totalPrice: 0, // --> Tổng Tiền Hàng
            feeShip: 0, // --> Phí Ship
            totalDiscount: 0, // --> Tổng Giảm Giá
            totalCheckout: 0, // --> Tổng Thanh Toán
        }


        let shop_order_ids_new = [];

        for (let i = 0; i < shop_order_ids.length; i++) {

            const {shopId, shop_discount = [], item_products = []} = shop_order_ids[i];

            const productInSyncWithDB = await checkProductCurrentlyAvailableByServer(item_products);
            console.log(`Check Product Server::`, productInSyncWithDB);

            if (!productInSyncWithDB) {
                throw new BadRequestError("Something Wrong, please try again later");
            }

            const checkoutPrice = productInSyncWithDB.reduce((acc, product) => {
                return acc + (product.product_price * product.product_quantity);
            }, 0);

            checkout_order.totalPrice += checkoutPrice;

            const itemCheckOut = {
                shopId,
                shop_discount,
                rawPrice: checkoutPrice,
                discountedPrice: checkoutPrice,
                item_products: productInSyncWithDB
            }

            /**
             * @Rule: Nếu có mã giảm giá
             */
            if (shop_discount.length > 0) {
                const {totalOrderValue=0, discount=0 } = await DiscountService.getDiscountAmount({
                    discountCode: shop_discount[0].discountCode,
                    userId,
                    shopId,
                    productApplied: productInSyncWithDB
                });


                checkout_order.totalDiscount += discount;

                if(discount > 0){
                    itemCheckOut.discountedPrice = checkoutPrice - discount;
                }
            }


            checkout_order.totalCheckout += itemCheckOut.discountedPrice;
            shop_order_ids_new.push(itemCheckOut);
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }

    }

    static async orderByUser({shop_order_ids_new, cartId, userId, user_address={}, user_note="", user_payment={}}) {
        const {shop_order_ids, checkout_order} = await this.checkoutReview({cartId, userId, shop_order_ids: shop_order_ids_new});

        /**
         * @Rule: Check lại xem vượt quá số lượng sản phẩm trong kho hay không
         */
        const products = shop_order_ids_new.flatMap(order => order.item_products);
        console.log(`[1]:`, products);

        let acquiredProduct = [];
        for (let i =0; i<products.length; i++){
            const {productId, product_quantity} = products[i];
            const keyLock = await acquireLock(productId, product_quantity, cartId);

            acquiredProduct.push(keyLock ? true: false);
            if(keyLock){
                await releaseLock(keyLock);
            }
        }

        /**
         * @Rule: Nếu có 1 sản phẩm không đủ số lượng thì không cho đặt hàng
         */

        if(acquiredProduct.includes(false)){
            throw new BadRequestError("Sản phẩm không đủ số lượng, vui lòng quay lại giỏ hàng");
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new,
            order_note: user_note
        });

        /**
         * @Rule: Nếu discount thành công thì xóa san pham trong giỏ hàng
         */
        if(newOrder){

        }
        return newOrder;

    }


    /**
     * @FEATURE: Query Order By User
     */
    static async getAllOrderByUser({userId, limit, skip}) {

    }

    /**
     * @FEATURE:
     */
    static async getOneOrderByUser({userId, limit, skip}) {

    }

    /**
     * @FEATURE:
     */
    static async cancelOrderOfUser({userId, limit, skip}) {

    }

    /**
     * @FEATURE:
     */
    static async updateOrderStatusByAdmin({userId, limit, skip}) {

    }


}

module.exports = CheckoutService;
