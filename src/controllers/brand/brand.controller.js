'use strict'

const {SuccessResponse} = require("../../common/response/success.response");
const BrandService = require("../../services/brand/brand.service");


class BrandController {

    /**
     * @Features: Add New Brand [ADMIN]
     */
    createBrand = async (req, res, next) => {
        const result = await BrandService.createBrand(req.body);

        new SuccessResponse({
            message: 'Create New Brand Successfully',
            metadata: result
        }).send(res);
    }
}


module.exports = new BrandController();
