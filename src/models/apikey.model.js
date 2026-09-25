'use strict'

const { DataTypes } = require('sequelize')
const sequelize = require('../dbs/init.mysql')

const ApiKey = sequelize.define('ApiKey', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    status: { type: DataTypes.BOOLEAN, defaultValue: true },
    permissions: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
}, {
    tableName: 'apikeys',
    timestamps: true,
})

module.exports = ApiKey
