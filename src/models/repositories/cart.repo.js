'use strict'

const { cart, cartProduct } = require('../cart.model')

const findCartById = async ({ cartId }) => {
    const row = await cart.findOne({
        where: { id: cartId, cart_state: 'active' },
        include: [{ model: cartProduct, as: 'cart_products' }],
    })
    if (!row) return null
    const plain = row.get({ plain: true })
    plain._id = plain.id
    return plain
}

module.exports = {
    findCartById,
}
