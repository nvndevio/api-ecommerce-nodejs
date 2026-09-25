'use strict'

const { DataTypes } = require('sequelize')
const sequelize = require('../dbs/init.mysql')

const Shop = sequelize.define('Shop', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id') } },
    name: { type: DataTypes.STRING(150) },
    email: { type: DataTypes.STRING(255), unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'inactive' },
    verify: { type: DataTypes.BOOLEAN, defaultValue: false },
    roles: { type: DataTypes.JSON, defaultValue: [] },
}, {
    tableName: 'shops',
    timestamps: true,
})

module.exports = Shop
