'use strict'


const {model, Schema, Types} = require('mongoose')

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'


const cartSchema = new Schema({
        cart_state: {type: String, required: true, enum: ['active', 'inactive'], default: 'active'},
        cart_products: {type: Array, required: true, default: []},

        /*
        * cart_products: [
        *     {
        *         productId,
        *         shopId,
        *         quantity:
        *         name:
        *         price:
        *     }
        * ]
        */

        cart_count_product: {type: Number, required: true, default: 0},
        cart_userId: {type:String, required: true},
    },
    {
        collection: COLLECTION_NAME,
        timestamps: {
            createAt: 'createdOn',
            updatedAt: 'modifiedOn'
        }
    });


module.exports = model(DOCUMENT_NAME, cartSchema)
