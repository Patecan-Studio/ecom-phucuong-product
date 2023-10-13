'use strict'

const { model, Schema, Types } = require('mongoose')

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'discounts'

const discountSchema = new Schema({
    discount_code: {type: String, required: true},
    discount_name: {type: String, require: true},
    discount_shopId: {type: Schema.Types.ObjectId, ref:'Shop'},
    discount_description: {type: String, required: true},
    discount_type: {type: String, default: 'fixed_amount'}, // fixed_amount | percentage
    discount_value: {type: Number, required: true},
    discount_startDate: {type: Date, required: true},
    discount_endDate: {type: Date, required: true},
    discount_max_uses: {type: Number, required: true},
    discount_uses_count: {type: Number, required: true},
    discount_user_used: {type: Array,default: []},
    discount_max_used_per_user: {type: Number, required: true},
    discount_min_order_value: {type: Number, required: true},
    discount_isActive: {type: Boolean, default: true},
    discount_applies_to: {type: String, default: 'all' }, // all | product | category
    discount_product_ids_applied: {type: Array, default: []},

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});


module.exports = model(DOCUMENT_NAME, discountSchema)
