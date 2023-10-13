'use strict'

const {model, Schema, Types} = require('mongoose')
const slugify = require("slugify");
const BrandService = require("../services/brand/brand.service");
const CategoryService = require("../services/category/category.service");
const {product} = require("./product.model");

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

// categorySchema.pre('save', async function (next) {
//     for (let i = 0; i < this.category_products.length; i++) {
//         const productId = this.product_categories[i];
//
//
//         product.updateMany(
//             { 'product_categories._id': this._id },
//             {
//                 $set: {
//                     'product_categories.$.categoryName': this.category_name,
//                     'product_categories.$.categoryLogoUrl': this.category_logoUrl,
//                 },
//             });
//     }
//     next();
// });

module.exports = model(DOCUMENT_NAME, categorySchema)
