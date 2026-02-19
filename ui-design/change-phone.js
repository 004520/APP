// 修改手机号交互逻辑

class ChangePhoneHandler {
  constructor() {
    this.currentStep = 1;
    this.timer = null;
    this.countdown = 0;
    this.init();
  }

  init() {
    // 清除错误提示
    document.querySelectorAll('.input').forEach(input => {
      input.addEventListener('input', () => {
        this.clearError(input.id);
      });
    });
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

  // 切换步骤
  switchStep(step) {
    // 更新步骤指示器
    document.querySelectorAll('.step-item').forEach(item => {
      item.classList.remove('active', 'completed');
      if (parseInt(item.dataset.step) < step) {
        item.classList.add('completed');
      } else if (parseInt(item.dataset.step) === step) {
        item.classList.add('active');
      }
    });

    // 更新步骤连线
    document.querySelectorAll('.step-line').forEach(line => {
      line.classList.remove('completed');
      if (step > 1) {
        line.classList.add('completed');
      }
    });

    // 切换表单步骤
    document.querySelectorAll('.form-step').forEach(stepEl => {
      stepEl.style.display = 'none';
    });
    document.querySelector(`.form-step[data-step="${step}"]`).style.display = 'block';

    this.currentStep = step;
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

// 发送验证码
async function sendVerifyCode(step) {
  const handler = window.changePhoneHandler;
  const btn = document.getElementById(`sendCodeBtn${step}`);

  try {
    // 验证手机号(步骤2需要)
    if (step === 2) {
      const newPhone = document.getElementById('newPhone').value;
      const phoneRegex = /^1[3-9]\d{9}$/;

      if (!newPhone) {
        handler.showError('newPhone', '请输入新手机号');
        return;
      }

      if (!phoneRegex.test(newPhone)) {
        handler.showError('newPhone', '请输入正确的手机号');
        return;
      }
    }

    // 显示加载状态
    btn.disabled = true;
    btn.textContent = '发送中...';

    // 调用后端API
    const response = await fetch('/api/sms/send-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: step === 1 ? 'change_phone_verify' : 'change_phone_bind',
        phone: step === 1 ? null : document.getElementById('newPhone').value
      })
    });

    const result = await response.json();

    if (result.success) {
      handler.showToast('验证码已发送');

      // 开始倒计时
      handler.countdown = 60;
      handler.timer = setInterval(() => {
        handler.countdown--;
        btn.textContent = `${handler.countdown}秒后重新发送`;

        if (handler.countdown <= 0) {
          clearInterval(handler.timer);
          btn.disabled = false;
          btn.textContent = '获取验证码';
        }
      }, 1000);
    } else {
      handler.showToast(result.message || '发送失败，请重试');
      btn.disabled = false;
      btn.textContent = '获取验证码';
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    handler.showToast('网络错误，请稍后重试');
    btn.disabled = false;
    btn.textContent = '获取验证码';
  }
}

// 验证原手机号
async function verifyOldPhone() {
  const handler = window.changePhoneHandler;
  const verifyCode = document.getElementById('verifyCode1').value;

  // 清除错误提示
  handler.clearAllErrors();

  // 验证验证码
  if (!verifyCode) {
    handler.showError('verifyCode1', '请输入验证码');
    return;
  }

  if (verifyCode.length !== 6) {
    handler.showError('verifyCode1', '验证码格式错误');
    return;
  }

  try {
    // 显示加载状态
    const submitBtn = document.querySelector('.step-1 .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>';

    // 调用后端API验证
    const response = await fetch('/api/user/verify-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verifyCode: verifyCode
      })
    });

    const result = await response.json();

    if (result.success) {
      handler.showToast('验证成功');
      // 切换到步骤2
      handler.switchStep(2);
    } else {
      handler.showError('verifyCode1', result.message || '验证码错误，请重新输入');
    }
  } catch (error) {
    console.error('验证失败:', error);
    handler.showToast('网络错误，请稍后重试');
  } finally {
    // 恢复按钮状态
    const submitBtn = document.querySelector('.step-1 .btn-primary');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-text">下一步</span>';
  }
}

// 绑定新手机号
async function bindNewPhone() {
  const handler = window.changePhoneHandler;
  const newPhone = document.getElementById('newPhone').value;
  const verifyCode = document.getElementById('verifyCode2').value;

  // 清除错误提示
  handler.clearAllErrors();

  // 验证新手机号
  if (!newPhone) {
    handler.showError('newPhone', '请输入新手机号');
    return;
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(newPhone)) {
    handler.showError('newPhone', '请输入正确的手机号');
    return;
  }

  // 验证验证码
  if (!verifyCode) {
    handler.showError('verifyCode2', '请输入验证码');
    return;
  }

  if (verifyCode.length !== 6) {
    handler.showError('verifyCode2', '验证码格式错误');
    return;
  }

  try {
    // 显示加载状态
    const submitBtn = document.querySelector('.step-2 .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>';

    // 调用后端API绑定
    const response = await fetch('/api/user/change-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newPhone: newPhone,
        verifyCode: verifyCode
      })
    });

    const result = await response.json();

    if (result.success) {
      handler.showToast('手机号修改成功');
      // 延迟跳转
      setTimeout(() => {
        window.location.href = 'settings.html';
      }, 1500);
    } else {
      handler.showError('verifyCode2', result.message || '验证码错误，请重新输入');
    }
  } catch (error) {
    console.error('绑定失败:', error);
    handler.showToast('网络错误，请稍后重试');
  } finally {
    // 恢复按钮状态
    const submitBtn = document.querySelector('.step-2 .btn-primary');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-text">确认修改</span>';
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
  window.changePhoneHandler = new ChangePhoneHandler();
});
