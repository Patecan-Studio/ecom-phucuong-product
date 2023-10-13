const cart = require("../models/cart.model");
const {convertSelectToObject, convertUnSelectToObject, convertStringIdToObjectId} = require("../utils");
const {NotFoundError} = require("../common/response/error.response");


findOneCartById = async (cartId) => {
    const foundCart = await cart.findOne({_id: convertStringIdToObjectId(cartId), cart_state: 'active'}).lean();
    if (!foundCart) {
        throw new NotFoundError("Cart not found");
    }
    return foundCart;
}









createUserCart = async ({userId, product}) => {
    const query = {
        cart_userId: userId,
        cart_state: 'active'
    }

    const updateOrInsert = {
        $addToSet: {
            cart_products: product
        }
    }, options = {upsert: true, new: true}


    const userCart = await cart.findOneAndUpdate(query, updateOrInsert, options).lean();
    return userCart;
}

pushProductToUserCart = async ({userId, userCart, product}) => {


    /**
     * @RULE-1: Giỏ hàng empty
     */
    if (userCart.cart_products.length === 0) {
        userCart.cart_products = [product]
        return cart.updateOne({cart_userId: userId}, userCart);
    } else if(userCart.cart_products.length > 0) {

        /**
         * @RULE-2: Giỏ hàng có sản phẩm
         */
        const isThisProductExist = await cart.findOne({
            cart_userId: userId,
            "cart_products.productId": product.productId.toString(),
            cart_state: 'active'
        });

        if(isThisProductExist) {
            /**
             * @RULE-2-1: Sản phẩm đã tồn tại trong giỏ hàng
             */
            return await updateExistedProductQuantityInCart({userId, product});
        } else {
            /**
             * @RULE-2-2: Sản phẩm mới thêm vào giỏ hàng
             */
            return cart.updateOne({cart_userId: userId}, {$push: {cart_products: product}});
        }
    } else {
        return null;
    }
}

updateExistedProductQuantityInCart = async ({userId, product}) => {
    const {productId, quantity} = product;

    const query = {
        cart_userId: userId,
        "cart_products.productId": productId,
        cart_state: 'active'
    },  updateSet = {
        $inc: {
            'cart_products.$.quantity': quantity
        }
    }, options= { upsert: true, new: true}

    return cart.findOneAndUpdate(query, updateSet, options);
}


deleteProductInUserCart = async ({userId, productId}) => {

    const query = {
        cart_userId: userId,
        cart_state: 'active'
    }

    const update = {
        $pull: {
            cart_products: {
                productId
            }
        }
    }

    const deletedCart = await cart.updateOne(query, update);
    return deletedCart;


}

getListProductCart = async ({userId}) => {
    return cart.findOne({
        cart_userId: userId,
    }).lean();
}


module.exports = {
    createUserCart,
    updateExistedProductQuantityInCart,
    deleteProductInUserCart,
    getListProductCart,
    pushProductToUserCart,
    findOneCartById
}
