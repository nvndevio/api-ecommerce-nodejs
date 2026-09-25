'use strict'

const { Op } = require('sequelize')
const Shop = require('../../models/shop.model')
const { product, clothing, electronic, furniture } = require('../../models/product.model')

const childModels = new Set([clothing, electronic, furniture])

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
        } else {
            where[column] = value
        }
    })
    return where
}

const onlyColumns = (model, data) => {
    const allowed = new Set(Object.keys(model.rawAttributes))
    return Object.fromEntries(Object.entries(data).filter(([key]) => allowed.has(key) && key !== 'id' && key !== '_id'))
}

const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const findAllPublishForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const searchProductByUser = async ({ keySearch }) => {
    const rows = await product.findAll({
        where: {
            isPublished: true,
            [Op.or]: [
                { product_name: { [Op.like]: `%${keySearch}%` } },
                { product_description: { [Op.like]: `%${keySearch}%` } },
            ],
        },
    })
    return rows.map(toPlain)
}

const publishProductByShop = async ({ product_shop, product_id }) => {
    const [count] = await product.update(
        { isDraft: false, isPublished: true },
        { where: { product_shop, id: product_id } }
    )
    return count
}

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const [count] = await product.update(
        { isDraft: true, isPublished: false },
        { where: { product_shop, id: product_id } }
    )
    return count
}

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit
    const order = sort === 'ctime' ? [['id', 'DESC']] : [['id', 'ASC']]
    const attributes = (select || []).filter((field) => product.rawAttributes[field])
    const rows = await product.findAll({
        where: toWhere(filter),
        order,
        offset: skip,
        limit: Number(limit),
        attributes: attributes.length ? attributes : undefined,
    })
    return rows.map(toPlain)
}

const findProduct = async ({ product_id }) => {
    const row = await product.findByPk(product_id)
    return toPlain(row)
}

const updateProductById = async ({ productId, bodyUpdate, model }) => {
    const data = onlyColumns(model, bodyUpdate)
    const where = childModels.has(model) ? { product_id: productId } : { id: productId }
    await model.update(data, { where })
    const row = await model.findOne({ where })
    return toPlain(row)
}

const queryProduct = async ({ query, limit, skip }) => {
    const rows = await product.findAll({
        where: toWhere(query),
        include: [{ model: Shop, attributes: ['name', 'email'] }],
        order: [['updatedAt', 'DESC']],
        offset: Number(skip) || 0,
        limit: Number(limit) || 50,
    })
    return rows.map((row) => {
        const plain = toPlain(row)
        if (plain.Shop) {
            plain.product_shop = { name: plain.Shop.name, email: plain.Shop.email }
            delete plain.Shop
        }
        return plain
    })
}

const getProductById = async ({ productId }) => {
    const row = await product.findByPk(productId)
    if (!row) return null
    const plain = row.get({ plain: true })
    plain._id = plain.id
    return plain
}

const checkProductByServer = async (products) => {
    return await Promise.all(products.map(async product => {
        const foundProduct = await getProductById({ productId: product.productId })
        if (foundProduct) {
            return {
                price: foundProduct.product_price,
                quantity: product.quantity,
                productId: product.productId,
            }
        }
    }))
}

module.exports = {
    findAllDraftsForShop,
    findAllPublishForShop,
    publishProductByShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
    checkProductByServer,
}
