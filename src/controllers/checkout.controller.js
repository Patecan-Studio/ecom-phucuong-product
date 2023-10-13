'use strict'

const {SuccessResponse} = require("../common/response/success.response");
const CheckoutService = require("../services/checkout.service");


class CheckoutController {

    checkoutReview = async (req, res, next) => {
        const result = await CheckoutService.checkoutReview(req.body);

        new SuccessResponse({
            message: 'Review Checkout Successfully',
            metadata: result
        }).send(res);
    }


}

module.exports = new CheckoutController();
