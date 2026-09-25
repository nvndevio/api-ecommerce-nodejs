'use strict'

require('dotenv').config()

const bcrypt = require('bcrypt')
const sequelize = require('../dbs/init.mysql')
const Shop = require('../models/shop.model')
const ApiKey = require('../models/apikey.model')

const TEST_SHOP = {
    name: 'Shop Test',
    email: 'shop@example.com',
    password: '123456',
    status: 'active',
    verify: true,
    roles: ['SHOP'],
}

const TEST_API_KEY = 'dev-api-key'

const seed = async () => {
    await sequelize.authenticate()
    await sequelize.sync()

    const [apiKey, apiKeyCreated] = await ApiKey.findOrCreate({
        where: { key: TEST_API_KEY },
        defaults: {
            key: TEST_API_KEY,
            status: true,
            permissions: ['0000'],
        },
    })
    if (!apiKey.status) {
        await apiKey.update({ status: true, permissions: ['0000'] })
    }

    const passwordHash = await bcrypt.hash(TEST_SHOP.password, 10)
    const [shop, shopCreated] = await Shop.findOrCreate({
        where: { email: TEST_SHOP.email },
        defaults: {
            ...TEST_SHOP,
            password: passwordHash,
        },
    })

    console.log(apiKeyCreated ? 'Created API key' : 'API key already exists')
    console.log(shopCreated ? 'Created test shop' : 'Test shop already exists')
    console.log('---')
    console.log('x-api-key:', TEST_API_KEY)
    console.log('email:', shop.email)
    console.log('password:', TEST_SHOP.password)
    console.log('shop id:', shop.id)
}

seed()
    .then(() => sequelize.close())
    .catch(async (error) => {
        console.error('Seed failed:', error.message)
        await sequelize.close()
        process.exit(1)
    })
