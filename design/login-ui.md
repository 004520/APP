# 登录界面 UI 设计文档

## 设计概述

### 1.1 设计风格
- **整体风格**：清新、现代、友好
- **主色调**：翡翠绿 (#2ECC71)
- **辅助色**：
  - 浅蓝 (#667EEA)
  - 白色 (#FFFFFF)
  - 浅灰 (#F8F9FA)
- **设计语言**：卡片式设计，圆角元素

### 1.2 设计原则
1. **一致性**：所有界面风格统一
2. **易用性**：操作简单直观
3. **反馈性**：每个操作都有明确反馈
4. **美观性**：符合现代审美

---

## 2. 登录界面布局

### 2.1 整体结构
```
┌─────────────────────────────────────────┐
│                                         │
│         [Q版小猫装饰 - 动画]            │  ← 顶部装饰区
│                                         │
│      校园交换助手                         │  ← 产品名称
│    让闲置物品流动起来                     │  ← 副标题
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  📱 手机号                        │  │  ← 输入框容器
│  │  [____________]                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🔒 密码                          │  │
│  │  [____________]        👁️        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🎓 学号                          │  │
│  │  [____________]                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│        [ 登 录 ]                        │  ← 主按钮
│                                         │
│    还没有账户？点击注册                   │  ← 绿色链接文字
│                                         │
│       忘记密码？                         │  ← 灰色链接文字
│                                         │
└─────────────────────────────────────────┘
```

---

## 3. 设计规范

### 3.1 颜色系统
```css
/* 主色调 */
--primary-color: #2ECC71;          /* 翡翠绿 */
--primary-light: #58D68D;         /* 浅绿 */
--primary-dark: #27AE60;          /* 深绿 */

/* 背景色 */
--bg-gradient-start: #667EEA;     /* 渐变起始色 - 浅蓝 */
--bg-gradient-end: #764BA2;        /* 渐变结束色 - 紫色 */
--card-bg: #FFFFFF;               /* 卡片背景 */
--input-bg: #F8F9FA;              /* 输入框背景 */

/* 文字色 */
--text-primary: #2C3E50;         /* 主标题 */
--text-secondary: #34495E;       /* 正文 */
--text-tertiary: #7F8C8D;        /* 次要文字 */
--text-link: #2ECC71;            /* 链接文字 */

/* 边框色 */
--border-color: #E0E0E0;         /* 默认边框 */
--border-focus: #2ECC71;         /* 聚焦边框 */

/* 阴影 */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
```

### 3.2 尺寸规范
```css
/* 圆角 */
--radius-sm: 8px;                /* 小圆角 */
--radius-md: 12px;               /* 中圆角 */
--radius-lg: 20px;               /* 大圆角 */
--radius-full: 50px;             /* 全圆 */

/* 间距 */
--space-xs: 8px;                 /* 极小间距 */
--space-sm: 16px;                /* 小间距 */
--space-md: 24px;                /* 中间距 */
--space-lg: 32px;                /* 大间距 */
--space-xl: 48px;                /* 超大间距 */

/* 字体 */
--font-size-xs: 12px;           /* 12px */
--font-size-sm: 14px;           /* 14px */
--font-size-md: 16px;           /* 16px */
--font-size-lg: 18px;           /* 18px */
--font-size-xl: 24px;           /* 24px */
--font-size-2xl: 32px;          /* 32px */
```

---

## 4. 组件设计

### 4.1 背景渐变
```css
.login-bg {
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  min-height: 100vh;
}
```

### 4.2 输入框组件
**状态设计：**
- 默认状态：灰色边框，浅灰背景
- 聚焦状态：绿色边框，白色背景，阴影效果
- 错误状态：红色边框，错误提示
- 禁用状态：灰色边框，灰色背景

**视觉效果：**
```css
.input-group {
  position: relative;
  margin-bottom: var(--space-md);
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-xs);
}

.input-icon {
  font-size: 20px;
}

.input {
  width: 100%;
  height: 56px;
  padding: 0 20px;
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.input:focus {
  border-color: var(--border-focus);
  background: #FFFFFF;
  box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.1);
}

.input.error {
  border-color: #E74C3C;
}

.error-msg {
  color: #E74C3C;
  font-size: var(--font-size-xs);
  margin-top: 4px;
}
```

### 4.3 按钮组件
**设计规范：**
- 主按钮：全宽，绿色背景，白色文字
- 次按钮：透明背景，绿色边框
- 尺寸：高度 56px
- 圆角：12px

**交互效果：**
```css
.btn-primary {
  width: 100%;
  height: 56px;
  background: var(--primary-color);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(46, 204, 113, 0.4);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(46, 204, 113, 0.5);
}

.btn-primary:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 4px 16px rgba(46, 204, 113, 0.3);
}

.btn-primary:disabled {
  background: #BDC3C7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

### 4.4 链接文字
**注册链接：**
- 颜色：绿色 (#2ECC71)
- 字体粗细：500
- 交互：悬停时加深

**忘记密码链接：**
- 颜色：灰色 (#7F8C8D)
- 字体粗细：400
- 交互：悬停时加深

```css
.link-primary {
  color: var(--text-link);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.link-primary:hover {
  color: var(--primary-dark);
}

.link-secondary {
  color: var(--text-tertiary);
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.link-secondary:hover {
  color: var(--text-secondary);
}
```

---

## 5. 动画效果

### 5.1 小猫动画
**设计说明：**
- Q版小猫形象
- 左手握笔，右手持尺
- 轻微左右摇摆动画
- 持续时间：3秒
- 缓动函数：ease-in-out

```css
@keyframes cat-swing {
  0%, 100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

.cat-animation {
  animation: cat-swing 3s ease-in-out infinite;
}
```

### 5.2 输入框聚焦动画
**过渡效果：**
- 边框颜色渐变：0.3秒
- 背景色渐变：0.3秒
- 阴影扩散：0.3秒

### 5.3 按钮点击动画
**效果：**
- 点击时缩放至 98%
- 持续时间：0.15秒
- 缓动函数：ease-out

```css
@keyframes button-click {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}

.btn-click {
  animation: button-click 0.15s ease-out;
}
```

### 5.4 页面切换动画
**方向：**从右向左滑入
```css
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-left {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

.page-enter {
  animation: slide-in-right 0.3s ease-out;
}

.page-exit {
  animation: slide-out-left 0.3s ease-out;
}
```

---

## 6. 响应式设计

### 6.1 移动端适配
- 最小宽度：320px
- 最佳宽度：375px - 414px
- 最大宽度：768px

### 6.2 桌面端适配
- 最大宽度：480px（卡片居中）
- 背景全屏渐变

```css
@media (min-width: 768px) {
  .login-container {
    max-width: 480px;
    margin: 0 auto;
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 60px 40px;
  }
}
```

---

## 7. 交互规范

### 7.1 表单验证
**实时验证：**
- 手机号：输入时实时格式校验
- 密码：失去焦点时强度检测
- 学号：失去焦点时格式校验

**错误提示：**
- 显示位置：输入框下方
- 显示方式：红色文字 + 图标
- 显示时长：持续到用户修改

### 7.2 密码显示/隐藏
**交互设计：**
- 默认状态：密码隐藏（显示 👁️ 图标）
- 点击图标：切换显示/隐藏
- 图标切换：👁️ / 👁️‍🗨️

### 7.3 登录按钮
**状态控制：**
- 所有输入框填写前：禁用状态
- 所有输入框填写且验证通过：启用状态
- 点击登录：显示加载状态
- 登录成功：跳转到主页
- 登录失败：显示错误提示，按钮恢复

### 7.4 加载状态
**按钮加载：**
- 显示加载动画（旋转圈）
- 文字变为"登录中..."
- 禁用点击

```css
@keyframes loading-spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-loading .spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: loading-spin 0.8s linear infinite;
  display: inline-block;
  margin-right: 8px;
}
```

---

## 8. 图标资源

### 8.1 图标选择
使用开源图标库：
- Font Awesome 6：https://fontawesome.com/
- Heroicons：https://heroicons.com/
- Feather Icons：https://feathericons.com/

### 8.2 所需图标
```
📱 手机号  - phone-mobile / smartphone
🔒 密码    - lock / lock-closed
👁️ 显示密码 - eye / eye-off
🎓 学号    - graduation-cap / academic-cap
✅ 成功    - check-circle
❌ 错误    - x-circle / times-circle
```

### 8.3 小猫素材
**资源来源：**
- Open Doodles：https://opendoodles.com/
- Humaaans：https://www.humaaans.com/
- Undraw：https://undraw.co/illustrations

**要求：**
- Q版风格
- 持笔和尺子
- 透明背景 PNG
- 尺寸：200x200px

---

## 9. Docker 兼容性

### 9.1 资源路径
所有图片、图标使用相对路径：
```
/images/cat.png
/images/icons/phone.svg
```

### 9.2 样式隔离
使用 CSS 变量便于主题切换：
```css
:root {
  --primary-color: #2ECC71;
}
```

---

## 10. 设计交付

### 10.1 交付文件
- `login-page.html` - HTML 结构
- `login-page.css` - 样式文件
- `login-page.js` - 交互逻辑
- `/images/` - 图片资源

### 10.2 设计稿尺寸
- 设计稿宽度：375px
- 设计稿高度：812px
- 分辨率：2x (@2x)

---

## 11. 设计检查清单

- [x] 风格统一
- [x] 交互友好
- [x] 响应式适配
- [x] 动画流畅
- [x] 错误提示清晰
- [x] 加载状态明确
- [x] 表单验证完善
- [x] Docker 兼容

---

**设计文档完成日期：2026-02-06**
