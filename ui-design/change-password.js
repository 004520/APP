// 修改密码交互逻辑

class ChangePasswordHandler {
  constructor() {
    this.init();
  }

  init() {
    // 绑定表单提交事件
    document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // 清除错误提示
    document.querySelectorAll('.input').forEach(input => {
      input.addEventListener('input', () => {
        this.clearError(input.id);
      });
    });
  }

  // 处理表单提交
  async handleSubmit() {
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // 清除之前的错误提示
    this.clearAllErrors();

    // 验证原密码
    if (!oldPassword) {
      this.showError('oldPassword', '请输入原密码');
      return;
    }

    // 验证新密码
    if (!newPassword) {
      this.showError('newPassword', '请输入新密码');
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 20) {
      this.showError('newPassword', '密码长度为6-20位');
      return;
    }

    if (oldPassword === newPassword) {
      this.showError('newPassword', '新密码不能与原密码相同');
      return;
    }

    // 验证确认密码
    if (!confirmPassword) {
      this.showError('confirmPassword', '请再次输入新密码');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.showError('confirmPassword', '两次输入的密码不一致');
      return;
    }

    // 提交修改
    await this.changePassword(oldPassword, newPassword);
  }

  // 修改密码
  async changePassword(oldPassword, newPassword) {
    try {
      // 显示加载状态
      const submitBtn = document.querySelector('.btn-primary');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span>';

      // 调用后端API
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        this.showToast('密码修改成功');
        // 延迟跳转
        setTimeout(() => {
          window.location.href = 'settings.html';
        }, 1500);
      } else {
        this.showError('oldPassword', result.message || '原密码错误，请重新输入');
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      this.showToast('网络错误，请稍后重试');
    } finally {
      // 恢复按钮状态
      const submitBtn = document.querySelector('.btn-primary');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="btn-text">确认修改</span>';
    }
  }

  // 显示错误
  showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorMsg = document.getElementById(fieldId + 'Error');

    input.classList.add('error');
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
  }

  // 清除错误
  clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorMsg = document.getElementById(fieldId + 'Error');

    input.classList.remove('error');
    errorMsg.classList.remove('show');
  }

  // 清除所有错误
  clearAllErrors() {
    document.querySelectorAll('.input').forEach(input => {
      input.classList.remove('error');
    });
    document.querySelectorAll('.error-msg').forEach(msg => {
      msg.classList.remove('show');
    });
  }

  // 显示提示
  showToast(message) {
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

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2000);
  }
}

// 切换密码显示/隐藏
function togglePassword(fieldId) {
  const input = document.getElementById(fieldId);
  const icon = input.nextElementSibling.querySelector('i');

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new ChangePasswordHandler();
});
