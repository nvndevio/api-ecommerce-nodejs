'use strict'

const { BadRequestError } = require('../core/error.response')
const { inventory } = require('../models/inventory.model')
const { getProductById } = require('../models/repositories/product.repo')

class InventoryService {
    static async addStockToInventory({
        stock,
        productId,
        shopId,
        location = '15 Tran Van Tuyen, Q9, TP.HCM',
    }) {
        const product = await getProductById({ productId })
        if (!product) {
            throw new BadRequestError('The product does not exist!')
        }

        if (String(product.product_shop) !== String(shopId)) {
            throw new BadRequestError('Product does not belong to this shop')
        }

        const [row, created] = await inventory.findOrCreate({
            where: {
                inven_productId: productId,
                inven_shopId: shopId,
            },
            defaults: {
                inven_stock: Number(stock),
                inven_location: location,
                inven_reservations: [],
            },
        })

        if (!created) {
            await row.increment('inven_stock', { by: Number(stock) })
            await row.update({ inven_location: location })
            await row.reload()
        }

        const plain = row.get({ plain: true })
        plain._id = plain.id
        return plain
    }
}

module.exports = InventoryService
