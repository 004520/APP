const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { sellerId, sellerOpenid, title, description, price, images, category, condition, transactionTime, transactionLocation } = event

  try {
    // 计算过期时间（默认3天后）
    const expiryTime = Date.now() + 3 * 24 * 60 * 60 * 1000

    // 创建商品
    const result = await db.collection('products').add({
      data: {
        sellerId: sellerId,
        sellerOpenid: sellerOpenid,
        title: title,
        description: description,
        price: parseFloat(price),
        images: images || [],
        category: category,
        condition: condition,
        status: '在售',
        views: 0,
        likes: 0,
        transactionTime: transactionTime,
        transactionLocation: transactionLocation,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        expiryTime: expiryTime
      }
    })

    return {
      success: true,
      message: '商品发布成功',
      productId: result._id
    }
  } catch (error) {
    console.error('发布商品失败:', error)
    return {
      success: false,
      message: '发布商品失败，请重试',
      error: error.message
    }
  }
}
