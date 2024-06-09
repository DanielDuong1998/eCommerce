'use strict'

const { NotFoundError } = require("../core/error.response");
const { cart } = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");

/*
    Key features: cart service:
    - Add product to cart [user]
    - Reduce product quantity by one [user]
    - increase product quantity by One [user]
    - get cart [user]
    - delete cart item [user]
*/

class CartService{

    /// start repo cart///
    static async createUserCart({userId, product}){
        const query = {cart_userId: userId, cart_state: 'active'},
        updateOrInsert = {
            $addToSet: {
                cart_products: product
            }
        }, options = {upsert: true, new: true};

        return await cart.findOneAndUpdate(query, updateOrInsert, options);
    }

    static async updateUserCartQuantity({userId, product}){
        const {productId, quantity} = product;
        const query = {
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active'}, updateSet = {
                $inc: {
                    'cart_products.$.quantity': quantity
                }
            }, options = {upsert: true, new: true};
            
        return await cart.findOneAndUpdate(query, updateSet, options);
    }
    /// end repo cart///

    static async addToCart({userId, product = {}}){
        console.log("product ne: ", product);
        //check cart is exist?
        const userCart = cart.findOne({cart_userId: userId});

        if(!userCart.cart_userId){
            //create cart for user
            return await CartService.createUserCart({userId, product});
        }

        // neu co gio hang roi nhung chua co san pham
        if(!userCart.cart_products.length){
            userCart.cart_products = [product];
            
            return await userCart.save();
        }

        return await CartService.updateUserCartQuantity({userId, product});
        // gio hang ton tai va co san pham nay thi update quantity
    }

    //update cart
    /*
        shop_order_ids: [
            {
                shopId,
                item_products: [
                    {
                        quantity,
                        price,
                        shopId,
                        old_quantity,
                        productId
                    }
                ],
                version
            }
        ]
    */
   static async addToCartV2({userId, shop_order_ids }){
        const {productId, quantity, old_quantity} = shop_order_ids[0]?.item_products[0];
        console.log("productId: ", productId);
        const foundProduct = await getProductById({productId});
        console.log("foundProduct ne: ", foundProduct);
        if(!foundProduct) throw new NotFoundError('Product not exist');

        if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId)
            throw new NotFoundError(`Product do not belong to the shop`);

        if(quantity === 0){
            //delete
        }

        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity
            }
        });
   }

   static async deleteUserCart({userId, productId}){
        const query = {cart_userId: userId, cart_state: 'active'},
        updateSet = {
            $pull: {
                cart_products: {
                    productId
                }
            }
        }

        const deleteCard = await cart.updateOne(query, updateSet);

        return this.deleteUserCart;
   }

   static async getListUserCart({userId}){
        return await cart.findOne({
            cart_userId: +userId
        }).lean();
   }

}

module.exports = CartService;