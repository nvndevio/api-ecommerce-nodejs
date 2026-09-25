'use strict';

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
}

const readToken = (value) => {
    if (!value) return value
    const token = value.toString().trim().replace(/^["']|["']$/g, '')
    return token.toLowerCase().startsWith('bearer ') ? token.slice(7).trim() : token
}

const sameUser = (headerUserId, tokenUserId) => String(headerUserId) === String(tokenUserId)

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // accessToken
        const accessToken = await JWT.sign(payload, privateKey, {
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        // Verify với privateKey thay vì publicKey
        JWT.verify(accessToken, privateKey, (err, decode) => {
            if(err) {
                console.error(`error verify::`, err)
            } else {
                console.log(`decode verify::`, decode)
            }
        })

        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw error
    }
}

const authentication = asyncHandler( async ( req, res, next ) => {
    /**
     * 1 - check userId missing
     * 2 - get accessToken
     * 3 - verify accessToken
     * 4 - check user in dbs
     * 5 - check keyStore with userId
     * 6 - OK all => return next()
     */

    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('Invalid request')
    
    // 2
    const keyStore = await findByUserId(userId)
    if(!keyStore) throw new NotFoundError('Not found keyStore')

    // 3
    const accessToken = readToken(req.headers[HEADER.AUTHORIZATION])
    if(!accessToken) throw new AuthFailureError('Invalid request')
    
    try {
        const decode = JWT.verify(accessToken, keyStore.privateKey)
        if(!sameUser(userId, decode.userId)) throw new AuthFailureError('Invalid User')
        req.keyStore = keyStore
        return next()
    } catch (error) {
        if (error instanceof AuthFailureError) throw error
        throw new AuthFailureError('Token không hợp lệ, hãy login lại và dùng accessToken mới')
    }
})

const authenticationV2 = asyncHandler( async ( req, res, next ) => {
    /**
     * 1 - check userId missing
     * 2 - get accessToken
     * 3 - verify accessToken
     * 4 - check user in dbs
     * 5 - check keyStore with userId
     * 6 - OK all => return next()
     */

    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('Invalid request')
    
    // 2
    const keyStore = await findByUserId(userId)
    if(!keyStore) throw new NotFoundError('Not found keyStore')

    // 3
    const refreshHeader = readToken(req.headers[HEADER.REFRESHTOKEN])
    const accessHeader = readToken(req.headers[HEADER.AUTHORIZATION])
    const useRefreshToken = refreshHeader && (req.originalUrl.includes('handleRefreshToken') || !accessHeader)

    if(useRefreshToken) {
       try {
        const refreshToken = refreshHeader
        const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
        if(!sameUser(userId, decodeUser.userId)) throw new AuthFailureError('Invalid User')

        req.keyStore = keyStore
        req.user = decodeUser
        req.refreshToken = refreshToken
        return next()
       } catch (error) {
        if (error instanceof AuthFailureError) throw error
        throw new AuthFailureError('Token không hợp lệ, hãy login lại và dùng accessToken mới')
       }
    }
    const accessToken = accessHeader
    if(!accessToken) throw new AuthFailureError('Invalid request')
    
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.privateKey)
        if(!sameUser(userId, decodeUser.userId)) throw new AuthFailureError('Invalid User')
        req.keyStore = keyStore,
        req.user = decodeUser // {userId, email}
        return next()
    } catch (error) {
        if (error instanceof AuthFailureError) throw error
        throw new AuthFailureError('Token không hợp lệ, hãy login lại và dùng accessToken mới')
    }
})


const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2,
    verifyJWT
}