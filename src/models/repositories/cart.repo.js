'use strict'

const { cart } = require('../cart.model')

const findCartById = async ({ cartId }) => {
    const row = await cart.findOne({
        where: { id: cartId, cart_state: 'active' },
    })
    if (!row) return null
    const plain = row.get({ plain: true })
    plain._id = plain.id
    if (!Array.isArray(plain.cart_products)) plain.cart_products = []
    return plain
}

module.exports = {
    findCartById,
}
