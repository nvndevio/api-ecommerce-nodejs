'use strict'

const { findCartById } = require('../models/repositories/cart.repo')
const { checkProductByServer } = require('../models/repositories/product.repo')
const DiscountService = require('./discount.service')


const {
    NotFoundError,
    BadRequestError,
} = require('../core/error.response')

class CheckoutService {
    // login without login
    /*
    {
        cartId: 1,
        userId: 1,
        shop_order_ids: [
            {
                shopId: 1,
                shop_discounts: [],
                item_products: [
                    {
                        quantity: 1,
                        price: 100,
                        productId: 1,
                    }
                ]
            },
            {
                shopId: 2,
                shop_discounts: [
                    {
                        shopId: 1,
                        discountId,
                        codeId
                    },
                    {
                        code: 'DISCOUNT20',
                        value: 20,
                    }
                ],
                item_products: [
                    {
                        quantity: 1,
                        price: 100,
                        productId: 1,
                    }
                ]
            }
        ]
    }
    */

    static async checkoutReview({ cartId, userId, shop_order_ids}) {
        const foundCart = await findCartById({ cartId })
        if (!foundCart) throw new BadRequestError('Cart does not exist')

        const checkout_order = {
            totalPrice: 0, //tong tien hang
            feeShip: 0, //tien ship
            totalDiscount: 0, //tong giam gia
            totalCheckout: 0, //tong tien thanh toan
        }, shop_order_ids_new = []

        //tinh tong tien bill
        for (let i = 0; i < shop_order_ids.length; i++) {
            const {shopId, shop_discounts = [], item_products = []} = shop_order_ids[i]
            //check product available
            const checkProductServer = await checkProductByServer(item_products)
            console.log('checkProductServer', checkProductServer)

            if(!checkProductServer[0]) throw new BadRequestError('Product does not exist')
            
            //tinh tong tien hang
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + product.price * product.quantity
            }, 0)

            // tonng tien truoc khi xu ly
            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, //tong tien truoc khi giam gia
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer,
            }

            // neu shop discount tonn tai > 0, check xem co hop le hay khong
            if(shop_discounts.length > 0) {
                // gia su chi co 1 discount
                // get amount discount
                const {totalPrice = 0, discount = 0} = await DiscountService.getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer,
                })
                // tong cong discount giam gia
                checkout_order.totalDiscount += discount

                // neu co discount > 0
                if(discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }

            //tong thanh toan cuoi cung
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }
}

module.exports = CheckoutService