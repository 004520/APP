# 校园交换助手 - 云端开发过程文档

## 项目概述
**项目名称**：校园交换助手
**开发平台**：Web应用（移动端优先）+ 腾讯云CloudBase云开发
**开发开始时间**：2026-02-19

---

## 开发环境配置

### 1. 云开发环境准备

#### 1.1 CloudBase环境初始化
- **目标**：连接腾讯云CloudBase，创建云开发环境
- **状态**：✅ 已完成
- **创建时间**：2026-02-19 11:50:08
- **说明**：
  - 已成功登录CloudBase控制台
  - 已创建云开发环境（体验版）
  - 已获取环境ID

#### 1.2 环境信息记录
```
环境ID：app004520-2gnr9yy23c0f3ed9
环境别名：app004520
环境区域：ap-shanghai（上海）
环境状态：NORMAL（正常运行）
套餐类型：体验版（baas_trial）
数据库实例ID：tnt-7knxdp69q
云存储Bucket：6170-app004520-2gnr9yy23c0f3ed9-1398550543
CDN域名：6170-app004520-2gnr9yy23c0f3ed9-1398550543.tcb.qcloud.la
静态托管域名：app004520-2gnr9yy23c0f3ed9-1398550543.tcloudbaseapp.com
```

---

## 数据库设计

### 2. NoSQL数据库结构设计

#### 2.1 数据库选择
- **数据库类型**：CloudBase NoSQL数据库（类MongoDB）
- **原因**：
  - 与前端JavaScript天然契合
  - 云开发内置支持，无需额外配置
  - 支持实时数据库功能
  - 自动处理分片和索引

#### 2.2 数据集合设计

**集合1：users（用户表）**
```json
{
  "_id": "自动生成的用户ID",
  "_openid": "用户唯一标识（云开发自动生成）",
  "phone": "手机号",
  "password": "加密后的密码",
  "nickname": "昵称",
  "name": "真实姓名",
  "studentId": "学号",
  "avatar": "头像URL",
  "gender": "性别（男/女/保密）",
  "creditScore": 95,
  "soldCount": 0,
  "defaultLocation": {
    "latitude": 30.123,
    "longitude": 120.456,
    "address": "东区图书馆"
  },
  "defaultExpiryDays": 3,
  "notificationEnabled": true,
  "createdAt": "创建时间（时间戳）",
  "lastLoginAt": "最后登录时间（时间戳）",
  "status": "状态（active/banned）"
}
```

**索引设计**：
- `phone`：唯一索引（用于登录）
- `studentId`：唯一索引（用于身份验证）

**安全规则**：
```javascript
// 用户只能读写自己的数据
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}
```

---

**集合2：products（商品表）**
```json
{
  "_id": "自动生成的商品ID",
  "sellerId": "卖家ID",
  "sellerOpenid": "卖家的_openid",
  "title": "商品名称",
  "description": "商品描述",
  "price": 199.00,
  "images": ["图片URL1", "图片URL2"],
  "category": "分类（数码/图书/日用/运动）",
  "condition": "商品成色（全新/九成新/八成新）",
  "status": "状态（在售/已售/已下架）",
  "views": 0,
  "likes": 0,
  "transactionTime": "2025-02-10T14:00:00",
  "transactionLocation": {
    "latitude": 30.123,
    "longitude": 120.456,
    "address": "东区图书馆一楼"
  },
  "createdAt": "创建时间（时间戳）",
  "updatedAt": "更新时间（时间戳）",
  "expiryTime": "过期时间（时间戳）"
}
```

**索引设计**：
- `sellerId`：索引（用于查询用户的商品）
- `status` + `createdAt`：复合索引（用于查询在售商品）
- `category` + `createdAt`：复合索引（用于分类查询）

**安全规则**：
```javascript
// 所有人可读，卖家可写自己的商品
{
  "read": true,
  "write": "auth.openid == doc.sellerOpenid"
}
```

---

**集合3：orders（订单表）**
```json
{
  "_id": "自动生成的订单ID",
  "productId": "商品ID",
  "buyerId": "买家ID",
  "buyerOpenid": "买家的_openid",
  "sellerId": "卖家ID",
  "sellerOpenid": "卖家的_openid",
  "status": "状态（待确认/即将交易/已完成/已取消）",
  "transactionTime": "2025-02-10T14:00:00",
  "transactionLocation": {
    "latitude": 30.123,
    "longitude": 120.456,
    "address": "东区图书馆一楼"
  },
  "createdAt": "创建时间（时间戳）",
  "completedAt": "完成时间（时间戳）",
  "cancelledAt": "取消时间（时间戳）",
  "cancelReason": "取消原因"
}
```

**索引设计**：
- `buyerId` + `createdAt`：复合索引（查询买家订单）
- `sellerId` + `createdAt`：复合索引（查询卖家订单）
- `status` + `transactionTime`：复合索引（查询即将交易的订单）

**安全规则**：
```javascript
// 买家和卖家都可以读写订单
{
  "read": "auth.openid == doc.buyerOpenid || auth.openid == doc.sellerOpenid",
  "write": "auth.openid == doc.buyerOpenid || auth.openid == doc.sellerOpenid"
}
```

---

**集合4：messages（消息表）**
```json
{
  "_id": "自动生成的消息ID",
  "productId": "商品ID",
  "senderId": "发送者ID",
  "senderOpenid": "发送者的_openid",
  "receiverId": "接收者ID",
  "receiverOpenid": "接收者的_openid",
  "type": "消息类型（text/image/location/product）",
  "content": "消息内容",
  "isRead": false,
  "createdAt": "发送时间（时间戳）"
}
```

**索引设计**：
- `senderOpenid` + `createdAt`：复合索引（查询发送的消息）
- `receiverOpenid` + `createdAt`：复合索引（查询接收的消息）
- `productId` + `createdAt`：复合索引（查询商品相关的消息）

**安全规则**：
```javascript
// 发送者和接收者都可以读写消息
{
  "read": "auth.openid == doc.senderOpenid || auth.openid == doc.receiverOpenid",
  "write": "auth.openid == doc.senderOpenid || auth.openid == doc.receiverOpenid"
}
```

---

## 云函数开发

### 3. 云函数设计与实现

#### 3.1 云函数列表

**云函数1：login（用户登录）**
```javascript
// 功能：用户登录验证
// 入参：{ phone, password }
// 返回：{ success, token, userInfo }
// 状态：待开发
```

**云函数2：register（用户注册）**
```javascript
// 功能：新用户注册
// 入参：{ phone, password, name, studentId, nickname }
// 返回：{ success, message, userInfo }
// 状态：待开发
```

**云函数3：createProduct（创建商品）**
```javascript
// 功能：发布新商品
// 入参：{ title, description, price, images, category, condition, transactionTime, transactionLocation }
// 返回：{ success, message, productId }
// 状态：待开发
```

**云函数4：updateProduct（更新商品）**
```javascript
// 功能：修改商品信息
// 入参：{ productId, ...updateData }
// 返回：{ success, message }
// 状态：待开发
```

**云函数5：createOrder（创建订单）**
```javascript
// 功能：买家下单
// 入参：{ productId }
// 返回：{ success, message, orderId }
// 状态：待开发
```

**云函数6：confirmOrder（确认订单）**
```javascript
// 功能：卖家确认交易
// 入参：{ orderId, transactionTime, transactionLocation }
// 返回：{ success, message }
// 状态：待开发
```

**云函数7：sendMessage（发送消息）**
```javascript
// 功能：发送聊天消息
// 入参：{ productId, receiverId, type, content }
// 返回：{ success, messageId }
// 状态：待开发
```

**云函数8：uploadImage（上传图片）**
```javascript
// 功能：上传商品图片到云存储
// 入参：{ file, category }
// 返回：{ success, imageUrl }
// 状态：待开发
```

---

## 云存储配置

### 4. 文件存储设计

#### 4.1 存储桶结构
```
cloud-storage/
├── avatars/              # 用户头像
├── products/             # 商品图片
└── chat/                 # 聊天图片
```

#### 4.2 存储权限配置
```javascript
{
  "read": true,
  "write": "auth != null"
}
```

#### 4.3 图片限制
- 用户头像：最大2MB，支持JPG/PNG
- 商品图片：最大5MB，支持JPG/PNG，最多9张
- 聊天图片：最大3MB，支持JPG/PNG

---

## 前端集成

### 5. CloudBase SDK集成

#### 5.1 SDK引入
```html
<!-- 引入CloudBase Web SDK -->
<script src="https://static.cloudbase.net/cloudbase-js-sdk/8.10.3/cloudbase.full.js"></script>
```

#### 5.2 初始化配置
```javascript
// 配置信息（待获取）
const config = {
  envId: 'your-env-id',  // 云开发环境ID
};

// 初始化CloudBase
const app = cloudbase.init(config);
```

#### 5.3 数据库操作示例
```javascript
// 查询用户信息
async function getUserInfo(openid) {
  const db = app.database();
  const result = await db.collection('users')
    .where({ _openid: openid })
    .get();
  return result.data[0];
}

// 创建商品
async function createProduct(productData) {
  const db = app.database();
  const result = await db.collection('products').add({
    ...productData,
    createdAt: Date.now(),
    status: '在售'
  });
  return result.id;
}
```

---

## 开发进度追踪

### 6. 开发阶段与完成情况

| 阶段 | 任务 | 状态 | 完成时间 | 备注 |
|------|------|------|----------|------|
| 阶段1 | CloudBase环境创建 | ✅ 已完成 | 2026-02-19 | 环境ID: app004520-2gnr9yy23c0f3ed9 |
| 阶段2 | 数据库结构设计 | ✅ 已完成 | 2026-02-19 | 已完成设计方案 |
| 阶段3 | 数据库创建与安全规则配置 | ✅ 已完成 | 2026-02-19 | 已创建4个集合，配置索引和安全规则 |
| 阶段4 | 云函数开发（登录注册） | ✅ 已完成 | 2026-02-19 | 已部署login和register函数 |
| 阶段5 | 云函数开发（商品管理） | ✅ 已完成 | 2026-02-19 | 已部署createProduct和updateProduct函数 |
| 阶段6 | 云函数开发（订单管理） | ✅ 已完成 | 2026-02-19 | 已部署createOrder和confirmOrder函数 |
| 阶段7 | 云函数开发（消息系统） | ✅ 已完成 | 2026-02-19 | 已部署sendMessage函数 |
| 阶段8 | 云函数开发（文件上传） | ✅ 已完成 | 2026-02-19 | 已部署uploadImage函数 |
| 阶段9 | 云存储配置 | ⚠️ 部分完成 | 2026-02-19 | 体验版不支持自定义存储规则 |
| 阶段10 | 前端SDK集成 | 待开始 | - | - |
| 阶段11 | 前后端联调 | 待开始 | - | - |
| 阶段12 | 静态网站托管部署 | 待开始 | - | - |
| 阶段13 | 测试与优化 | 待开始 | - | - |

---

## 遇到的问题与解决方案

### 7. 问题记录

#### 问题1：CloudBase账号未创建
- **时间**：2026-02-19
- **描述**：尝试连接CloudBase时提示"user not exist"
- **原因**：尚未注册腾讯云CloudBase服务
- **解决方案**：
  1. 访问腾讯云官网注册账号
  2. 开通CloudBase云开发服务
  3. 创建免费或付费环境
- **状态**：✅ 已解决 - 用户已创建环境

#### 问题2：云存储自定义规则限制
- **时间**：2026-02-19
- **描述**：尝试设置云存储安全规则时提示"当前套餐无法执行此操作"
- **原因**：体验版套餐不支持自定义存储规则
- **解决方案**：使用默认存储规则（所有用户可读，登录用户可写）
- **状态**：✅ 已接受限制 - 使用默认规则

---

## GitHub仓库同步

### 8. 版本控制管理

#### 8.1 仓库信息
- **仓库名称**：campus-exchange-assistant
- **仓库类型**：公开/私有（待确认）
- **仓库URL**：(待创建)

#### 8.2 提交历史
```bash
# 初始提交（待执行）
git init
git add .
git commit -m "Initial commit: 校园交换助手项目"

# 创建云端开发文档（已执行）
git add design/cloud-development.md
git commit -m "Add: 云端开发过程文档"

# 待执行：连接GitHub仓库
git remote add origin [repository-url]
git branch -M main
git push -u origin main
```

---

## 后续计划

### 9. 下一步行动

1. **立即执行**：
   - [ ] 用户注册CloudBase账号
   - [ ] 创建CloudBase环境
   - [ ] 获取环境ID（envId）

2. **等待envId后**：
   - [ ] 创建数据库集合（users、products、orders、messages）
   - [ ] 配置数据库安全规则
   - [ ] 初始化前端SDK配置

3. **数据库配置完成后**：
   - [ ] 开发云函数（优先登录注册）
   - [ ] 配置云存储
   - [ ] 前后端集成

4. **开发完成后**：
   - [ ] 部署到CloudBase静态网站托管
   - [ ] 测试完整流程
   - [ ] 性能优化

---

## 参考资料

### 10. 相关文档链接

- [CloudBase官方文档](https://cloud.tencent.com/document/product/876)
- [CloudBase数据库文档](https://cloud.tencent.com/document/product/876/41696)
- [CloudBase云函数文档](https://cloud.tencent.com/document/product/876/48470)
- [CloudBase云存储文档](https://cloud.tencent.com/document/product/876/41326)
- [CloudBase静态网站托管](https://cloud.tencent.com/document/product/876/44778)

---

## 变更日志

### 11. 文档版本历史

| 版本 | 日期 | 修改内容 | 修改人 |
|------|------|----------|--------|
| v1.0 | 2026-02-19 | 创建云端开发过程文档，完成数据库设计 | AI Assistant |

---

**文档结束**
