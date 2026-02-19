const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const { file, category } = event

  try {
    // 根据分类确定上传路径
    let path = ''
    if (category === 'avatar') {
      path = `avatars/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
    } else if (category === 'product') {
      path = `products/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
    } else if (category === 'chat') {
      path = `chat/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
    } else {
      return {
        success: false,
        message: '无效的图片分类'
      }
    }

    // 上传文件
    const uploadResult = await cloud.uploadFile({
      cloudPath: path,
      fileContent: file
    })

    // 获取文件临时链接
    const fileResult = await cloud.getTempFileURL({
      fileList: [uploadResult.fileID]
    })

    return {
      success: true,
      imageUrl: fileResult.fileList[0].tempFileURL,
      fileId: uploadResult.fileID
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    return {
      success: false,
      message: '上传图片失败，请重试',
      error: error.message
    }
  }
}
