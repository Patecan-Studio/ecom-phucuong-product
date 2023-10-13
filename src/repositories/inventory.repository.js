const inventoryModel = require('../models/inventory.model');

const {Types, Schema} = require("mongoose");
const {convertStringIdToObjectId} = require("../utils");
const cart = require("../models/cart.model");


const insertInventory = async ({productId, shopId, stock, location = 'unknown'}) => {

    console.log("insertInventory::", productId, shopId, stock, location);
    await inventoryModel.findOneAndUpdate({
            inventory_productId: productId
        },
        {
            $set: {
                inventory_productId: productId,
                inventory_location: location,
                inventory_shopId: shopId
            },
            $inc: { inventory_stock: stock }
        },
        {upsert: true, new: true});

}

const reservationInventory = async ({productId, quantity, cartId}) => {

    /**
     * @Step-1: Kiểm tra xem có đủ hàng để đặt hàng hay không?
     */
    const query = {
        inventory_productId: convertStringIdToObjectId(productId),
        inventory_stock: {$gte: quantity}
    };

    /**
     * @Step-2: Nếu đủ hàng thì thực hiện:
     *          - Giảm số lượng hàng trong kho
     *          - Thêm vào danh sách đặt hàng
     */
    const update = {
        $inc: {
            inventory_stock: -quantity
        },
        $push: {
            inventory_reservations: {
                quantity,
                cartId,
                createdOn: new Date()
            }
        }
    }

    const options = {
        upsert: true,
        new: true
    }

    return inventory.updateOne(query, update, options);
}


module.exports = {
    insertInventory,
    reservationInventory
}
