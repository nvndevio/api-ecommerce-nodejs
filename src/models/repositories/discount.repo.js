'use strict'

const { Op } = require('sequelize')

const toPlain = (row) => {
    if (!row) return null
    const plain = row.get({ plain: true })
    plain._id = plain.id
    return plain
}

const toWhere = (filter = {}) => {
    const where = {}
    Object.entries(filter).forEach(([key, value]) => {
        const column = key === '_id' ? 'id' : key
        if (value && typeof value === 'object' && Array.isArray(value.$in)) {
            where[column] = { [Op.in]: value.$in }
        } else if (value !== undefined) {
            where[column] = value
        }
    })
    return where
}

const attributesOf = (model, fields) => {
    if (!fields) return undefined
    const picked = fields.filter((field) => model.rawAttributes[field] || field === '_id')
    return picked.length ? picked.map((field) => (field === '_id' ? 'id' : field)) : undefined
}

const findAllDiscountCodesUnSelect = async ({
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter,
    unSelect,
    model,
}) => {
    const skip = (page - 1) * limit
    const order = sort === 'ctime' ? [['id', 'DESC']] : [['id', 'ASC']]
    const exclude = (unSelect || []).filter((field) => model.rawAttributes[field])
    const rows = await model.findAll({
        where: toWhere(filter),
        order,
        offset: skip,
        limit: Number(limit),
        attributes: exclude.length ? { exclude } : undefined,
    })
    return rows.map(toPlain)
}

const findAllDiscountCodesSelect = async ({
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter,
    select,
    model,
}) => {
    const skip = (page - 1) * limit
    const order = sort === 'ctime' ? [['id', 'DESC']] : [['id', 'ASC']]
    const rows = await model.findAll({
        where: toWhere(filter),
        order,
        offset: skip,
        limit: Number(limit),
        attributes: attributesOf(model, select),
    })
    return rows.map(toPlain)
}

const checkDiscountExists = async ({ model, filter }) => {
    const row = await model.findOne({ where: toWhere(filter) })
    return toPlain(row)
}

module.exports = {
    findAllDiscountCodesUnSelect,
    findAllDiscountCodesSelect,
    checkDiscountExists,
}
