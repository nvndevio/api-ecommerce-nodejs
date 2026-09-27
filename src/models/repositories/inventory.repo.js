const { Op } = require('sequelize')
const { inventory } = require('../inventory.model')

const insertInventory = async ({
    productId, shopId, stock, location = 'unKnow',
}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_shopId: shopId,
        inven_stock: stock,
        inven_location: location,
    })
}

const reserveInventory = async ({
    productId, quantity, cartId,
}) => {
    return await inventory.sequelize.transaction(async (transaction) => {
        const found = await inventory.findOne({
            where: {
                inven_productId: productId,
                inven_stock: { [Op.gte]: quantity },
            },
            lock: transaction.LOCK.UPDATE,
            transaction,
        })
        if (!found) return null

        const reservations = Array.isArray(found.inven_reservations) ? found.inven_reservations : []
        reservations.push({
            quantity,
            cartId,
            createOn: new Date(),
        })

        await found.update({
            inven_stock: found.inven_stock - quantity,
            inven_reservations: reservations,
        }, { transaction })

        return found
    })
}

module.exports = {
    insertInventory,
    reserveInventory,
}
