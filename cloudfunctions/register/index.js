const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { phone, password, name, studentId, nickname } = event

  try {
    // 检查手机号是否已注册
    const phoneCheck = await db.collection('users').where({
      phone: phone
    }).get()

    if (phoneCheck.data.length > 0) {
      return {
        success: false,
        message: '该手机号已注册'
      }
    }

    // 检查学号是否已使用
    const studentIdCheck = await db.collection('users').where({
      studentId: studentId
    }).get()

    if (studentIdCheck.data.length > 0) {
      return {
        success: false,
        message: '该学号已被使用'
      }
    }

    // 创建用户
    const result = await db.collection('users').add({
      data: {
        phone: phone,
        password: password,
        nickname: nickname || name,
        name: name,
        studentId: studentId,
        avatar: '',
        gender: '保密',
        creditScore: 100,
        soldCount: 0,
        defaultLocation: null,
        defaultExpiryDays: 3,
        notificationEnabled: true,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        status: 'active'
      }
    })

    return {
      success: true,
      message: '注册成功',
      userId: result._id
    }
  } catch (error) {
    console.error('注册失败:', error)
    return {
      success: false,
      message: '注册失败，请重试',
      error: error.message
    }
  }
}
