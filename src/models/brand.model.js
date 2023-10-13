'use strict'

const {model, Schema, Types} = require('mongoose')

const DOCUMENT_NAME = 'Brand'
const COLLECTION_NAME = 'Brands'

const brandSchema = new Schema({
    brand_name: {
        type: String,
        trim: true,
        maxLength: 150,
        required: true
    },
    brand_description: {
        type: String,
        trim: true,
        maxLength: 150
    },
    brand_logoUrl: {
        type: String,
        trim: true,
        maxLength: 150,
        default: "https://via.placeholder.com/150"
    },
    brand_images: [{
        imageName: {type: String},
        imageUrl: {type: String},
    }],
    brand_products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        }
    ],
    brand_isActive : { type: Boolean, default: true },
    isMarkedDelete: {type: Boolean, default: false},
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

// Create Index //
brandSchema.index({brand_name: 'text'});

module.exports = model(DOCUMENT_NAME, brandSchema)
