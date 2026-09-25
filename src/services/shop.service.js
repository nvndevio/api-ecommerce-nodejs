'use strict'

const shopModel = require('../models/shop.model')

const findByEmail = async ({ email }) => {
    const row = await shopModel.findOne({ where: { email } })
    if (!row) return null
    const plain = row.get({ plain: true })
    plain._id = plain.id
    return plain
}

module.exports = {
    findByEmail,
}
