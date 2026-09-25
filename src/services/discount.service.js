'use strict';

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')

const { convertToObjectIdMongodb } = require('../utils')
const discount = require('../models/discount.model');
const { 
    findAllDiscountCodesUnSelect,
    findAllDiscountCodesSelect,
    checkDiscountExists 
} = require('../models/repositories/discount.repo');

const { filter } = require('lodash');

/*
    Discount Service
    1 - Generate a discount code [Shop | Admin]
    2 - Get discount amount [User]
    3 - Get all discount code [User | Shop]
    4 - Verify discount code [User]
    5 - Delete discount code [Shop | Admin]
    6 - Cancel discount code [User]
*/ 

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code, start_date, end_date, is_active, users_used,
            shopId, min_order_value, product_ids, applies_to, name, description,
            type, value, max_value, max_uses, uses_count, max_uses_per_user
        } = payload
        // Kiểm tra
        // if(new Date() < new Date(start_date) ||  new Date() > new Date(end_date)) {
        //     throw new BadRequestError('Discount code has expried!')
        // }

s
        if(new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError('Start date must be before end date')
        }

        // create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb
        })
        if(foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount code already exists!')
        }

        const newDiscount = await discount.create({
            discount_name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids
        })
        return newDiscount
    }

    static async updateDiscountCode() {

    }

    // Get all discount codes available with product
    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit, page
    }) {
        // create index for  discount_code 
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()

        if(!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError('discount not exists!')
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount
        
        if(discount_applies_to === 'all') {
            // get all product
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name'],
            })
        }

        if(discount_applies_to === 'specific') {
            //get product ids 
            products = await findAllProducts({
                filter: {
                    isPublished: true,
                    _id: { $in: discount_product_ids }
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name'],
            })
        }

        return products
    }

    /*
    Get all discount codes of shop
    */
    static async getAllDiscountCodesByShop({
        limit, page, shopId
    }) {
        const discounts = await findAllDiscountCodesSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            select: ['discount_shopId', 'discount_name'],
            model: discount
        })

        return discounts;
    }
    
    /* 
    Apply discount code
     */

    static async applyDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            }
        })

        if(!foundDiscount) {
            throw new NotFoundError('Discount code not exists!')
        }

        const { 
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_users_used,
            discount_start_date,
            discount_type,
            discount_value,
            discount_max_uses_per_user
         } = foundDiscount

        if(!discount_is_active) throw new NotFoundError('Discount code is not active!')
        if(!discount_max_uses || discount_max_uses <= 0) throw new NotFoundError('Discount are out!')

        // if( new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
        //     throw new NotFoundError('Discount code has expired!')
        // }

        // check xem cos xet gia tri toi thieu hay khong
        let totalOrder = 0;
        if(discount_min_order_value > 0) {
            // get total 
            totalOrder = products.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            if(totalOrder < discount_min_order_value) {
                throw new NotFoundError(`Total order is not enough to apply discount code! ${discount_min_order_value}`)
            }
        }

        // check xem co gia tri toi da hay khong
        if(discount_max_uses_per_user > 0) {
            const userUserDiscount = discount_users_used.find(user => user.userId === userId)
            if(userUserDiscount) {
                // ,,,,
            }
        }
        
        const amount = discount_type === 'fixed_amount' ? discount_value : (discount_value / 100) * totalOrder;

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({ codeId, shopId }) {

        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
        })

        return deleted
    }

    // cancel discount code
    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })

       if(!foundDiscount) throw new NotFoundError('Discount code not exists!')

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })

        return result
        
    }

}

module.exports = DiscountService