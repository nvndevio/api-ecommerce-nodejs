'use strict'

const { Sequelize } = require('sequelize')
const sequelize = require('../dbs/init.mysql')
const config = require('../configs/config.mysql')
const Shop = require('./shop.model')
const ApiKey = require('./apikey.model')
const { product } = require('./product.model')
require('./keytoken.model')
require('./inventory.model')
require('./discount.model')

product.belongsTo(Shop, { foreignKey: 'product_shop', targetKey: 'id' })

const connectMysql = async () => {
    const bootstrap = new Sequelize('', config.username, config.password, {
        host: config.host,
        port: config.port,
        dialect: 'mysql',
        logging: false,
    })

    await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`)
    await bootstrap.close()
    await sequelize.authenticate()
    await sequelize.sync()

    const keyCount = await ApiKey.count()
    if (keyCount === 0) {
        await ApiKey.create({
            key: 'dev-api-key',
            status: true,
            permissions: ['0000'],
        })
        console.log('Seeded API key for local use: dev-api-key')
    }

    console.log(`Connected MySQL Success (${config.database})`)
}

connectMysql().catch((err) => {
    console.log('Error Connect MySQL!', err.message)
    console.log('Set MYSQL_USER and MYSQL_PASSWORD in .env to the same account you use in Navicat, then restart.')
})

module.exports = sequelize
