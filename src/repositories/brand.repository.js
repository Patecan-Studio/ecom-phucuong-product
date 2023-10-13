const brandModel = require('../models/brand.model');
const {populate} = require("dotenv");
const {Types} = require("mongoose");
const {convertSelectToObject, convertUnSelectToObject} = require("../utils");
const {BadRequestError} = require("../common/response/error.response");
const categoryModel = require("../models/category.model");


class BrandRepository{
    static createBrand = async (payload) => {
        console.log(payload)
        const newBrand = await brandModel.create(payload);
        return newBrand;
    }

    static findOneBrand = async ({brandId, unSelect}) => {

        const foundBrand = await brandModel
            .findById(brandId)
            .select(convertUnSelectToObject(unSelect))
            .lean()
            .exec();

        return foundBrand;
    }

}


module.exports = BrandRepository


