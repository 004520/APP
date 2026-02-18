# 注册界面 UI 设计文档

## 设计概述

### 1.1 设计风格
- **整体风格**：与登录界面保持一致
- **主色调**：翡翠绿 (#2ECC71)
- **背景**：渐变色（浅蓝→紫色）
- **设计语言**：卡片式设计，分步引导

### 1.2 设计特点
1. **分步注册**：将注册流程分为3个步骤，降低用户认知负担
2. **清晰引导**：每步都有明确的说明和提示
3. **实时验证**：输入时实时校验，即时反馈
4. **视觉统一**：与登录界面保持完全一致的风格

---

## 2. 注册流程设计

### 2.1 流程图
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  步骤1      │ -> │  步骤2      │ -> │  步骤3      │
│ 验证手机号  │    │ 填写个人信息│    │ 设置密码    │
└─────────────┘    └─────────────┘    └─────────────┘
     ↓                  ↓                  ↓
┌─────────────────────────────────────────────────┐
│               注册成功，跳转登录                  │
└─────────────────────────────────────────────────┘
```

### 2.2 步骤说明

**步骤1：验证手机号**
- 输入手机号
- 发送验证码（60秒倒计时）
- 验证码校验

**步骤2：填写个人信息**
- 必填：姓名、学号
- 选填：昵称、头像

**步骤3：设置密码**
- 设置密码
- 确认密码
- 显示密码强度

---

## 3. 界面布局

### 3.1 整体结构
```
┌─────────────────────────────────────────┐
│       [< 返回]    注册新账户             │  ← 顶部导航
├─────────────────────────────────────────┤
│                                         │
│   ●●○  步骤进度指示器                   │  ← 进度条
│                                         │
│   ┌───────────────────────────────────┐  │
│   │  📱 手机号                        │  │
│   │  [____________]    [发送验证码]    │  │  ← 输入框
│   └───────────────────────────────────┘  │
│                                         │
│   ┌───────────────────────────────────┐  │
│   │  🔐 验证码                        │  │
│   │  [____]                           │  │
│   └───────────────────────────────────┘  │
│                                         │
│            [ 下一步 ]                   │  ← 主按钮
│                                         │
│  已有账户？[ 立即登录 ]                 │  ← 底部链接
│                                         │
└─────────────────────────────────────────┘
```

### 3.2 步骤进度指示器

**设计规范：**
```css
.steps-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #E0E0E0;
  transition: all 0.3s ease;
}

.step-dot.active {
  background: #2ECC71;
  transform: scale(1.2);
}

.step-dot.completed {
  background: #2ECC71;
}

.step-line {
  width: 40px;
  height: 2px;
  background: #E0E0E0;
  transition: all 0.3s ease;
}

.step-line.active {
  background: #2ECC71;
}
```

---

## 4. 步骤1：验证手机号

### 4.1 布局
```
┌─────────────────────────────────────┐
│  📱 手机号                           │
│  [____________]    [发送验证码]     │  ← 验证码按钮
│                                     │
│  🔐 验证码                           │
│  [____]                               │
│                                     │
│  ✅ 60秒后可重新发送                  │  ← 倒计时提示
│                                     │
│        [ 下一步 ]                    │
└─────────────────────────────────────┘
```

### 4.2 验证码按钮
**状态设计：**
- 默认：绿色背景，白色文字
- 倒计时：灰色背景，白色文字，不可点击
- 发送中：显示加载动画

```css
.verification-btn {
  padding: 0 20px;
  height: 56px;
  background: #2ECC71;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.verification-btn:disabled {
  background: #BDC3C7;
  cursor: not-allowed;
}

.verification-btn:active:not(:disabled) {
  transform: scale(0.95);
}
```

### 4.3 验证码输入
- 6位数字输入
- 每位数字独立显示
- 自动聚焦下一个输入框
- 输入完成后自动跳转下一步

```css
.verification-inputs {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.verification-input {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  background: #F8F9FA;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
}

.verification-input:focus {
  border-color: #2ECC71;
  background: #FFFFFF;
}
```

---

## 5. 步骤2：填写个人信息

### 5.1 布局
```
┌─────────────────────────────────────┐
│  👤 头像 (可选)                       │
│     [ + 上传头像 ]                   │  ← 头像上传
│                                     │
│  🏷️ 昵称 (可选)                       │
│  [____________]                      │
│                                     │
│  📝 真实姓名 *                        │
│  [____________]                      │
│                                     │
│  🎓 学号 *                            │
│  [____________]                      │
│                                     │
│        [ 上一步 ]    [ 下一步 ]      │  ← 双按钮
└─────────────────────────────────────┘
```

### 5.2 头像上传
**设计：**
- 默认显示占位符（灰色圆形）
- 点击选择图片
- 预览上传的图片
- 支持裁剪（可选）

```css
.avatar-upload {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #F8F9FA;
  border: 2px dashed #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto 24px;
}

.avatar-upload:hover {
  border-color: #2ECC71;
  background: rgba(46, 204, 113, 0.05);
}

.avatar-upload img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
```

### 5.3 必填标识
- 必填项：红色星号（*）
- 选填项：灰色文字（可选）

```css
.required-mark {
  color: #E74C3C;
  margin-left: 2px;
}

.optional-text {
  color: #7F8C8D;
  font-size: 12px;
  margin-left: 4px;
}
```

---

## 6. 步骤3：设置密码

### 6.1 布局
```
┌─────────────────────────────────────┐
│  🔒 设置密码 *                        │
│  [____________]        👁️          │
│                                     │
│  密码强度: 弱                        │  ← 强度指示器
│  ▫▫▫▫▫                               │
│                                     │
│  🔒 确认密码 *                        │
│  [____________]        👁️          │
│                                     │
│  ✅ 密码必须包含字母和数字             │  ← 提示信息
│  ✅ 密码长度不能少于8位               │
│                                     │
│        [ 上一步 ]    [ 完成 ]        │
└─────────────────────────────────────┘
```

### 6.2 密码强度指示器
**等级：**
- 弱：红色，1个点
- 中：黄色，3个点
- 强：绿色，5个点

```css
.password-strength {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.strength-dot {
  width: 40px;
  height: 6px;
  background: #E0E0E0;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.strength-dot.weak {
  background: #E74C3C;
}

.strength-dot.medium {
  background: #F39C12;
}

.strength-dot.strong {
  background: #2ECC71;
}
```

### 6.3 密码要求提示
- 使用绿色勾选图标（✅）表示已满足
- 使用灰色文字表示默认状态
- 实时更新状态

```css
.password-requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 8px;
}

.password-requirement.met {
  color: #2ECC71;
}

.password-requirement.unmet {
  color: #7F8C8D;
}
```

---

## 7. 交互设计

### 7.1 步骤切换动画
**效果：**从右向左滑入/滑出
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-content {
  animation: slideIn 0.3s ease-out;
}
```

### 7.2 验证码倒计时
- 60秒倒计时
- 每秒更新显示
- 倒计时结束恢复发送按钮

### 7.3 表单验证
- 实时验证
- 失去焦点验证
- 下一步前全面验证

### 7.4 错误提示
- 输入框下方红色文字
- 抖动动画提醒
- 自动聚焦到错误字段

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.input-error {
  animation: shake 0.3s ease;
}
```

---

## 8. 设计规范

### 8.1 按钮规范
- **下一步/完成**：主按钮，全宽，绿色
- **上一步**：次要按钮，灰色背景
- **发送验证码**：辅助按钮，绿色

### 8.2 输入框规范
- 与登录界面完全一致
- 高度：56px
- 圆角：12px
- 边框：2px

### 8.3 颜色规范
```css
/* 主色调 */
--primary-color: #2ECC71;
--primary-dark: #27AE60;

/* 状态色 */
--success-color: #2ECC71;
--warning-color: #F39C12;
--error-color: #E74C3C;
--info-color: #3498DB;

/* 文字色 */
--text-primary: #2C3E50;
--text-secondary: #34495E;
--text-tertiary: #7F8C8D;
```

---

## 9. Docker 兼容性

- 所有资源使用相对路径
- 图片路径：`/images/`
- 图标使用 CDN（Font Awesome）
- CSS 变量便于主题切换

---

## 10. 响应式设计

- 移动端：全屏，无边距
- 平板端：卡片居中
- 桌面端：固定宽度 480px

---

## 11. 设计交付

### 11.1 交付文件
- `register.html` - HTML 结构
- `register.css` - 样式文件
- `register.js` - 交互逻辑
- `register-toast.css` - Toast 提示

### 11.2 设计检查清单
- [x] 风格统一
- [x] 分步清晰
- [x] 交互流畅
- [x] 验证完善
- [x] 响应式适配
- [x] Docker 兼容

---

**设计文档完成日期：2026-02-06**
