'use strict'

const discount = require('../../models/discount.model');
const {BadRequestError, NotFoundError} = require("../../common/response/error.response");
const {convertStringIdToObjectId} = require("../../utils");
const {findAllProducts} = require("../../repositories/product.repository");
const {
    checkDiscountExisted,
    findAllDiscountCodeWithUnSelect
} = require("../../repositories/discount.repository")

/**
 @Feature-1: Generate Discount Code
 @Feature-2: Get Discount Amount
 @Feature-3: Get all discount code
 @Feature-4: Verify Discount Code
 @Feature-5: Delete Discount Code
 @Feature-6: Cancel Discount Code
 **/

class DiscountService {

    static async generateDiscountCode(body) {
        const {
            discount_code,
            discount_name,
            discount_shopId,
            discount_description,
            discount_type,
            discount_value,
            discount_startDate,
            discount_endDate,
            discount_max_uses,
            discount_uses_count,
            discount_user_used,
            discount_max_used_per_user,
            discount_min_order_value,
            discount_isActive,
            discount_applies_to, // all | product | category
            discount_product_ids_applied,
        } = body;

        // Verify Time
        if (new Date() < new Date(discount_startDate) || new Date() > new Date(discount_endDate)) {
            throw new BadRequestError("Discount has expired");
        }

        if (new Date(discount_startDate) >= new Date(discount_endDate)) {
            throw new BadRequestError("Start date must before end date");
        }


        const foundDiscount = await discount.findOne({
            discount_code: discount_code,
            discount_shopId: convertStringIdToObjectId(discount_shopId)
        }).lean();

        if (foundDiscount && foundDiscount.discount_isActive) {
            throw new BadRequestError("Discount is existed");
        }

        const newDiscount = await discount.create({
                discount_code: discount_code,
                discount_name: discount_name,
                discount_shopId: discount_shopId,
                discount_description: discount_description,
                discount_type: discount_type, // fixed_amount | percentage
                discount_value: discount_value,
                discount_startDate: new Date(discount_startDate),
                discount_endDate: new Date(discount_endDate),
                discount_max_uses: discount_max_uses,
                discount_uses_count: discount_uses_count,
                discount_user_used: discount_user_used,
                discount_max_used_per_user: discount_max_used_per_user,
                discount_min_order_value: discount_min_order_value || 0,
                discount_isActive: discount_isActive,
                discount_applies_to: discount_applies_to, // all | product | category
                discount_product_ids_applied: discount_applies_to === 'all' ? [] : discount_product_ids_applied,
            }
        );

        console.log("newDiscount", newDiscount);

        return newDiscount;
    }

    static async updateDiscount() {
        // ...
    }

    /**
     * @Feature: Get discount code available with product
     */

    static async getAllProductsCanApplyThisDiscountCode({discountCode, shopId, limit, page}) {

        const foundDiscount = await discount.findOne({
            discount_code: discountCode,
            discount_shopId: convertStringIdToObjectId(shopId)
        }).lean();


        if (!foundDiscount || !foundDiscount.discount_isActive) {
            throw new NotFoundError("Discount is not existed");
        }

        let allProducts = null;
        if (foundDiscount.discount_applies_to === 'all') {
            allProducts = await findAllProducts({
                filter: {
                    product_shop: convertStringIdToObjectId(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })

            return foundDiscount.discount_value;
        } else if (foundDiscount.discount_applies_to === 'specific') {
            allProducts = await findAllProducts({
                filter: {
                    _id: {$in: foundDiscount.discount_product_ids_applied},
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }


        return allProducts;

    }


    static async getAllDiscountCodeByShop({limit, page, shopId}) {
        const discounts = await findAllDiscountCodeWithUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertStringIdToObjectId(shopId),
                discount_isActive: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        });

        return discounts;
    }

    /**
     @Feature: Apply Discount Code

     **/

    static async getDiscountAmount({discountCode, userId, shopId, productApplied}) {


        const foundDiscount = await discount.findOne({
            discount_code: discountCode,
            discount_shopId: convertStringIdToObjectId(shopId)
        }).lean();


        // const foundDiscount = await checkDiscountExisted({
        //     model: discount,
        //     filter: {
        //         discount_code: discountCode,
        //         discount_shopId: convertStringIdToObjectId(shopId)
        //     }
        // });

        if (!foundDiscount) {
            throw new NotFoundError("Discount is not existed");
        }

        const {
            discount_isActive,
            discount_max_uses,
            discount_min_order_value,
            discount_max_used_per_user,
            discount_user_used,
            discount_type
        } = foundDiscount;

        if (!discount_isActive) {
            throw new NotFoundError("Discount is expired");
        }
        if (!discount_max_uses) {
            throw new NotFoundError("Discount are over");
        }

        // if(new Date() < new Date(foundDiscount.discount_startDate) || new Date() > new Date(foundDiscount.discount_endDate)){
        //     throw new NotFoundError("Discount is expired");
        // }

        /**
         * @Rule: Nếu discount không áp dụng cho sản phẩm mà bạn truyền vào
         */
        let discountableProduct = productApplied;
        if (foundDiscount.discount_applies_to === 'specific') {
            const productIdsApplied = foundDiscount.discount_product_ids_applied.map(id => id.toString());
            discountableProduct = productApplied.filter(product => productIdsApplied.includes(product.productId.toString()));
        }

        const unDiscountableProduct = productApplied.filter((x) => !discountableProduct.includes(x));

        console.log("discountableProduct", discountableProduct)
        console.log("unDiscountableProduct", unDiscountableProduct)


        /**
         @Rule: Nếu discount mà còn lớn hơn giá trị đơn hàng thì không áp dụng được
         **/
        let totalOrderValue = 0;
        let totalDiscountableOrderValue = 0;

        if (discount_min_order_value > 0) {
            // --> Get total discount value
            totalOrderValue = productApplied.reduce((acc, product) => {
                return acc + product.product_price * product.product_quantity
            }, 0);


            totalDiscountableOrderValue = discountableProduct.reduce((acc, product) => {
                return acc + product.product_price * product.product_quantity
            }, 0);


            if (totalOrderValue < discount_min_order_value) {
                throw new NotFoundError("Discount cannot less than total Order Value");
            }
        }

        if (discount_max_used_per_user > 0) {
            const userUsesDiscount = discount_user_used.find(user => user.userId === userId);

            if (userUsesDiscount) {
                // ...
            }

        }


        const amountDiscounted = (discount_type === 'fixed_amount') ? (foundDiscount.discount_value) : (totalDiscountableOrderValue * foundDiscount.discount_value / 100);

        console.log("DISCOUNT", {
            totalOrderValue,
            discount: amountDiscounted,
            totalPrice: totalOrderValue - amountDiscounted
        });
        return {
            totalOrderValue,
            discount: amountDiscounted,
            totalPrice: totalOrderValue - amountDiscounted
        }
    }


    static async deleteDiscountCode({discount_shopId, discount_code}) {
        const deletedDiscount = await discount.findOneAndDelete({
            discount_code: discount_code,
            discount_shopId: convertStringIdToObjectId(discount_shopId)
        });

        return deletedDiscount;
    }


    /**
     @Feature: Cancel Discount Code
     */
    static async cancelDiscountCode({discount_shopId, discount_code, userId}) {

        const foundDiscount = await checkDiscountExisted({
            model: discount,
            filter: {
                discount_code: discount_code,
                discount_shopId: convertStringIdToObjectId(discount_shopId)
            }
        });

        if (!foundDiscount) {
            throw new NotFoundError("Discount is not existed");
        }

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_user_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        });

        return result;
    }
}

module.exports = DiscountService
