const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { phone, password } = event

  try {
    // 查询用户
    const result = await db.collection('users').where({
      phone: phone
    }).get()

    if (result.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const user = result.data[0]

    // 验证密码
    if (user.password !== password) {
      return {
        success: false,
        message: '密码错误'
      }
    }

    // 更新最后登录时间
    await db.collection('users').doc(user._id).update({
      data: {
        lastLoginAt: Date.now()
      }
    })

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user

    return {
      success: true,
      message: '登录成功',
      userInfo: userInfo
    }
  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      message: '登录失败，请重试',
      error: error.message
    }
  }
}
