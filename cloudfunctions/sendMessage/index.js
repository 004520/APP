const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { productId, receiverId, receiverOpenid, type, content } = event
  const { OPENID } = cloud.getWXContext()

  try {
    // 创建消息
    const result = await db.collection('messages').add({
      data: {
        productId: productId,
        senderId: context.OPENID,
        senderOpenid: OPENID,
        receiverId: receiverId,
        receiverOpenid: receiverOpenid,
        type: type,
        content: content,
        isRead: false,
        createdAt: Date.now()
      }
    })

    return {
      success: true,
      messageId: result._id
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    return {
      success: false,
      message: '发送消息失败，请重试',
      error: error.message
    }
  }
}
