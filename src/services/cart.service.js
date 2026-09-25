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

const { cart, cartProduct } = require('../models/cart.model')
const { getProductById } = require('../models/repositories/product.repo')

const toPlain = (row) => {
    if (!row) return null
    const plain = row.get({ plain: true })
    plain._id = plain.id
    return plain
}

const findActiveCart = (userId) => {
    return cart.findOne({
        where: { cart_userId: userId, cart_state: 'active' },
        include: [{ model: cartProduct, as: 'cart_products' }],
    })
}

const refreshCount = async (userCart) => {
    const items = await cartProduct.findAll({ where: { cart_id: userCart.id } })
    const count = items.reduce((total, item) => total + item.quantity, 0)
    await userCart.update({ cart_count_product: count })
}

class CartService {
    static async createUserCart({ userId, product }) {
        const userCart = await cart.create({
            cart_userId: userId,
            cart_state: 'active',
            cart_count_product: product.quantity || 1,
        })
        await cartProduct.create({
            cart_id: userCart.id,
            productId: product.productId,
            shopId: product.shopId,
            quantity: product.quantity || 1,
            name: product.name,
            price: product.price,
        })
        return this.getListUserCart({ userId })
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product
        const userCart = await findActiveCart(userId)
        if (!userCart) throw new NotFoundError('Cart not found')

        const item = userCart.cart_products.find((row) => String(row.productId) === String(productId))
        if (!item) throw new NotFoundError('Product not found in cart')

        const nextQuantity = item.quantity + quantity
        if (nextQuantity <= 0) await item.destroy()
        else await item.update({ quantity: nextQuantity })

        await refreshCount(userCart)
        return this.getListUserCart({ userId })
    }

    static async addToCart({ userId, product = {} }) {
        const userCart = await findActiveCart(userId)
        if (!userCart) {
            return await this.createUserCart({ userId, product })
        }

        const existed = userCart.cart_products.find((row) => String(row.productId) === String(product.productId))
        if (!existed) {
            await cartProduct.create({
                cart_id: userCart.id,
                productId: product.productId,
                shopId: product.shopId,
                quantity: product.quantity || 1,
                name: product.name,
                price: product.price,
            })
            await refreshCount(userCart)
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

        const deleted = await cartProduct.destroy({
            where: { cart_id: userCart.id, productId },
        })
        await refreshCount(userCart)
        return deleted
    }

    static async getListUserCart({ userId }) {
        const row = await cart.findOne({
            where: { cart_userId: Number(userId) },
            include: [{ model: cartProduct, as: 'cart_products' }],
        })
        return toPlain(row)
    }
}

module.exports = CartService
