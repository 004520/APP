# 登录界面 UI 资源说明

## 图片资源需求

### 1. 小猫装饰图片

**文件路径**: `/images/cat.png`

**规格要求**:
- 尺寸: 200x200px
- 格式: PNG（透明背景）
- 风格: Q版可爱风格
- 内容: 小猫形象，左手握笔，右手持尺子

**推荐资源**:
- Open Doodles: https://opendoodles.com/
- Humaaans: https://www.humaaans.com/
- Undraw: https://undraw.co/illustrations

**临时解决方案**:
如果暂时没有合适的图片，可以使用占位符：
```html
<!-- 使用 emoji 占位 -->
<div class="cat-animation">
  <div class="cat-placeholder">🐱✏️📏</div>
</div>
```

或使用在线占位图服务：
```html
<img src="https://via.placeholder.com/200x200/2ECC71/FFFFFF?text=Cat+Logo" alt="小猫装饰">
```

---

## 使用说明

### 快速预览

1. 将 `login.html`、`login.css`、`login.js` 和 `login-toast.css` 放在同一目录
2. 在 `login.html` 中引入样式文件：
   ```html
   <link rel="stylesheet" href="login.css">
   <link rel="stylesheet" href="login-toast.css">
   ```
3. 确保有 `/images/cat.png` 图片文件
4. 在浏览器中打开 `login.html`

### 自定义配置

#### 修改主题颜色
在 `login.css` 中的 `:root` 部分修改 CSS 变量：
```css
:root {
  --primary-color: #2ECC71;  /* 修改为你喜欢的颜色 */
  --bg-gradient-start: #667EEA;
  --bg-gradient-end: #764BA2;
}
```

#### 修改小猫图片
在 `login.html` 中修改图片路径：
```html
<img src="/your/custom/path/cat.png" alt="小猫装饰">
```

---

## 浏览器兼容性

### 支持的浏览器
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 不支持的特性
- IE 不支持
- 旧版移动浏览器可能不完全支持渐变和动画

---

## 响应式断点

- 移动端: < 768px
- 平板端: 768px - 1024px
- 桌面端: > 1024px

---

## Docker 兼容性

所有资源使用相对路径，可直接在 Docker 容器中运行：

```dockerfile
FROM nginx:alpine
COPY ui-design/ /usr/share/nginx/html/
```

---

## 后续开发建议

1. 添加更多输入验证规则
2. 集成真实的登录 API
3. 添加记住密码功能
4. 支持第三方登录（微信、QQ等）
5. 添加加载骨架屏

---

**更新日期**: 2026-02-06
