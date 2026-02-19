# 版本记录

## 版本号规则

- **main 分支**：主版本号，如 1, 2, 3
- **develop 分支**：次版本号，如 1.1, 1.2
- **feature/fix 分支**：修订版本号，如 1.2.1

## 版本历史

### v1.0
**分支**: main
**日期**: 2026-02-06
**描述**: 初始化项目仓库

**实现功能**:
- 初始化 Git 仓库
- 配置 GitHub 远程仓库
- 创建版本记录文档

---

### v1.1
**分支**: develop
**日期**: 2026-02-06
**描述**: 登录界面 UI 设计

**实现功能**:
- 完成登录界面 UI 设计文档
- 实现 HTML、CSS、JS 前端代码
- 添加表单验证逻辑
- 实现密码显示/隐藏功能
- 添加加载状态和错误提示
- 设计动画效果（小猫摇摆、页面切换）
- 响应式布局适配

**技术实现**:
- 使用 CSS 变量便于主题定制
- 集成 Font Awesome 图标库
- 实现实时表单验证
- Docker 兼容性设计

---

### v1.2
**分支**: develop
**日期**: 2026-02-06
**描述**: 注册界面 UI 设计

**实现功能**:
- 完成注册界面 UI 设计文档
- 实现分步注册流程（3个步骤）
- 步骤1：手机号验证 + 验证码
- 步骤2：个人信息填写（头像、昵称、姓名、学号）
- 步骤3：密码设置 + 强度检测
- 添加步骤进度指示器
- 实现验证码倒计时功能
- 头像上传与预览功能
- 密码强度实时显示
- 密码要求提示（长度、字母、数字）
- 流畅的步骤切换动画

**技术实现**:
- 分步引导降低用户认知负担
- 实时验证所有输入字段
- 验证码6位独立输入框
- 头像上传前预览
- 响应式布局适配
- 与登录界面风格统一

---

### v1.3
**分支**: feature/login-ui
**日期**: 2026-02-19
**描述**: UI开发完成 + 云端开发准备

**实现功能**:
- 完成主菜单界面（底部导航栏）
- 完成商城页面UI
- 完成在售模块（商品列表、添加商品、删除功能）
- 完成购物车模块（商品列表、数量调整、结算）
- 完成待办页面
- 完成设置页面（个人信息、账号安全、退出登录）
- 完成个人资料页面
- 完成地址管理页面
- 完成修改密码页面
- 完成修改手机号页面
- 完成所有页面的样式优化
- 修复多个UI问题（按钮点击、导航跳转、对齐等）
- 完善退出登录功能（清除本地数据、跳转登录页）

**UI优化**:
- 统一全局设计规范（颜色、圆角、阴影）
- 添加空状态提示
- 优化按钮点击体验
- 修复CSS样式冲突
- 添加动画效果

**技术实现**:
- localStorage数据持久化
- 统一的Toast提示组件
- 模块化CSS管理
- 统一的JavaScript函数命名

---

### v1.4
**分支**: feature/login-ui
**日期**: 2026-02-19
**描述**: 云端开发文档创建

**实现功能**:
- 创建云端开发过程文档（cloud-development.md）
- 完成CloudBase数据库结构设计（users、products、orders、messages）
- 设计数据库索引和安全规则
- 规划云函数列表（登录、注册、商品管理、订单管理、消息系统）
- 设计云存储结构
- 规划前端SDK集成方案
- 记录开发进度和问题
- 准备连接CloudBase环境

**下一步**:
- 注册CloudBase账号
- 创建CloudBase环境
- 初始化数据库集合
- 开发云函数
- 前后端集成

---

### v1.5
**分支**: feature/login-ui
**日期**: 2026-02-19
**描述**: CloudBase云端开发完成

**实现功能**:
- CloudBase环境连接成功
- 环境ID：app004520-2gnr9yy23c0f3ed9
- 数据库集合创建（users、products、orders、messages）
- 数据库索引配置
- 数据库安全规则配置
- 云函数开发与部署（8个函数）：
  - login（用户登录）
  - register（用户注册）
  - createProduct（创建商品）
  - updateProduct（更新商品）
  - createOrder（创建订单）
  - confirmOrder（确认订单）
  - sendMessage（发送消息）
  - uploadImage（上传图片）

**CloudBase配置**:
- 数据库实例：tnt-7knxdp69q
- 云存储Bucket：6170-app004520-2gnr9yy23c0f3ed9-1398550543
- CDN域名：6170-app004520-2gnr9yy23c0f3ed9-1398550543.tcb.qcloud.la
- 静态托管域名：app004520-2gnr9yy23c0f3ed9-1398550543.tcloudbaseapp.com
- 运行环境：Node.js 18.15

**技术实现**:
- NoSQL数据库配置
- 云函数开发（Node.js）
- 数据库安全规则配置
- 云存储集成

**下一步**:
- 前端CloudBase SDK集成
- 前后端API对接
- 静态网站托管部署
- 完整流程测试

---

### v1.7
**分支**: feature/login-ui
**日期**: 2026-02-19
**描述**: CloudBase SDK集成（第二阶段完成）

**实现功能**:
- 主菜单页面集成CloudBase SDK
- 在售页面集成CloudBase SDK
- 购物车页面集成CloudBase SDK
- 个人资料页面集成CloudBase SDK
- 商品列表从CloudBase数据库加载
- 商品发布对接createProduct云函数
- 商品图片上传对接uploadImage云函数
- 购物车结算对接createOrder云函数
- 个人资料保存对接数据库更新

**已对接云函数**:
- login（用户登录）✓
- register（用户注册）✓
- createProduct（创建商品）✓
- updateProduct（更新商品）- 待对接
- createOrder（创建订单）✓
- confirmOrder（确认订单）- 待对接
- sendMessage（发送消息）- 待对接
- uploadImage（上传图片）✓

**数据库操作**:
- products集合：查询、创建
- users集合：更新
- orders集合：创建

**下一步**:
- 待办页面集成订单管理
- 消息页面集成消息系统
- 设置页面完善用户信息加载
- 全部页面统一用户状态检查
- 静态网站托管部署

---

### v1.6
**分支**: feature/login-ui
**日期**: 2026-02-19
**描述**: CloudBase SDK集成（第一阶段）

**实现功能**:
- 创建CloudBase SDK配置文件（cloudbase-config.js）
- 创建CloudBase SDK初始化文件（cloudbase.js）
- 登录页面集成CloudBase SDK
- 注册页面集成CloudBase SDK
- 登录功能对接login云函数
- 注册功能对接register云函数
- 用户信息保存到localStorage

**技术实现**:
- CloudBase Web SDK引入（8.10.3版本）
- 云函数调用封装
- 数据库连接配置
- 用户状态管理

**已对接云函数**:
- login（用户登录）
- register（用户注册）

**待对接云函数**:
- createProduct（创建商品）
- updateProduct（更新商品）
- createOrder（创建订单）
- confirmOrder（确认订单）
- sendMessage（发送消息）
- uploadImage（上传图片）

**下一步**:
- 在售模块集成商品管理云函数
- 购物车模块集成订单云函数
- 消息功能集成消息云函数
- 图片上传功能集成上传云函数

---
