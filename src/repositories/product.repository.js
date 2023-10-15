const {product, cloth, electronic} = require('../models/product.model');
const {populate} = require("dotenv");
const {Types} = require("mongoose");
const keyTokenModel = require("../models/keyStore.model");
const {convertSelectToObject, convertUnSelectToObject} = require("../utils");
const {BadRequestError} = require("../common/response/error.response");


const findAllDraftForShop = async ({query, limit, skip}) => {
    return await queryProduct({query, limit, skip});
}

const findAllPublishForShop = async ({query, limit, skip}) => {
    return await queryProduct({query, limit, skip});
}

const findAllProducts = async ({limit, sort,page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy =  sort === 'ctime' ? {_id: -1} : {_id: 1} ;
    const products = await product
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(convertSelectToObject(select))
        .lean()
        .exec();

    return products;
}

const findOneProduct = async ({productId, unSelect}) => {



    const foundProduct = await product
        .findById(productId)
        .select(convertUnSelectToObject(unSelect))
        .exec();


    return foundProduct;
}


const searchProduct = async ({keySearch}) => {
    const regexSearch = new RegExp(keySearch);

    const results = await product.find({
            isDraft: false,
            $text: {
                $search: regexSearch
            }
        },
        {score: {$meta: "textScore"}})
        .sort({score: {$meta: "textScore"}})
        .lean();

    return results;
}

const publishProductByShop = async ({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: product_id
    }).exec();

    if (!foundShop) {
        return null
    }

    foundShop.isDraft = false;
    foundShop.isPublished = true;

    const {modifiedCount} = await product.updateOne({
        _id: product_id,
        product_shop: new Types.ObjectId(product_shop),
    }, {
        $set: foundShop
    });

    return modifiedCount;
}


const unPublishProductByShop = async ({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: product_id
    }).exec();

    if (!foundShop) {
        return null
    }

    foundShop.isDraft = true;
    foundShop.isPublished = false;

    const {modifiedCount} = await product.updateOne({
        _id: product_id,
        product_shop: new Types.ObjectId(product_shop),
    }, {
        $set: foundShop
    });

    return modifiedCount;
}

const repoUpdateProductById = async ({productId, updateBody, model, isNew = true}) => {


    return await model.findByIdAndUpdate(productId, updateBody, {
        new: isNew,
    });


}


const queryProduct = async ({query, limit, skip}) => {
    return await product.find(query)
        .populate('product_shop', 'name email -_id')
        .sort({updateAt: -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}


const checkProductCurrentlyAvailableByServer = async (products) => {
    return await Promise.all(products.map(async (product) => {

        const foundProduct = await findOneProduct({product_id: product.productId, unSelect: []});
        if (foundProduct){
            if(foundProduct.product_price !== product.product_price){
                console.log("The Product Price is not in sync with the server, please try again later");
            }

            return {
                productId: product.productId,
                product_price: foundProduct.product_price,
                product_quantity: product.product_quantity
            }
        }

    }));
}


module.exports = {
    findAllDraftForShop,
    findAllPublishForShop,
    publishProductByShop,
    unPublishProductByShop,
    findAllProducts,
    findOneProduct,
    searchProduct,
    repoUpdateProductById,
    checkProductCurrentlyAvailableByServer
}


