# CloudBase 静态托管部署指南

## 前置条件
- CloudBase环境已创建（环境ID: app004520-2gnr9yy23c0f3ed9）
- CloudBase CLI已安装
- 项目已构建完成

## 本地部署

### 1. 安装CloudBase CLI
```bash
npm install -g @cloudbase/cli
```

### 2. 登录CloudBase
```bash
cloudbase login
```

### 3. 部署到静态托管
```bash
# 进入ui-design目录
cd ui-design

# 部署
cloudbase hosting:deploy
```

## 在线部署

### 通过CloudBase控制台部署

1. 访问 CloudBase 控制台：https://tcb.cloud.tencent.com/dev?envId=app004520-2gnr9yy23c0f3ed9#/static-hosting

2. 点击"静态网站托管"

3. 创建新部署：
   - 填写部署名称
   - 上传ui-design目录下的所有文件
   - 设置默认索引页面为index.html或login.html

4. 部署成功后，获得访问URL

### 访问地址

部署成功后，可通过以下地址访问：
```
https://app004520-2gnr9yy23c0f3ed9-1398550543.tcloudbaseapp.com
```

## 部署注意事项

### 文件结构
```
ui-design/
├── index.html (创建一个默认首页，重定向到login.html)
├── login.html
├── register.html
├── main-menu.html
├── selling.html
├── cart.html
├── product-detail.html
├── messages.html
├── todo.html
├── settings.html
├── profile.html
├── change-password.html
├── change-phone.html
├── address.html
├── *.css (所有样式文件)
└── js/
    ├── cloudbase-config.js
    └── cloudbase.js
```

### 推荐配置

1. **域名配置**：在静态托管中绑定自定义域名
2. **HTTPS支持**：CloudBase自动提供HTTPS
3. **CDN加速**：内容自动分发到CDN节点
4. **缓存配置**：设置合理的缓存策略
5. **错误页面**：配置404、500等自定义错误页面

## 故障排查

### 部署失败
1. 检查网络连接
2. 确认CloudBase环境ID正确
3. 验证文件路径是否正确
4. 检查文件大小是否超过限制（单文件20MB）

### 访问异常
1. 检查域名解析
2. 确认CORS配置
3. 查看部署日志
4. 验证静态网站托管状态

### 云函数调用失败
1. 检查环境ID配置是否正确
2. 确认云函数已部署
3. 验证SDK版本兼容性
4. 查看云函数日志

## 性能优化

### 前端优化
1. 压缩CSS和JS文件
2. 优化图片大小
3. 使用CDN加载外部资源
4. 启用浏览器缓存

### CloudBase优化
1. 启用CDN加速
2. 配置合理的缓存时间
3. 使用云存储分发大文件
4. 优化数据库查询

## 版本历史

| 版本 | 日期 | 描述 |
|------|------|------|
| v1.0 | 2026-02-06 | 项目初始化 |
| v1.1 | 2026-02-06 | 登录UI设计 |
| v1.2 | 2026-02-06 | 注册UI设计 |
| v1.3 | 2026-02-19 | UI开发完成 |
| v1.4 | 2026-02-19 | 云端开发文档 |
| v1.5 | 2026-02-19 | CloudBase云端开发完成 |
| v1.6 | 2026-02-19 | SDK集成第一阶段 |
| v1.7 | 2026-02-19 | SDK集成第二阶段 |
| v1.8 | 2026-02-19 | SDK集成完成 |
| v1.9 | 2026-02-19 | 完整功能实现 |
