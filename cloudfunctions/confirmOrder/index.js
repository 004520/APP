const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { orderId, transactionTime, transactionLocation } = event
  const { OPENID } = cloud.getWXContext()

  try {
    // 查询订单
    const order = await db.collection('orders').doc(orderId).get()
    if (!order.data) {
      return {
        success: false,
        message: '订单不存在'
      }
    }

    // 验证权限
    if (order.data.sellerOpenid !== OPENID) {
      return {
        success: false,
        message: '无权操作此订单'
      }
    }

    // 更新订单
    await db.collection('orders').doc(orderId).update({
      data: {
        status: '进行中',
        transactionTime: transactionTime,
        transactionLocation: transactionLocation
      }
    })

    return {
      success: true,
      message: '订单确认成功'
    }
  } catch (error) {
    console.error('确认订单失败:', error)
    return {
      success: false,
      message: '确认订单失败，请重试',
      error: error.message
    }
  }
}
