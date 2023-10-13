
const BrandRepository = require('../../repositories/brand.repository');
const {BadRequestError} = require("../../common/response/error.response");
const {Schema} = require("mongoose");


class BrandService {
    static async createBrand(body) {
        const {
            brand_name,
            brand_description,
            brand_logoUrl,
            brand_images,
            brand_products
        } = body;

        const newBrand = await BrandRepository.createBrand({brand_name, brand_description, brand_logoUrl, brand_images, brand_products});
        console.log(`newBrand::`, newBrand);
        return newBrand;
    }

    static async findOneBrandById(brandId) {
        return await BrandRepository.findOneBrand({brandId, unSelect: []});
    }
}


module.exports = BrandService;
