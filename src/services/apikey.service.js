'use strict'

const apikeyModel = require('../models/apikey.model')

const findById = async (key) => {
    const row = await apikeyModel.findOne({ where: { key, status: true } })
    if (!row) return null
    const plain = row.get({ plain: true })
    plain.permissions = plain.permissions || []
    return plain
}

module.exports = {
    findById,
}
