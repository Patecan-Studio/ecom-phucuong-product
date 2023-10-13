'use strict';
const CategoryRepository = require('../../repositories/category.repository');
const {BadRequestError, NotFoundError} = require("../../common/response/error.response");
const {removeInvalidValue, updateNestedObjectParser} = require("../../utils");



class CategoryService {
    static async createCategory(body) {
        const {
            category_name,
            category_description,
            category_logoUrl,
            category_images,
            category_products
        } = body;

        const newCategory = await CategoryRepository.createCategory({
            category_name,
            category_description,
            category_logoUrl,
            category_images,
            category_products
        });
        return newCategory;
    }

    static async findOneCategoryById(categoryId) {
        const foundCategory = await CategoryRepository.findOneCategoryById({categoryId, unSelect: ["__v"]});
        if(!foundCategory) {
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
        /**
         * {
         *      a:undefined,
         *      b:null
         * }
         **/
            // 1. Remove attribute that is undefined
        const objectParams = removeInvalidValue(updateBody)
        // 2. check xem update o cho nao

            return await CategoryRepository.updateCategoryById({
                categoryId,
                updateBody: updateNestedObjectParser(objectParams),
            })

    }

    static async addProductsToCategory({categoryId, payload}) {

        const objectParams = removeInvalidValue(payload)

        return await CategoryRepository.addProductsToCategory({
            categoryId: categoryId,
            payload: objectParams,
        })

    }

    static async removeProductsFromCategory({categoryId, payload}) {

        const objectParams = removeInvalidValue(payload)

        return await CategoryRepository.removeProductsFromCategory({
            categoryId: categoryId,
            payload: objectParams,
        })

    }

    // PUT //
    static async deleteCategoryById(categoryId) {
        return await CategoryRepository.deleteOneCategoryById(categoryId);
    }



}


module.exports = CategoryService;
