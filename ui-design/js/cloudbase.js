/**
 * CloudBase SDK 初始化
 * 校园交换助手 - 云开发SDK集成
 */

// CloudBase 应用实例
let app = null
let db = null
let auth = null

/**
 * 初始化CloudBase SDK
 */
function initCloudBase() {
  if (app) {
    console.log('CloudBase已初始化')
    return app
  }

  try {
    // 初始化CloudBase
    app = cloudbase.init({
      env: 'app004520-2gnr9yy23c0f3ed9'
    })

    // 获取数据库引用
    db = app.database()

    // 获取认证实例
    auth = app.auth()

    console.log('CloudBase初始化成功')
    return app
  } catch (error) {
    console.error('CloudBase初始化失败:', error)
    throw error
  }
}

/**
 * 获取CloudBase应用实例
 */
function getApp() {
  if (!app) {
    initCloudBase()
  }
  return app
}

/**
 * 获取数据库实例
 */
function getDatabase() {
  if (!db) {
    initCloudBase()
  }
  return db
}

/**
 * 获取认证实例
 */
function getAuth() {
  if (!auth) {
    initCloudBase()
  }
  return auth
}

/**
 * 检查登录状态
 */
async function checkLoginStatus() {
  try {
    const loginState = await auth.getLoginState()
    return loginState
  } catch (error) {
    console.error('检查登录状态失败:', error)
    return null
  }
}

/**
 * 获取当前用户openid
 */
async function getCurrentUserOpenid() {
  try {
    const loginState = await auth.getLoginState()
    return loginState ? loginState.user.openid : null
  } catch (error) {
    console.error('获取用户openid失败:', error)
    return null
  }
}

// 导出函数
window.CloudBaseHelper = {
  init: initCloudBase,
  getApp: getApp,
  getDatabase: getDatabase,
  getAuth: getAuth,
  checkLoginStatus: checkLoginStatus,
  getCurrentUserOpenid: getCurrentUserOpenid
}

// 页面加载时自动初始化
document.addEventListener('DOMContentLoaded', function() {
  initCloudBase()
})
