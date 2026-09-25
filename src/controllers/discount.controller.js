'use strict'


const DiscountService = require('../services/discount.service')
const { SuccessResponse } = require('../core/success.response')


class DiscountController {

    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create discount code success',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }

    // get list discount code
    getAllDiscountCodes = async (req, res, next) => {
        new SuccessResponse({
            message: "Successful Code Found",
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getAllDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: "Successful Code Found",
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
            })
        }).send(res)
    }

    getAllDiscountCodesWithProducts = async (req, res, next) => {
        new SuccessResponse({
            message: "Successful Code Found",
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query,
                ...req.body,
            })
        }).send(res)
    }

    deleteDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete discount code success',
            metadata: await DiscountService.deleteDiscountCode({
                codeId: req.params.code,
                shopId: req.user.userId,
            })
        }).send(res)
    }

    cancelDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Cancel discount code success',
            metadata: await DiscountService.cancelDiscountCode({
                ...req.body,
                shopId: req.body.shopId || req.user.userId,
                userId: req.body.userId || req.user.userId,
            })
        }).send(res)
    }

}

module.exports = new DiscountController()