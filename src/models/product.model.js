'use strict'


const {model, Schema, Types} = require('mongoose')
const slugify = require('slugify')
const BrandService = require("../services/brand/brand.service");
const CategoryService = require("../services/category/category.service");
const {convertUnSelectToObject} = require("../utils");
const InventoryService = require("../services/inventory/inventory.service");

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

const productSchema = new Schema({
    product_code: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    product_name: {
        type: String,
        trim: true,
        maxLength: 150,
        required: true
    },
    product_description: {
        type: String,
        required: true
    },
    product_banner_image: {type: String, default: "https://via.placeholder.com/350"},
    product_images: [
        {type: String, default: "https://via.placeholder.com/150"}
    ],
    product_slug: String, // --> Quan-Jean-cao-cap
    product_price: {
        type: Number,
        required: true
    },
    product_discountPrice: {
        type: Number,
        default: function () {
            return this.product_price
        }
    },
    product_discountPercentage: {
        type: Number,
        select: true,
        default: 0
    },
    product_quantity: {
        type: Number,
        default: 0
    },
    product_type: {
        type: String,
        required: true,
        enum: ['general', 'bàn', 'ghế', 'tủ', 'đèn', 'gạch', 'thiết bị vệ sinh', 'others']
    },
    product_shopId: {type: Schema.Types.ObjectId, ref: 'Shop'},
    product_brand: {
        _id: {type: Schema.Types.ObjectId, ref: 'Brand'}, // Reference to the brand document
        brand_name: String, // Store the brand name denormalized
        brand_logoUrl: String, // Store the brand logo URL denormalized
    },
    product_categories: [
        {
            _id: {type: Schema.Types.ObjectId, ref: 'Category'}, // Reference to the brand document
            category_name: String, // Store the brand name denormalized
            category_logoUrl: String, // Store the brand logo URL denormalized
        }
    ],
    product_material: {
        type: Array,
        default: []
    },
    product_variations: {
        type: Array,
        default: []
    },
    product_height: {
        type: String,
    },
    product_width: {
        type: String,
    },
    product_length: {
        type: String,
    },
    product_size_unit: {
           type: ['cm', 'm', 'mm', 'inch'],
    },
    product_weight: {
        value: {type: String},
        unit: ['kg', 'g', 'mg'],
    },
    product_attributes: {type: Schema.Types.Mixed, required: true},
    product_isActive: {type: Boolean, default: true},
    isMarkedDelete: {type: Boolean, default: false},
    isDraft: {
        type: Boolean,
        default: true,
        index: true,
        select: true
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
        select: true
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})


// Create Index //
productSchema.index({product_name: 'text', product_description: 'text'});


// Document middleware: runs before .save() and .create()

productSchema.pre('save', async function (next) {
    this.product_slug = slugify(this.product_name, {lower: true});

    if (this.product_discountedPrice !== this.product_price) {
        this.product_discountPercentage = Math.round((this.product_discountedPrice / this.product_price) * 100)
    }
    if (this.product_discountPercentage !== 0) {
        this.product_discountPrice = Math.round(this.product_price * (100 - this.product_discountPercentage) / 100)
    }
    if (this.product_brand._id && (!this.product_brand.brand_name || !this.product_brand.brand_logoUrl)) {

        const foundBrand = await BrandService.findOneBrandById(this.product_brand._id);
        this.product_brand = {
            _id: foundBrand._id,
            brand_name: foundBrand.brand_name,
            brand_logoUrl: foundBrand.brand_logoUrl
        };
    }
    for (let i = 0; i < this.product_categories.length; i++) {
        const category = this.product_categories[i];

        if (category._id && (!category.category_logoUrl || !category.category_name)) {
            const {_id, category_name, category_logoUrl} = await CategoryService.findOneCategoryById(category._id);
            this.product_categories[i] = {_id, category_name, category_logoUrl};
        }
    }


    next();
});


const clothSchema = new Schema({
    brand: {type: String, required: true},
    size: String,
    material: String,
}, {
    collection: 'clothes',
    timestamps: true
})


const electronicSchema = new Schema({
    manufacturer: {type: String, required: true},
    model: String,
    color: String,
}, {
    collection: 'electronics',
    timestamps: true
})


module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronic', electronicSchema),
    cloth: model('Cloth', clothSchema),
}
