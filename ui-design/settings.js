// 设置页面交互逻辑

// 退出登录函数
function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    // 清除本地存储的用户数据
    clearUserData();

    // 显示提示
    showToast('已退出登录');

    // 延迟跳转到登录页
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
  }
}

// 清除用户数据
function clearUserData() {
  // 清除用户token
  localStorage.removeItem('userToken');

  // 清除用户信息
  localStorage.removeItem('userInfo');

  // 清除购物车数据
  localStorage.removeItem('shoppingCart');

  // 清除在售商品数据
  localStorage.removeItem('myProducts');

  // 清除其他可能存在的用户相关数据
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('user') || key.includes('cart') || key.includes('product'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));

  console.log('已清除所有用户数据');
}

// 显示提示
function showToast(message) {
  // 创建提示元素
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: #FFFFFF;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;

  document.body.appendChild(toast);

  // 2秒后移除
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 2000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

// 页面加载完成后添加事件监听
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.querySelector('.btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      handleLogout();
    });
  }
});
