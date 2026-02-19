// 登录页面交互逻辑

class LoginHandler {
  constructor() {
    // 获取 DOM 元素
    this.form = document.getElementById('loginForm');
    this.phoneInput = document.getElementById('phone');
    this.passwordInput = document.getElementById('password');
    this.studentIdInput = document.getElementById('studentId');
    this.togglePasswordBtn = document.getElementById('togglePassword');
    this.loginBtn = document.getElementById('loginBtn');
    this.btnText = this.loginBtn.querySelector('.btn-text');
    this.spinner = this.loginBtn.querySelector('.spinner');

    // 初始化
    this.init();
  }

  init() {
    // 绑定事件
    this.bindEvents();

    // 初始化按钮状态
    this.updateButtonState();
  }

  bindEvents() {
    // 表单提交
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // 密码显示/隐藏
    this.togglePasswordBtn.addEventListener('click', () => this.togglePassword());

    // 实时验证
    this.phoneInput.addEventListener('input', () => this.validatePhone());
    this.phoneInput.addEventListener('blur', () => this.validatePhone());

    this.passwordInput.addEventListener('input', () => this.validatePassword());
    this.passwordInput.addEventListener('blur', () => this.validatePassword());

    this.studentIdInput.addEventListener('input', () => this.validateStudentId());
    this.studentIdInput.addEventListener('blur', () => this.validateStudentId());

    // 更新按钮状态
    this.phoneInput.addEventListener('input', () => this.updateButtonState());
    this.passwordInput.addEventListener('input', () => this.updateButtonState());
    this.studentIdInput.addEventListener('input', () => this.updateButtonState());

    // 链接点击 - 不阻止默认行为，允许跳转
    document.querySelector('.link-secondary').addEventListener('click', (e) => {
      e.preventDefault();
      this.showToast('忘记密码功能开发中...');
    });
  }

  // 切换密码显示/隐藏
  togglePassword() {
    const type = this.passwordInput.type === 'password' ? 'text' : 'password';
    this.passwordInput.type = type;

    const icon = this.togglePasswordBtn.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
  }

  // 验证手机号
  validatePhone() {
    const phone = this.phoneInput.value.trim();
    const errorEl = document.getElementById('phoneError');

    if (!phone) {
      this.showError(this.phoneInput, errorEl, '请输入手机号');
      return false;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      this.showError(this.phoneInput, errorEl, '手机号格式不正确');
      return false;
    }

    this.showSuccess(this.phoneInput, errorEl);
    return true;
  }

  // 验证密码
  validatePassword() {
    const password = this.passwordInput.value;
    const errorEl = document.getElementById('passwordError');

    if (!password) {
      this.showError(this.passwordInput, errorEl, '请输入密码');
      return false;
    }

    if (password.length < 8) {
      this.showError(this.passwordInput, errorEl, '密码长度不能少于8位');
      return false;
    }

    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      this.showError(this.passwordInput, errorEl, '密码必须包含字母和数字');
      return false;
    }

    this.showSuccess(this.passwordInput, errorEl);
    return true;
  }

  // 验证学号
  validateStudentId() {
    const studentId = this.studentIdInput.value.trim();
    const errorEl = document.getElementById('studentIdError');

    if (!studentId) {
      this.showError(this.studentIdInput, errorEl, '请输入学号');
      return false;
    }

    if (!/^\d{10,12}$/.test(studentId)) {
      this.showError(this.studentIdInput, errorEl, '学号格式不正确（10-12位数字）');
      return false;
    }

    this.showSuccess(this.studentIdInput, errorEl);
    return true;
  }

  // 显示错误
  showError(input, errorEl, message) {
    input.classList.add('error');
    errorEl.textContent = message;
  }

  // 显示成功
  showSuccess(input, errorEl) {
    input.classList.remove('error');
    errorEl.textContent = '';
  }

  // 更新按钮状态
  updateButtonState() {
    const phone = this.phoneInput.value.trim();
    const password = this.passwordInput.value;
    const studentId = this.studentIdInput.value.trim();

    const isValid =
      /^1[3-9]\d{9}$/.test(phone) &&
      password.length >= 8 &&
      /^\d{10,12}$/.test(studentId);

    this.loginBtn.disabled = !isValid;
  }

  // 提交表单
  async handleSubmit(e) {
    e.preventDefault();

    // 最终验证
    const isPhoneValid = this.validatePhone();
    const isPasswordValid = this.validatePassword();
    const isStudentIdValid = this.validateStudentId();

    if (!isPhoneValid || !isPasswordValid || !isStudentIdValid) {
      this.showToast('请检查输入信息', 'error');
      return;
    }

    // 显示加载状态
    this.setLoading(true);

    // 模拟登录请求
    try {
      await this.login({
        phone: this.phoneInput.value.trim(),
        password: this.passwordInput.value,
        studentId: this.studentIdInput.value.trim()
      });

      // 登录成功
      this.showToast('登录成功', 'success');

      // 延迟跳转
      setTimeout(() => {
        window.location.href = 'main-menu.html';
      }, 1000);

    } catch (error) {
      this.showToast(error.message || '登录失败，请重试', 'error');
      this.setLoading(false);
    }
  }

  // 登录请求
  async login(data) {
    // 使用CloudBase云函数进行登录
    try {
      const app = CloudBaseHelper.getApp()
      const result = await app.callFunction({
        name: 'login',
        data: {
          phone: data.phone,
          password: data.password
        }
      })

      if (result.result.success) {
        // 保存用户信息到localStorage
        localStorage.setItem('userInfo', JSON.stringify(result.result.userInfo))
        localStorage.setItem('userOpenid', result.result.userInfo._openid)
        localStorage.setItem('isLoggedIn', 'true')

        return result.result
      } else {
        throw new Error(result.result.message || '登录失败')
      }
    } catch (error) {
      console.error('登录请求失败:', error)
      throw new Error(error.message || '登录失败，请重试')
    }
  }

  // 设置加载状态
  setLoading(loading) {
    if (loading) {
      this.loginBtn.disabled = true;
      this.btnText.textContent = '登录中...';
      this.spinner.style.display = 'block';
    } else {
      this.loginBtn.disabled = false;
      this.btnText.textContent = '登 录';
      this.spinner.style.display = 'none';
      this.updateButtonState();
    }
  }

  // 显示提示
  showToast(message, type = 'info') {
    // 创建 toast 元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // 添加到页面
    document.body.appendChild(toast);

    // 显示动画
    setTimeout(() => toast.classList.add('show'), 10);

    // 自动移除
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new LoginHandler();
});
