'use strict'

const inventory = require("../../models/inventory.model");
const {findOneProduct} = require("../../repositories/product.repository");
const {BadRequestError} = require("../../common/response/error.response");


class InventoryService {
    static async addStockToInventory({stock, productId, shopId, location}) {
        const product = await findOneProduct({product_id: productId, unSelect: []});

        if(!product){
            throw new BadRequestError("Product not found");
        }

        const query = {
            inventory_productId: productId,
            inventory_shopId: shopId,
        }
        const updateSet = {
            $inc: {
                inventory_stock: stock
            },
            $set: {
                inventory_location: location
            }
        }, options = {upsert: true, new: true}


        return await inventory.findOneAndUpdate(query, updateSet);

    }


}

module.exports = InventoryService;
