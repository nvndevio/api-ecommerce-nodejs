'use strict'

const { DataTypes } = require('sequelize')
const sequelize = require('../dbs/init.mysql')

const inventory = sequelize.define('Inventory', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    inven_productId: { type: DataTypes.INTEGER.UNSIGNED },
    inven_location: { type: DataTypes.STRING(255), defaultValue: 'unKnow' },
    inven_stock: { type: DataTypes.INTEGER, allowNull: false },
    inven_shopId: { type: DataTypes.INTEGER.UNSIGNED },
    inven_reservations: { type: DataTypes.JSON, defaultValue: [] },
}, {
    tableName: 'inventories',
    timestamps: true,
})

module.exports = { inventory }
