'use strict'

const { DataTypes } = require('sequelize')
const sequelize = require('../dbs/init.mysql')

const Discount = sequelize.define('Discount', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id') } },
    discount_name: { type: DataTypes.STRING(255), allowNull: false },
    discount_description: { type: DataTypes.TEXT, allowNull: false },
    discount_type: { type: DataTypes.STRING(50), defaultValue: 'fixed_amount' },
    discount_value: { type: DataTypes.DOUBLE, allowNull: false },
    discount_code: { type: DataTypes.STRING(100), allowNull: false },
    discount_start_date: { type: DataTypes.DATE, allowNull: false },
    discount_end_date: { type: DataTypes.DATE, allowNull: false },
    discount_max_uses: { type: DataTypes.INTEGER, allowNull: false },
    discount_uses_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    discount_users_used: { type: DataTypes.JSON, defaultValue: [] },
    discount_max_uses_per_user: { type: DataTypes.INTEGER, allowNull: false },
    discount_min_order_value: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
    discount_max_value: { type: DataTypes.DOUBLE },
    discount_shopId: { type: DataTypes.INTEGER.UNSIGNED },
    discount_is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    discount_applies_to: { type: DataTypes.ENUM('all', 'specific'), allowNull: false },
    discount_product_ids: { type: DataTypes.JSON, defaultValue: [] },
}, {
    tableName: 'discounts',
    timestamps: true,
})

module.exports = Discount
