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
    cart_products: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
}, {
    tableName: 'carts',
    timestamps: true,
    createdAt: 'createdOn',
    updatedAt: 'modifiedOn',
})

module.exports = {
    cart,
}
