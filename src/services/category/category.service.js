'use strict';
const CategoryRepository = require('../../repositories/category.repository');
const {BadRequestError, NotFoundError} = require("../../common/response/error.response");
const {
    removeInvalidValue, updateNestedObjectParser, convertUnSelectToObject, convertSelectToObject
} = require("../../utils");
const {product} = require("../../models/product.model");


class CategoryService {
    static async createCategory(body) {
        const {
            category_name, category_description, category_logoUrl, category_images, category_products
        } = body;

        const newCategory = await CategoryRepository.createCategory({
            category_name, category_description, category_logoUrl, category_images, category_products
        });
        return newCategory;
    }

    static async findOneCategoryById(categoryId) {
        const foundCategory = await CategoryRepository.findOneCategoryById({categoryId, unSelect: ["__v"]});
        if (!foundCategory) {
            throw new NotFoundError('Category not found');
        }
        return foundCategory;
    }

    static async findAllCategories({limit = 9, sort = 'ctime', page = 1, filter = {category_isActive: true}}) {
        return await CategoryRepository.findAllCategories({
            limit,
            sort,
            page,
            filter,
            select: ['category_name', 'category_description', 'category_logoUrl', 'category_images', 'category_products', 'isMarkedDelete']
        });
    }

    static async updateCategory(categoryId, updateBody) {
        // 1. Remove attribute that is undefined
        const objectParams = removeInvalidValue(updateBody)

        const result = await CategoryRepository.updateCategoryById({
            categoryId, updateBody: updateNestedObjectParser(objectParams),
        })

        CategoryService.updateProductInCategory(categoryId, result, "update");

        return result;

    }

    static async addProductsToCategory({categoryId, payload}) {

        const objectParams = removeInvalidValue(payload)

        const result = await CategoryRepository.addProductsToCategory({
            categoryId: categoryId, payload: objectParams,
        })


        const bulkOperations = payload.map((productId) => ({
            updateOne: {
                filter: {_id: productId},
                update: {
                    $addToSet: {
                        product_categories: {
                            _id: categoryId,
                            category_name: result.category_name,
                            category_logoUrl: result.category_logoUrl,
                        },
                    },
                },
            },
        }));

        product.bulkWrite(bulkOperations)
            .then((bulkWriteResult) => {
                console.log('Add category in products success:', bulkWriteResult);
            })
            .catch((error) => {
                console.error('Error adding category in products:', error);
            });


        return result;
    }

    static async removeProductsFromCategory({categoryId, payload}) {

        const objectParams = removeInvalidValue(payload)

        const result = await CategoryRepository.removeProductsFromCategory({
            categoryId: categoryId, payload: objectParams,
        })

        const bulkOperations = payload.map((productId) => ({
            updateOne: {
                filter: {_id: productId},
                update: {
                    $pull: {
                        product_categories: {
                            _id: categoryId,
                        },
                    },
                },
            },
        }));

        product.bulkWrite(bulkOperations)
            .then((bulkWriteResult) => {
                console.log('Remove category in products success:', bulkWriteResult);
            })
            .catch((error) => {
                console.error('Error remove category in products:', error);
            });

        return result;

    }

    // PUT //
    static async deleteCategoryById(categoryId) {
        const result = await CategoryRepository.deleteOneCategoryById(categoryId);
        CategoryService.updateProductInCategory(categoryId, null, "delete");
        return result;
    }


    static async updateProductInCategory(categoryId, updatedCategory, updateType) {
        const foundProducts = await product.find({"product_categories._id": categoryId}).lean().exec();

        const productIdsToUpdate = foundProducts.map((product) => product._id);
        let bulkOperations = null;


        switch (updateType) {
            case "update":
                const updateFields = {};
                if (updatedCategory.category_name !== null) {
                    updateFields['product_categories.$.category_name'] = updatedCategory.category_name;
                }
                if (updatedCategory.logoUrl !== null) {
                    updateFields['product_categories.$.category_logoUrl'] = updatedCategory.logoUrl;
                }

                // Create an array of update operations for each product
                bulkOperations = productIdsToUpdate.map((productId) => {
                    return {
                        updateOne: {
                            filter: {_id: productId, 'product_categories._id': categoryId}, update: {
                                $set: updateFields
                            },
                        },
                    };
                });

                break;
            case "delete":
                bulkOperations = productIdsToUpdate.map((productId) => ({
                    updateOne: {
                        filter: {_id: productId}, update: {
                            $pull: {product_categories: {_id: categoryId}},
                        },
                    },
                }));
                break;
        }


        if (bulkOperations != null) {
            product.bulkWrite(bulkOperations)
                .then((bulkWriteResult) => {
                    console.log('Removing category in products:', bulkWriteResult);
                    bulkOperations = null;
                })
                .catch((error) => {
                    console.error('Error Removing category in products:', error);
                    bulkOperations = null;
                });
        }

    }


}


module.exports = CategoryService;
