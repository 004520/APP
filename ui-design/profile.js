// 个人资料页面交互逻辑

class ProfileHandler {
  constructor() {
    // 获取 DOM 元素
    this.backBtn = document.querySelector('.btn-back');
    this.saveBtn = document.querySelector('.btn-save');
    this.textarea = document.querySelector('.form-textarea');
    this.charCount = document.querySelector('.char-count');

    // 初始化
    this.init();
  }

  init() {
    // 绑定事件
    this.bindEvents();

    // 初始化字符计数
    this.updateCharCount();

    // 设置默认性别
    const genderRadio = document.querySelector('input[name="gender"][value="secret"]');
    if (genderRadio) {
      genderRadio.checked = true;
    }
  }

  bindEvents() {
    // 返回按钮
    this.backBtn.addEventListener('click', () => {
      if (this.hasUnsavedChanges()) {
        if (confirm('您有未保存的修改，确定要离开吗？')) {
          window.location.href = 'settings.html';
        }
      } else {
        window.location.href = 'settings.html';
      }
    });

    // 保存按钮
    this.saveBtn.addEventListener('click', () => this.handleSave());

    // 个人简介字数统计
    this.textarea.addEventListener('input', () => this.updateCharCount());
  }

  // 更新字符计数
  updateCharCount() {
    const current = this.textarea.value.length;
    const max = this.textarea.getAttribute('maxlength');
    this.charCount.textContent = `${current}/${max}`;
  }

  // 检查是否有未保存的更改
  hasUnsavedChanges() {
    // 这里可以添加实际的变更检测逻辑
    // 暂时返回 false
    return false;
  }

  // 处理保存
  async handleSave() {
    // 获取表单数据
    const nickname = document.getElementById('nickname');
    const realName = document.getElementById('realName');
    const studentId = document.getElementById('studentId');
    const phone = document.getElementById('phone');
    const college = document.getElementById('college');
    const bio = document.getElementById('bio');
    const gender = document.querySelector('input[name="gender"]:checked');

    // 表单验证
    if (!realName.value.trim()) {
      this.showToast('请输入真实姓名');
      realName.focus();
      return;
    }

    if (!studentId.value.trim()) {
      this.showToast('请输入学号');
      studentId.focus();
      return;
    }

    if (!phone.value.trim()) {
      this.showToast('请输入手机号');
      phone.focus();
      return;
    }

    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone.value.trim())) {
      this.showToast('请输入正确的手机号');
      phone.focus();
      return;
    }

    // 收集保存的数据
    const profileData = {
      nickname: nickname.value.trim(),
      realName: realName.value.trim(),
      studentId: studentId.value.trim(),
      phone: phone.value.trim(),
      gender: gender ? gender.value : 'secret',
      college: college.value.trim(),
      bio: bio.value.trim()
    };

    console.log('保存的数据:', profileData);

    // 发送保存请求
    this.saveBtn.disabled = true;
    this.saveBtn.textContent = '保存中...';

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      this.saveBtn.disabled = false;
      this.saveBtn.textContent = '保存';

      if (result.success) {
        // 保存成功，保存到本地存储
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        this.showToast('保存成功');

        // 保存成功后返回设置界面
        setTimeout(() => {
          window.location.href = 'settings.html';
        }, 500);
      } else {
        // 保存失败
        this.showToast(result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      this.saveBtn.disabled = false;
      this.saveBtn.textContent = '保存';
      this.showToast('保存失败，请检查网络连接');
    }
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
  new ProfileHandler();
});
