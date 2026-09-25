'use strict'

const { DataTypes } = require('sequelize')
const sequelize = require('../dbs/init.mysql')

const KeyToken = sequelize.define('KeyToken', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id') } },
    user: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    privateKey: { type: DataTypes.TEXT, allowNull: false },
    publicKey: { type: DataTypes.TEXT, allowNull: false },
    refreshTokensUsed: { type: DataTypes.JSON, defaultValue: [] },
    refreshToken: { type: DataTypes.TEXT, allowNull: true },
}, {
    tableName: 'keys',
    timestamps: true,
})

module.exports = KeyToken
