'use strict'

const {SuccessResponse} = require("../common/response/success.response");
const DiscountService = require("../services/discount/discount.service");


class DiscountController {


    createDiscountCode = async (req, res, next) => {
        const result = await DiscountService.generateDiscountCode({
            ...req.body,
            discount_shopId: req.user.userId
        })

        new SuccessResponse({
            message: 'Create discount code successfully',
            metadata: result
        }).send(res);
    }


    getAllDiscountCodes = async (req, res, next) => {
        const result = await DiscountService.getAllDiscountCodeByShop({
            ...req.query,
            shopId: req.user.userId
        });

        new SuccessResponse({
           message: 'Get all discount code successfully',
            metadata: result,
        }).send(res);
    }

    getDiscountAmount = async (req, res, next) => {
        const result =await DiscountService.getDiscountAmount({
            ...req.body
        });

        new SuccessResponse({
            message: 'Get all discount code successfully',
            metadata: result,
        }).send(res);
    }

    getAllProductsCanApplyThisDiscountCode = async (req, res, next) => {
        const result = await DiscountService.getAllProductsCanApplyThisDiscountCode({
            ...req.query
        });

        new SuccessResponse({
            message: 'Get all discount code successfully',
            metadata: result,
        }).send(res);
    }
}


module.exports = new DiscountController();
