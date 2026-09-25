'use strict'

const express = require('express')
const router = express.Router()
const cartController = require('../../controllers/cart.controller')
const { asyncHandler } = require('../../auth/checkAuth')

router.post('', asyncHandler(cartController.addToCart))
router.post('/update', asyncHandler(cartController.update))
router.delete('', asyncHandler(cartController.delete))
router.get('', asyncHandler(cartController.listToCart))

module.exports = router
