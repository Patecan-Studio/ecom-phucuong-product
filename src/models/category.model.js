'use strict'

const {model, Schema, Types} = require('mongoose')

const DOCUMENT_NAME = 'Category'
const COLLECTION_NAME = 'Categories'

const categorySchema = new Schema({
    category_name: {
        type: String,
        trim: true,
        maxLength: 150,
        required: true
    },
    category_description: {
        type: String,
        trim: true,
        maxLength: 150
    },
    category_logoUrl: {
        type: String,
        trim: true,
        maxLength: 150,
        default: "https://via.placeholder.com/150"
    },
    category_images: [{
        imageName: {type: String},
        imageUrl: {type: String},
    }],
    category_products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        }
    ],
    category_isActive : { type: Boolean, default: true },
    isMarkedDelete: { type: Boolean, default: false },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});


module.exports = model(DOCUMENT_NAME, categorySchema)
