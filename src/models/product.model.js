'use strict'

const {model, Schema} = require('mongoose');

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

const productSchema = new Schema({
    product_name: {type: String, require: true},
    product_thumb: {type: String, require: true},
    product_description: String,
    product_price: {type: Number, required: true},
    product_quantity: {type: Number, required: true},
    product_type: {type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture']},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'},
    product_attributes: {type: Schema.Types.Mixed, required: true}
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})

//define the product  type = clothers
const clothingSchema = new Schema({
    brand: {type: String, required: true},
    size: String,
    material: String,

},{
    collection: 'clothes',
    timestamps: true
})

//define the product  type = clothers
const electronicSchema = new Schema({
    manufacturer: {type: String, required: true},
    model: String,
    color: String,

},{
    collection: 'electronics',
    timestamps: true
})

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronics', electronicSchema),
    clothing: model('Clothing', clothingSchema),
}