'use strict'

const { product, clothing, electronic, furniture } = require('../models/product.model')
const { BadRequestError } = require('../core/error.response')

// define Facetory class to create product
class ProductFactory {
    /*
        type: 'Clothing' | 'Electronic'
        payload
    */
    static async createProduct(type, payload) {
        switch (type) {
            case 'Clothing':
                return new Clothing(payload).createProduct()
            case 'Electronic':
                return new Electronic(payload).createProduct()
            case 'Furniture':
                return new Furniture(payload).createProduct()
            default:
                throw new BadRequestError(`Invalid product type: ${type}`)
        }
    }
}

// define base product class
class Product {
    constructor({ product_name, product_thumb, product_description, product_price, product_quantity, product_type, product_shop, product_attributes }) {
        this.product_name = product_name
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
        this.product_thumb = product_thumb
        this.product_description = product_description
    }

    // create new product
    async createProduct() {
        const newProduct = await product.create({ ...this })
        return newProduct
    }
}

class Clothing extends Product {
    async createProduct() {
        const newProduct = await super.createProduct()
        if (!newProduct) throw new BadRequestError('Create new product error')
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
            product_id: newProduct.id,
        })
        if (!newClothing) throw new BadRequestError('Create new clothing error')
        return newProduct
    }
}

class Electronic extends Product {
    async createProduct() {
        const newProduct = await super.createProduct()
        if (!newProduct) throw new BadRequestError('Create new product error')
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
            product_id: newProduct.id,
        })
        if (!newElectronic) throw new BadRequestError('Create new electronic error')
        return newProduct
    }
}

class Furniture extends Product {
    async createProduct() {
        const newProduct = await super.createProduct()
        if (!newProduct) throw new BadRequestError('Create new product error')
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
            product_id: newProduct.id,
        })
        if (!newFurniture) throw new BadRequestError('Create new furniture error')
        return newProduct
    }
}

module.exports = ProductFactory;