'use strict'

/*
 key features:
 - add product to cart
 - reduce product quantity by one [user]
 - increase product quantity by one [user]
 - get cart [user]
 - delete cart [user]
 - delete cart item [user]
*/

const {
    NotFoundError,
    BadRequestError
} = require('../core/error.response')

const { cart } = require('../models/cart.model')
const { getProductById } = require('../models/repositories/product.repo')

const productsOf = (userCart) => {
    const items = userCart.get('cart_products')
    return Array.isArray(items) ? items : []
}

const toPlain = (row) => {
    if (!row) return null
    const plain = row.get({ plain: true })
    plain._id = plain.id
    if (!Array.isArray(plain.cart_products)) plain.cart_products = []
    return plain
}

const findActiveCart = (userId) => {
    return cart.findOne({
        where: { cart_userId: userId, cart_state: 'active' },
    })
}

const saveProducts = async (userCart, items) => {
    const count = items.reduce((total, item) => total + Number(item.quantity || 0), 0)
    await userCart.update({
        cart_products: items,
        cart_count_product: count,
    })
}

class CartService {
    static async createUserCart({ userId, product }) {
        await cart.create({
            cart_userId: userId,
            cart_state: 'active',
            cart_count_product: product.quantity || 1,
            cart_products: [{
                productId: product.productId,
                shopId: product.shopId,
                quantity: product.quantity || 1,
                name: product.name,
                price: product.price,
            }],
        })
        return this.getListUserCart({ userId })
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product
        const userCart = await findActiveCart(userId)
        if (!userCart) throw new NotFoundError('Cart not found')

        const items = productsOf(userCart)
        const index = items.findIndex((row) => String(row.productId) === String(productId))
        if (index < 0) throw new NotFoundError('Product not found in cart')

        const nextQuantity = items[index].quantity + quantity
        const nextItems = items.filter((_, i) => i !== index)
        if (nextQuantity > 0) {
            nextItems.splice(index, 0, { ...items[index], quantity: nextQuantity })
        }

        await saveProducts(userCart, nextItems)
        return this.getListUserCart({ userId })
    }

    static async addToCart({ userId, product = {} }) {
        const userCart = await findActiveCart(userId)
        if (!userCart) {
            return await this.createUserCart({ userId, product })
        }

        const items = productsOf(userCart)
        const existed = items.find((row) => String(row.productId) === String(product.productId))
        if (!existed) {
            await saveProducts(userCart, [...items, {
                productId: product.productId,
                shopId: product.shopId,
                quantity: product.quantity || 1,
                name: product.name,
                price: product.price,
            }])
            return this.getListUserCart({ userId })
        }

        return await this.updateUserCartQuantity({ userId, product })
    }

    static async addToCartV2({ userId, shop_order_ids = [] }) {
        const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0] || {}
        const foundProduct = await getProductById({ productId })
        if (!foundProduct) {
            throw new NotFoundError('Product not found')
        }

        if (String(foundProduct.product_shop) !== String(shop_order_ids[0].shop_id)) {
            throw new BadRequestError('Product does not belong to this shop')
        }

        if (quantity === 0) {
            return await this.deleteUserCart({ userId, productId })
        }

        return await this.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity,
            }
        })
    }

    static async deleteUserCart({ userId, productId }) {
        const userCart = await findActiveCart(userId)
        if (!userCart) throw new NotFoundError('Cart not found')

        const items = productsOf(userCart)
        const nextItems = items.filter((row) => String(row.productId) !== String(productId))
        await saveProducts(userCart, nextItems)
        return items.length - nextItems.length
    }

    static async getListUserCart({ userId }) {
        const row = await cart.findOne({
            where: { cart_userId: Number(userId) },
        })
        return toPlain(row)
    }
}

module.exports = CartService
