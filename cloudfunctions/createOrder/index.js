const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { productId, buyerId, buyerOpenid } = event
  const { OPENID } = cloud.getWXContext()

  try {
    // 查询商品信息
    const product = await db.collection('products').doc(productId).get()
    if (!product.data) {
      return {
        success: false,
        message: '商品不存在'
      }
    }

    if (product.data.status !== '在售') {
      return {
        success: false,
        message: '商品已售出或已下架'
      }
    }

    if (product.data.sellerOpenid === OPENID) {
      return {
        success: false,
        message: '不能购买自己的商品'
      }
    }

    // 检查是否已有待确认订单
    const existingOrder = await db.collection('orders').where({
      productId: productId,
      buyerId: buyerId,
      status: '待确认'
    }).get()

    if (existingOrder.data.length > 0) {
      return {
        success: false,
        message: '您已下单此商品，请等待卖家确认'
      }
    }

    // 创建订单
    const result = await db.collection('orders').add({
      data: {
        productId: productId,
        buyerId: buyerId,
        buyerOpenid: buyerOpenid,
        sellerId: product.data.sellerId,
        sellerOpenid: product.data.sellerOpenid,
        status: '待确认',
        transactionTime: product.data.transactionTime,
        transactionLocation: product.data.transactionLocation,
        createdAt: Date.now()
      }
    })

    return {
      success: true,
      message: '下单成功',
      orderId: result._id
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    return {
      success: false,
      message: '下单失败，请重试',
      error: error.message
    }
  }
}
