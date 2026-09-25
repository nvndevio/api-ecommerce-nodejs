'use strict'

const { DataTypes } = require('sequelize')
const sequelize = require('../dbs/init.mysql')

const cart = sequelize.define('Cart', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id') } },
    cart_state: {
        type: DataTypes.ENUM('active', 'completed', 'failed', 'pending'),
        allowNull: false,
        defaultValue: 'active',
    },
    cart_count_product: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    cart_userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, {
    tableName: 'carts',
    timestamps: true,
    createdAt: 'createdOn',
    updatedAt: 'modifiedOn',
})

const cartProduct = sequelize.define('CartProduct', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    cart_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    shopId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    name: { type: DataTypes.STRING(255), allowNull: false },
    price: { type: DataTypes.DOUBLE, allowNull: false },
}, {
    tableName: 'cart_products',
    timestamps: false,
})

cart.hasMany(cartProduct, { foreignKey: 'cart_id', as: 'cart_products', onDelete: 'CASCADE' })
cartProduct.belongsTo(cart, { foreignKey: 'cart_id' })

module.exports = {
    cart,
    cartProduct,
}
