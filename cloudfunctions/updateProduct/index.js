const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { productId, updateData } = event
  const { OPENID } = cloud.getWXContext()

  try {
    // 验证是否是商品所有者
    const product = await db.collection('products').doc(productId).get()
    if (!product.data || product.data.sellerOpenid !== OPENID) {
      return {
        success: false,
        message: '无权修改此商品'
      }
    }

    // 更新商品
    await db.collection('products').doc(productId).update({
      data: {
        ...updateData,
        updatedAt: Date.now()
      }
    })

    return {
      success: true,
      message: '商品更新成功'
    }
  } catch (error) {
    console.error('更新商品失败:', error)
    return {
      success: false,
      message: '更新商品失败，请重试',
      error: error.message
    }
  }
}
