require('dotenv').config();
const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./configs/swagger');
const app = express();

// init middlewares
app.use(morgan("dev"))
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true,
}))

app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
        persistAuthorization: true,
        preauthorizeApiKey: {
            authDefinitionKey: 'ApiKeyAuth',
            apiKeyValue: 'dev-api-key',
        },
        responseInterceptor: (res) => {
            try {
                const url = res.url || ''
                const isAuth = url.includes('/shop/login') || url.includes('/shop/signup') || url.includes('/shop/handleRefreshToken')
                if (!isAuth || !window.ui) return res

                const raw = res.text || res.data || res.body || res.obj
                const body = typeof raw === 'string' ? JSON.parse(raw) : raw
                const metadata = body && body.metadata && body.metadata.metadata
                    ? body.metadata.metadata
                    : body && body.metadata
                if (!metadata) return res

                const shopId = metadata.shop && (metadata.shop._id || metadata.shop.id)
                const userId = metadata.user && (metadata.user.userId || metadata.user._id)
                const tokens = metadata.tokens || {}

                if (shopId != null) window.ui.preauthorizeApiKey('ClientId', String(shopId))
                if (userId != null) window.ui.preauthorizeApiKey('ClientId', String(userId))
                if (tokens.accessToken) window.ui.preauthorizeApiKey('AccessToken', tokens.accessToken)
                if (tokens.refreshToken) window.ui.preauthorizeApiKey('RefreshToken', tokens.refreshToken)
            } catch (error) {}
            return res
        },
    },
}))

// init db
require('./models')
// const { countConnect, checkOverload } = require('./helpers/check.connect');
// countConnect()
// checkOverload()

// init routes
app.use('', require('./routes'))

// handling error
app.use(( req, res, next ) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        // stack: error.stack,
        message: error.message || 'Internal Server Error'
    })
})

module.exports = app