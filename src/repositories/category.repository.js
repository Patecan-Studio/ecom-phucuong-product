const categoryModel = require('../models/category.model');
const {populate} = require("dotenv");
const {Types} = require("mongoose");
const {convertSelectToObject, convertUnSelectToObject} = require("../utils");
const {BadRequestError} = require("../common/response/error.response");
const {product} = require("../models/product.model");


class CategoryRepository {
    static createCategory = async (payload) => {
        const newCategory = await categoryModel.create(payload);
        return newCategory;
    }

    static findOneCategoryById = async ({categoryId, unSelect}) => {

        const foundCategory = await categoryModel
            .findById(categoryId)
            .where('isMarkedDelete').equals(false)
            .select(convertUnSelectToObject(unSelect))
            .lean()
            .exec();

        return foundCategory;
    }

    static findAllCategories = async ({limit, sort, page, filter, select}) => {
        const skip = (page - 1) * limit;
        const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1};
        const foundCategories = await categoryModel
            .find({
                ...filter,
                $and: [{isMarkedDelete: false}]
            })
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .select(convertSelectToObject(select))
            .lean()
            .exec();

        return foundCategories;
    }

    static updateCategoryById = async ({categoryId, updateBody, isNew = true}) => {
        return categoryModel.findByIdAndUpdate(categoryId, updateBody, {
            new: isNew,
        });
    }

    static addProductsToCategory = async ({categoryId, payload}) => {
        console.log(payload)

        const result = categoryModel.findByIdAndUpdate(
            categoryId,
            { $addToSet: { category_products: { $each: payload } } },
            {new: true}
        );
        return result;
    }

    static removeProductsFromCategory = async ({categoryId, payload}) => {

        const result = await categoryModel.findByIdAndUpdate(
            categoryId,
            { $pull: { category_products: { $in: payload } } },
            { new: true }
        );
        return result;
    }

    static deleteOneCategoryById = async (categoryId) => {
        const foundCategory = await categoryModel.findOne({
            _id: new Types.ObjectId(categoryId),
            isMarkedDelete: false,
        }).exec();

        if (!foundCategory) {
            throw new BadRequestError('Category not found');
        }

        foundCategory.isMarkedDelete = true;

        const {modifiedCount} = await categoryModel.updateOne({
            _id: categoryId,
        }, {
            $set: foundCategory
        });

        return modifiedCount;
    }
}


module.exports = CategoryRepository


