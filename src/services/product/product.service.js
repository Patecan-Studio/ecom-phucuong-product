const {product, cloth, electronic} = require('../../models/product.model');
const {BadRequestError} = require("../../common/response/error.response");
const {
    findAllDraftForShop,
    findAllPublishForShop,
    publishProductByShop,
    unPublishProductByShop,
    findAllProducts,
    findOneProduct,
    searchProduct,
    repoUpdateProductById
} = require("../../repositories/product.repository");
const {removeInvalidValue, updateNestedObjectParser} = require("../../utils");
const {insertInventory} = require("../../repositories/inventory.repository");

// Define Factory class
class ProductFactory {


    static productRegistry = {}

    static registerProductType(product_type, productClass) {
        ProductFactory.productRegistry[product_type] = productClass;
    }

    static async createProduct(product_type, payload) {
        const productClass = ProductFactory.productRegistry[product_type];

        if (!productClass) {
            throw new BadRequestError('Invalid Product Type');
        }

        return await new productClass(payload).createProduct();

    }


    static async updateProduct(product_type, productId, payload) {
        const productClass = ProductFactory.productRegistry[product_type];

        if (!productClass) {
            throw new BadRequestError('Invalid Product Type');
        }

        return await new productClass(payload).updateProduct(productId);

    }


    // PUT //
    static async publishProductByShop({product_shop, product_id}) {
        return await publishProductByShop({product_shop, product_id});
    }

    static async unPublishProductByShop({product_shop, product_id}) {
        return await unPublishProductByShop({product_shop, product_id});
    }


    // QUERY //
    static async findAllDraftForShop({product_shop, limit = 9, skip = 0}) {
        const query = {product_shop, isDraft: true};
        return await findAllDraftForShop({query, limit, skip});
    }

    static async findAllPublishForShop({product_shop, limit = 9, skip = 0}) {
        const query = {product_shop, isPublished: true};
        return await findAllPublishForShop({query, limit, skip});
    }


    static async findAllProducts({limit = 9, sort = 'ctime', page = 1, filter = {isPublished: true}}) {
        return await findAllProducts({
            limit,
            sort,
            page,
            filter,
            select: ['product_name', 'product_price', 'product_discountPrice', 'product_discountPercentage', 'product_type', 'product_shopId']
        });
    }

    static async findOneProduct(product_id) {
        return await findOneProduct({product_id, unSelect: ['isDraft', 'isPublished', 'createdAt', 'updateAt', '__v']});
    }

    static async searchProducts({keySearch}) {
        return await searchProduct({keySearch});
    }


}


class Product {
    constructor({
                    product_name,
                    product_description,
                    product_price,
                    product_images,
                    product_discountPrice,
                    product_discountPercentage,
                    product_quantity,
                    product_type,
                    product_shopId,
                    product_brand,
                    product_categories,
                    product_material,
                    product_variations,
                    isDraft,
                    isPublished,
                    product_attributes
                }) {
        this.product_name = product_name;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_images = product_images;
        this.product_discountPrice = product_discountPrice;
        this.product_discountPercentage = product_discountPercentage;
        this.product_variations = product_variations;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shopId = product_shopId;
        this.product_brand = product_brand;
        this.product_categories = product_categories;
        this.product_material = product_material;
        this.product_attributes = product_attributes;
        this.isDraft = isDraft;
        this.isPublished = isPublished;
    }

    async createProduct(product_id) {
        const newProduct = await product.create({...this, _id: product_id});
        console.log("Creating Product", newProduct._id);
        if (newProduct) {
            // Add Product Stock to Inventory
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shopId,
                stock: this.product_quantity
            });

        }

        return newProduct;
    }

    // UPDATE //
    async updateProduct(productId, updateBody) {
        /**
         * {
         *      a:undefined,
         *      b:null
         * }
         **/
        // 1. Remove attribute that is undefined
        const objectParams = removeInvalidValue(this)
        // 2. check xem update o cho nao
        if (objectParams.product_attributes) {
            return await repoUpdateProductById({
                productId,
                updateBody: updateNestedObjectParser(objectParams.product_attributes),
                model: product
            })
        }

        return await repoUpdateProductById({productId, updateBody, model: product});
    }

}

// Define subclass for different product type
class Cloth extends Product {
    async createProduct() {

        const newCloth = await cloth.create({...this.product_attributes, product_shop: this.product_shop});
        if (!newCloth) {
            throw new BadRequestError('Cannot create Cloth');
        }

        const newProduct = await super.createProduct(newCloth._id);
        if (!newProduct) {
            throw new BadRequestError('Cannot create Product');
        }


        return newProduct;
    }


    async updateProduct(productId) {
        /*
            {
                a:undefined,
                b:null
            }
        */
        // 1. Remove attribute that is undefined
        const objectParams = removeInvalidValue(this)
        // 2. check xem update o cho nao
        if (objectParams.product_attributes) {
            await repoUpdateProductById({
                productId,
                updateBody: updateNestedObjectParser(objectParams.product_attributes),
                model: cloth
            })
        }

        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
        return updateProduct;
    }


}

class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({...this.product_attributes, product_shop: this.product_shop});
        if (!newElectronic) {
            throw new BadRequestError('Cannot create Electronic');
        }

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) {
            throw new BadRequestError('Cannot create Product');
        }


        return newProduct;
    }

    async updateProduct(productId) {
        /*
            {
                a:undefined,
                b:null
            }
        */
        // 1. Remove attribute that is undefined
        const objectParams = removeInvalidValue(this);
        console.log(objectParams);
        // 2. check xem update o cho nao
        if (objectParams.product_attributes) {
            await repoUpdateProductById({
                productId,
                updateBody: updateNestedObjectParser(objectParams.product_attributes),
                model: electronic
            })
        }

        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
        return updateProduct;
    }
}


// Register product type
ProductFactory.registerProductType('Cloth', Cloth);
ProductFactory.registerProductType('Electronic', Electronic);
ProductFactory.registerProductType('general', Product);


module.exports = ProductFactory;
