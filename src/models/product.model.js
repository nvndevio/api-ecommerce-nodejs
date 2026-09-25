'use strict'

const { DataTypes } = require('sequelize')
const slugify = require('slugify')
const sequelize = require('../dbs/init.mysql')

const idField = {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    _id: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('id') } },
}

const product = sequelize.define('Product', {
    ...idField,
    product_name: { type: DataTypes.STRING(255), allowNull: false },
    product_thumb: { type: DataTypes.STRING(255), allowNull: false },
    product_description: { type: DataTypes.TEXT },
    product_slug: { type: DataTypes.STRING(255) },
    product_price: { type: DataTypes.DOUBLE, allowNull: false },
    product_quantity: { type: DataTypes.INTEGER, allowNull: false },
    product_type: { type: DataTypes.STRING(50), allowNull: false },
    product_shop: { type: DataTypes.INTEGER.UNSIGNED },
    product_attributes: { type: DataTypes.JSON, allowNull: false },
    product_ratingsAverage: { type: DataTypes.DOUBLE, defaultValue: 4.5 },
    product_variations: { type: DataTypes.JSON, defaultValue: [] },
    isDraft: { type: DataTypes.BOOLEAN, defaultValue: true },
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    tableName: 'products',
    timestamps: true,
    hooks: {
        beforeValidate(row) {
            if (row.product_name) {
                row.product_slug = slugify(row.product_name, { lower: true })
            }
        },
    },
})

const clothing = sequelize.define('Clothing', {
    ...idField,
    brand: { type: DataTypes.STRING(255), allowNull: false },
    size: { type: DataTypes.STRING(50) },
    material: { type: DataTypes.STRING(255) },
    product_shop: { type: DataTypes.INTEGER.UNSIGNED },
    product_id: { type: DataTypes.INTEGER.UNSIGNED },
}, {
    tableName: 'clothes',
    timestamps: true,
})

const electronic = sequelize.define('Electronic', {
    ...idField,
    manufacturer: { type: DataTypes.STRING(255), allowNull: false },
    model: { type: DataTypes.STRING(255) },
    color: { type: DataTypes.STRING(50) },
    product_shop: { type: DataTypes.INTEGER.UNSIGNED },
    product_id: { type: DataTypes.INTEGER.UNSIGNED },
}, {
    tableName: 'electronics',
    timestamps: true,
})

const furniture = sequelize.define('Furniture', {
    ...idField,
    brand: { type: DataTypes.STRING(255), allowNull: false },
    size: { type: DataTypes.STRING(50) },
    material: { type: DataTypes.STRING(255) },
    product_shop: { type: DataTypes.INTEGER.UNSIGNED },
    product_id: { type: DataTypes.INTEGER.UNSIGNED },
}, {
    tableName: 'furniture',
    timestamps: true,
})

module.exports = { product, clothing, electronic, furniture }
