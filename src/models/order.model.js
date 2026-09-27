'use strict'

const { DataTypes } = require('sequelize')
const sequelize = require('../dbs/init.mysql')

const order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id') } },
    order_userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    order_checkout: { type: DataTypes.JSON, defaultValue: {} },
    order_shipping: { type: DataTypes.JSON, defaultValue: {} },
    order_payment: { type: DataTypes.JSON, defaultValue: {} },
    order_products: { type: DataTypes.JSON, allowNull: false },
    order_trackingNumber: { type: DataTypes.STRING(50), defaultValue: '#0000118052022' },
    order_status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'cancelled', 'delivered'),
        allowNull: false,
        defaultValue: 'pending',
    },
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'createdOn',
    updatedAt: 'modifiedOn',
})

module.exports = {
    order,
}
