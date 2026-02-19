// 注册页面交互逻辑

class RegisterHandler {
  constructor() {
    // 当前步骤
    this.currentStep = 1;

    // 注册数据
    this.registerData = {
      phone: '',
      verificationCode: '',
      avatar: null,
      nickname: '',
      realName: '',
      studentId: '',
      password: ''
    };

    // 倒计时
    this.countdown = 0;
    this.countdownTimer = null;

    // 获取 DOM 元素
    this.backBtn = document.getElementById('backBtn');
    this.sendCodeBtn = document.getElementById('sendCodeBtn');
    this.countdownText = document.getElementById('countdownText');

    // 步骤按钮
    this.step1Next = document.getElementById('step1Next');
    this.step2Back = document.getElementById('step2Back');
    this.step2Next = document.getElementById('step2Next');
    this.step3Back = document.getElementById('step3Back');
    this.step3Complete = document.getElementById('step3Complete');

    // 输入框
    this.registerPhoneInput = document.getElementById('registerPhone');
    this.verificationInputs = document.querySelectorAll('.verification-input');
    this.nicknameInput = document.getElementById('nickname');
    this.realNameInput = document.getElementById('realName');
    this.registerStudentIdInput = document.getElementById('registerStudentId');
    this.registerPasswordInput = document.getElementById('registerPassword');
    this.confirmPasswordInput = document.getElementById('confirmPassword');

    // 头像上传
    this.avatarUpload = document.getElementById('avatarUpload');
    this.avatarPreview = document.getElementById('avatarPreview');
    this.avatarPlaceholder = document.getElementById('avatarPlaceholder');
    this.avatarInput = document.getElementById('avatarInput');

    // 密码切换
    this.toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
    this.toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

    // 初始化
    this.init();
  }

  init() {
    // 绑定事件
    this.bindEvents();
  }

  bindEvents() {
    // 返回按钮
    this.backBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });

    // 步骤1事件
    this.sendCodeBtn.addEventListener('click', () => this.sendVerificationCode());
    this.step1Next.addEventListener('click', () => this.goToStep2());
    this.registerPhoneInput.addEventListener('input', () => this.validatePhone());

    // 验证码输入
    this.verificationInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => this.handleVerificationInput(e, index));
      input.addEventListener('keydown', (e) => this.handleVerificationKeydown(e, index));
    });

    // 步骤2事件
    this.step2Back.addEventListener('click', () => this.goToStep(1));
    this.step2Next.addEventListener('click', () => this.goToStep3());
    this.avatarUpload.addEventListener('click', () => this.avatarInput.click());
    this.avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));

    // 步骤3事件
    this.step3Back.addEventListener('click', () => this.goToStep(2));
    this.step3Complete.addEventListener('click', () => this.completeRegister());

    // 密码相关
    this.toggleRegisterPassword.addEventListener('click', () => this.togglePasswordVisibility(this.registerPasswordInput, this.toggleRegisterPassword));
    this.toggleConfirmPassword.addEventListener('click', () => this.togglePasswordVisibility(this.confirmPasswordInput, this.toggleConfirmPassword));
    this.registerPasswordInput.addEventListener('input', () => this.updatePasswordStrength());
    this.registerPasswordInput.addEventListener('blur', () => this.validatePassword());
  }

  // 发送验证码
  async sendVerificationCode() {
    const phone = this.registerPhoneInput.value.trim();

    if (!this.validatePhone()) {
      return;
    }

    // 显示加载状态
    this.sendCodeBtn.disabled = true;
    this.sendCodeBtn.textContent = '发送中...';

    try {
      // 模拟发送验证码
      await this.sendCodeApi(phone);

      this.showToast('验证码已发送', 'success');

      // 开始倒计时
      this.startCountdown();

      // 聚焦第一个验证码输入框
      this.verificationInputs[0].focus();

    } catch (error) {
      this.showToast(error.message || '发送失败，请重试', 'error');
      this.sendCodeBtn.disabled = false;
      this.sendCodeBtn.textContent = '发送验证码';
    }
  }

  // 倒计时
  startCountdown() {
    this.countdown = 60;
    this.sendCodeBtn.disabled = true;

    this.countdownTimer = setInterval(() => {
      this.countdown--;
      this.sendCodeBtn.textContent = `${this.countdown}秒后重发`;

      if (this.countdown <= 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.sendCodeBtn.disabled = false;
    this.sendCodeBtn.textContent = '发送验证码';
    this.countdownText.textContent = '';
  }

  // 处理验证码输入
  handleVerificationInput(e, index) {
    const value = e.target.value;

    // 只允许输入数字
    e.target.value = value.replace(/\D/g, '');

    // 自动聚焦下一个输入框
    if (e.target.value && index < this.verificationInputs.length - 1) {
      this.verificationInputs[index + 1].focus();
    }

    // 检查是否所有输入框都已填写
    this.checkVerificationComplete();
  }

  handleVerificationKeydown(e, index) {
    // 退格键，聚焦上一个输入框
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      this.verificationInputs[index - 1].focus();
    }
  }

  checkVerificationComplete() {
    const code = Array.from(this.verificationInputs).map(input => input.value).join('');
    if (code.length === 6) {
      this.registerData.verificationCode = code;
    }
  }

  // 前往步骤2
  goToStep2() {
    if (!this.validateStep1()) {
      return;
    }

    this.registerData.phone = this.registerPhoneInput.value.trim();
    this.registerData.verificationCode = Array.from(this.verificationInputs).map(input => input.value).join('');

    this.goToStep(2);
  }

  // 验证步骤1
  validateStep1() {
    // 验证手机号
    if (!this.validatePhone()) {
      return false;
    }

    // 验证验证码
    const code = Array.from(this.verificationInputs).map(input => input.value).join('');
    if (code.length !== 5) {
      this.showInputError('verificationError', '请输入完整的验证码');
      return false;
    }

    return true;
  }

  // 前往步骤3
  goToStep3() {
    if (!this.validateStep2()) {
      return;
    }

    this.registerData.nickname = this.nicknameInput.value.trim();
    this.registerData.realName = this.realNameInput.value.trim();
    this.registerData.studentId = this.registerStudentIdInput.value.trim();

    this.goToStep(3);
  }

  // 验证步骤2
  validateStep2() {
    const realName = this.realNameInput.value.trim();
    const studentId = this.registerStudentIdInput.value.trim();

    if (!realName) {
      this.showInputError('realNameError', '请输入真实姓名');
      this.realNameInput.classList.add('error');
      return false;
    }

    if (!/^\d{10,12}$/.test(studentId)) {
      this.showInputError('registerStudentIdError', '学号格式不正确（10-12位数字）');
      this.registerStudentIdInput.classList.add('error');
      return false;
    }

    return true;
  }

  // 处理头像上传
  handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      this.showToast('请选择图片文件', 'error');
      return;
    }

    // 验证文件大小（最大2MB）
    if (file.size > 2 * 1024 * 1024) {
      this.showToast('图片大小不能超过2MB', 'error');
      return;
    }

    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      this.registerData.avatar = e.target.result;
      this.avatarPreview.src = e.target.result;
      this.avatarPreview.style.display = 'block';
      this.avatarPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  // 更新密码强度
  updatePasswordStrength() {
    const password = this.registerPasswordInput.value;
    const strength = this.calculatePasswordStrength(password);

    // 更新强度指示器
    const dots = document.querySelectorAll('.strength-dot');
    dots.forEach((dot, index) => {
      dot.classList.remove('weak', 'medium', 'strong');
      if (index < strength.level) {
        dot.classList.add(strength.class);
      }
    });

    // 更新要求列表
    this.updatePasswordRequirements(password);
  }

  calculatePasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    let level = 1;
    let strengthClass = 'weak';

    if (score >= 2) {
      level = 2;
      strengthClass = 'weak';
    }
    if (score >= 3) {
      level = 3;
      strengthClass = 'medium';
    }
    if (score >= 5) {
      level = 4;
      strengthClass = 'strong';
    }
    if (score >= 6) {
      level = 5;
      strengthClass = 'strong';
    }

    return { level, class: strengthClass };
  }

  updatePasswordRequirements(password) {
    const requirements = document.querySelectorAll('.requirement');

    requirements.forEach(req => {
      const type = req.dataset.requirement;
      let met = false;

      switch (type) {
        case 'length':
          met = password.length >= 8;
          break;
        case 'letter':
          met = /[a-zA-Z]/.test(password);
          break;
        case 'number':
          met = /\d/.test(password);
          break;
      }

      if (met) {
        req.classList.add('met');
      } else {
        req.classList.remove('met');
      }
    });
  }

  // 完成注册
  async completeRegister() {
    if (!this.validateStep3()) {
      return;
    }

    this.registerData.password = this.registerPasswordInput.value;

    // 显示加载状态
    this.setButtonLoading(this.step3Complete, true);

    try {
      // 模拟注册请求
      await this.registerApi(this.registerData);

      this.showToast('注册成功，请登录', 'success');

      // 延迟跳转
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);

    } catch (error) {
      this.showToast(error.message || '注册失败，请重试', 'error');
      this.setButtonLoading(this.step3Complete, false);
    }
  }

  // 验证步骤3
  validateStep3() {
    const password = this.registerPasswordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;

    if (!password) {
      this.showInputError('registerPasswordError', '请输入密码');
      this.registerPasswordInput.classList.add('error');
      return false;
    }

    if (password.length < 8) {
      this.showInputError('registerPasswordError', '密码长度不能少于8位');
      this.registerPasswordInput.classList.add('error');
      return false;
    }

    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      this.showInputError('registerPasswordError', '密码必须包含字母和数字');
      this.registerPasswordInput.classList.add('error');
      return false;
    }

    if (!confirmPassword) {
      this.showInputError('confirmPasswordError', '请再次输入密码');
      this.confirmPasswordInput.classList.add('error');
      return false;
    }

    if (password !== confirmPassword) {
      this.showInputError('confirmPasswordError', '两次输入的密码不一致');
      this.confirmPasswordInput.classList.add('error');
      return false;
    }

    return true;
  }

  // 切换步骤
  goToStep(step) {
    // 更新当前步骤
    this.currentStep = step;

    // 更新步骤指示器
    const dots = document.querySelectorAll('.step-dot');
    const lines = document.querySelectorAll('.step-line');

    dots.forEach((dot, index) => {
      dot.classList.remove('active', 'completed');
      if (index + 1 < step) {
        dot.classList.add('completed');
      } else if (index + 1 === step) {
        dot.classList.add('active');
      }
    });

    lines.forEach((line, index) => {
      line.classList.remove('active');
      if (index + 1 < step) {
        line.classList.add('active');
      }
    });

    // 切换内容
    const contents = document.querySelectorAll('.step-content');
    contents.forEach(content => {
      content.classList.remove('active');
      if (parseInt(content.dataset.step) === step) {
        content.classList.add('active');
      }
    });
  }

  // 工具方法
  togglePasswordVisibility(input, button) {
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;

    const icon = button.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
  }

  validatePhone() {
    const phone = this.registerPhoneInput.value.trim();
    const errorEl = document.getElementById('registerPhoneError');

    if (!phone) {
      this.showInputError('registerPhoneError', '请输入手机号');
      this.registerPhoneInput.classList.add('error');
      return false;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      this.showInputError('registerPhoneError', '手机号格式不正确');
      this.registerPhoneInput.classList.add('error');
      return false;
    }

    this.showInputError('registerPhoneError', '');
    this.registerPhoneInput.classList.remove('error');
    return true;
  }

  validatePassword() {
    const password = this.registerPasswordInput.value;
    const errorEl = document.getElementById('registerPasswordError');

    if (!password) {
      this.showInputError('registerPasswordError', '请输入密码');
      this.registerPasswordInput.classList.add('error');
      return false;
    }

    if (password.length < 8) {
      this.showInputError('registerPasswordError', '密码长度不能少于8位');
      this.registerPasswordInput.classList.add('error');
      return false;
    }

    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      this.showInputError('registerPasswordError', '密码必须包含字母和数字');
      this.registerPasswordInput.classList.add('error');
      return false;
    }

    this.showInputError('registerPasswordError', '');
    this.registerPasswordInput.classList.remove('error');
    return true;
  }

  showInputError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  setButtonLoading(button, loading) {
    const text = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');

    if (loading) {
      button.disabled = true;
      text.textContent = '处理中...';
      spinner.style.display = 'block';
    } else {
      button.disabled = false;
      text.textContent = button.id === 'step3Complete' ? '完成注册' : '下一步';
      spinner.style.display = 'none';
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // API 模拟
  async sendCodeApi(phone) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }

  async registerApi(data) {
    // 使用CloudBase云函数进行注册
    try {
      const app = CloudBaseHelper.getApp()
      const result = await app.callFunction({
        name: 'register',
        data: {
          phone: data.phone,
          password: data.password,
          name: data.realName,
          studentId: data.studentId,
          nickname: data.nickname || data.realName
        }
      })

      if (result.result.success) {
        return result.result
      } else {
        throw new Error(result.result.message || '注册失败')
      }
    } catch (error) {
      console.error('注册请求失败:', error)
      throw new Error(error.message || '注册失败，请重试')
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new RegisterHandler();
});
