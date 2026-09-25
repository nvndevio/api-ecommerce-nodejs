'use strict'

const sequelize = require('../dbs/init.mysql')
const keyTokenModel = require('../models/keytoken.model')

const toPlain = (row) => {
    if (!row) return null
    const plain = row.get({ plain: true })
    plain._id = plain.id
    plain.refreshTokensUsed = plain.refreshTokensUsed || []
    return plain
}

class keyTokenService {

    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            let tokens = await keyTokenModel.findOne({ where: { user: userId } })
            if (tokens) {
                await tokens.update({
                    publicKey,
                    privateKey,
                    refreshTokensUsed: [],
                    refreshToken: refreshToken || tokens.refreshToken,
                })
            } else {
                tokens = await keyTokenModel.create({
                    user: userId,
                    publicKey,
                    privateKey,
                    refreshTokensUsed: [],
                    refreshToken: refreshToken || null,
                })
            }
            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }

    static findByUserId = async (userId) => {
        const row = await keyTokenModel.findOne({ where: { user: userId } })
        return toPlain(row)
    }

    static removeKeyById = async (id) => {
        return await keyTokenModel.destroy({ where: { id } })
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        const row = await keyTokenModel.findOne({
            where: sequelize.where(
                sequelize.fn('JSON_CONTAINS', sequelize.col('refreshTokensUsed'), JSON.stringify(refreshToken)),
                1
            ),
        })
        return toPlain(row)
    }

    static findByRefreshToken = async (refreshToken) => {
        const row = await keyTokenModel.findOne({ where: { refreshToken } })
        return toPlain(row)
    }

    static deleteKeyById = async (userId) => {
        return await keyTokenModel.destroy({ where: { user: userId } })
    }

    static rotateRefreshToken = async ({ id, refreshToken, usedToken }) => {
        const row = await keyTokenModel.findByPk(id)
        if (!row) return null
        const used = Array.isArray(row.refreshTokensUsed) ? row.refreshTokensUsed : []
        if (usedToken && !used.includes(usedToken)) used.push(usedToken)
        await row.update({
            refreshToken,
            refreshTokensUsed: used,
        })
        return toPlain(row)
    }
}

module.exports = keyTokenService
