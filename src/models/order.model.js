'use strict'

const {model, Schema} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'Orders';

// Declare the Schema of the Mongo model
var orderSchema = new Schema({
    order_userId: {type: Number, required: true},
    order_checkout: {type: Object, default: {}},
    /*
        order_checkout = {
            totalPrice,
            totalApllyDiscount,
            feeShip
        }
    */
   order_shipping: {type: Object, default: {}},
   /*
        order_shipping = {
            street,
            city,
            state,
            country
        }
   */
    order_payment: {type: Object, default: {}},
    order_products: {type: Array, require: true},
    order_trackingNumber: {type: String, default: '#0000118052022'},
    order_status: {type: String, enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'], default: 'pending'},
}, {
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
    collection: COLLECTION_NAME
});

//Export the model
module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema)
}