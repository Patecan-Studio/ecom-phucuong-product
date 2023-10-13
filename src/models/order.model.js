'use strict'


const {model, Schema, Types} = require('mongoose')

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'


const orderSchema = new Schema({
        order_userId: {type: Number, required: true},
        order_checkout: { type: Object, default: {}},

    /**
     * order_checkout: {
     *   totalPrice: 0, // --> Tổng Tiền Hàng
     *   feeShip: 0, // --> Phí Ship
     *   totalDiscount: 0, // --> Tổng Giảm Giá
     * }
     */

    order_shipping: { type: Object, default: {}},
    /**
     * order_shipping: {
     *      shipping_address: {
     *          street: String,
     *          city: String,
     *          country: String,
     *          zipCode: String
     *      }
     * }
     */

    order_payment: { type: Object, default: {}},
    order_products: { type: Array, required: true},
    order_trackingNumber: { type: String, default: '#000018052023'},
    order_status: { type: String, enum: ['pending', 'confirmed', 'shipped','cancelled', 'delivered'], default: 'pending'},
    order_note: { type: String, default: ''},
},
    {
        collection: COLLECTION_NAME,
        timestamps: {
            createAt: 'createdOn',
            updatedAt: 'modifiedOn'
        }
    });


module.exports = model(DOCUMENT_NAME, orderSchema)
