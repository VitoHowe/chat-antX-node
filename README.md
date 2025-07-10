<!--
 * @Description:
 * @Version: 2.0
 * @Autor: MyStery
 * @Date: 2025-07-08 23:56:51
 * @LastEditors: MyStery
 * @LastEditTime: 2025-07-10 22:56:29
-->

# Chat AntX Node - AI 聊天代理服务器

这是一个基于 Koa 框架的 Node.js 服务器，用于代理转发 AI 聊天请求到不同的外部 API 服务。

## 功能介绍

- **API 代理转发**：安全地转发请求到不同的 AI API 服务商
- **流式响应支持**：支持 Server-Sent Events (SSE) 流式聊天响应
- **多服务商管理**：支持配置和管理多个 AI API 来源
- **MySQL 数据存储**：使用数据库存储 API 配置和用户信息
- **CORS 跨域支持**：解决前端跨域访问问题
- **安全性**：API 密钥存储在后端，前端无需直接暴露

## 快速开始

1. **环境准备**

   ```bash
   # 确保已安装 Node.js (版本 >= 14)
   node --version
   npm --version
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **数据库配置**

   ```bash
   # 复制配置文件模板
   cp config/db.example.js config/db.js
   # 编辑数据库配置
   # 修改 config/db.js 中的数据库连接信息
   ```

4. **启动服务**

   ```bash
   # 开发模式（自动重启）
   npm run dev

   # 生产模式
   npm start
   ```

5. **验证服务**
   ```bash
   # 访问 http://localhost:3000
   # 测试接口：GET http://localhost:3000/model-sources
   ```

## API 接口说明

### 响应格式

所有 API 接口都使用统一的响应格式：

**成功响应：**

```json
{
  "success": true,
  "data": {
    // 具体的响应数据
  }
}
```

**错误响应：**

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息"
}
```

### 代理接口

#### 1. 获取模型列表

- **URL**: `GET /models?type={type}`
- **参数**:
  - `type`: 模型来源类型 ID（必需）
- **响应示例**:

```json
{
  "success": true,
  "data": {
    "object": "list",
    "data": [
      {
        "id": "gpt-3.5-turbo",
        "object": "model",
        "created": 1677610602,
        "owned_by": "openai"
      }
    ]
  }
}
```

#### 2. 聊天完成接口

- **URL**: `POST /chat/completions?type={type}`
- **参数**:
  - `type`: 模型来源类型 ID（必需）
- **请求体**:

```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ],
  "stream": true // 可选，设置为 true 启用流式响应
}
```

- **普通响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "chatcmpl-123",
    "object": "chat.completion",
    "created": 1677652288,
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "你好！很高兴见到你。"
        },
        "finish_reason": "stop"
      }
    ]
  }
}
```

- **流式响应**: 当 `stream: true` 时，返回 `text/event-stream` 格式的 SSE 流

#### 3. 获取所有模型来源

- **URL**: `GET /model-sources`
- **响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "type": 1,
      "name": "OpenAI",
      "baseUrl": "https://api.openai.com",
      "isActive": true
    }
  ]
}
```

#### 4. 获取单个模型来源

- **URL**: `GET /model-sources/{type}`
- **参数**:
  - `type`: 模型来源类型 ID
- **响应示例**:

```json
{
  "success": true,
  "data": {
    "type": 1,
    "name": "OpenAI",
    "baseUrl": "https://api.openai.com",
    "isActive": true,
    "createdAt": "2025-07-10T12:00:00.000Z",
    "updatedAt": "2025-07-10T12:00:00.000Z"
  }
}
```

### 用户管理接口

- `GET /api/users`：获取所有用户
- `GET /api/users/:id`：获取指定 ID 的用户
- `POST /api/users`：创建新用户
- `PUT /api/users/:id`：更新指定 ID 的用户
- `DELETE /api/users/:id`：删除指定 ID 的用户

## 数据库配置

### 配置文件

数据库连接信息在 `config/db.js` 文件中配置：

```javascript
module.exports = {
  host: "localhost", // 数据库主机地址
  port: 3306, // 数据库端口
  user: "your_username", // 数据库用户名
  password: "your_password", // 数据库密码
  database: "your_database", // 数据库名称
};
```

### 数据表结构

项目会自动创建以下数据表：

#### users 表

- `id`: 主键，自增
- `username`: 用户名，唯一
- `email`: 邮箱
- `password`: 密码（加密存储）
- `created_at`: 创建时间
- `updated_at`: 更新时间

#### model_sources 表

- `id`: 主键，自增
- `type`: 来源类型 ID，唯一
- `name`: 来源名称
- `base_url`: API 基础地址
- `api_key`: API 密钥
- `is_active`: 是否启用
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 项目结构

```
chat-antX-node/
├── app.js                 # 应用入口文件
├── package.json           # 项目依赖配置
├── README.md             # 项目说明文档
├── .gitignore           # Git 忽略文件配置
├── config/              # 配置文件目录
│   ├── db.js           # 数据库配置（需自行创建）
│   └── db.example.js   # 数据库配置示例
├── routes/             # 路由定义目录
│   ├── userRoutes.js   # 用户路由
│   └── proxyRoutes.js  # 代理路由
├── controllers/        # 控制器目录
│   ├── userController.js  # 用户控制器
│   └── proxyController.js # 代理控制器
├── models/            # 数据模型目录
│   ├── user.js        # 用户模型
│   └── modelSource.js # 模型来源模型
└── utils/             # 工具函数目录
    └── database.js    # 数据库连接工具
```

## 技术栈

- **Node.js**: JavaScript 运行环境
- **Koa**: Web 应用框架
- **MySQL**: 关系型数据库
- **node-fetch**: HTTP 请求库（支持流式响应）
- **@koa/cors**: CORS 跨域中间件
- **koa-bodyparser**: 请求体解析中间件
- **koa-router**: 路由中间件
- **nodemon**: 开发时自动重启工具

## 安全特性

1. **API 密钥保护**: 所有外部 API 密钥存储在后端数据库中，前端无法直接访问
2. **配置文件保护**: 敏感配置文件已添加到 `.gitignore`，不会被提交到版本控制
3. **错误处理**: 完善的错误处理机制，避免敏感信息泄露
4. **CORS 控制**: 可配置的跨域访问控制

## 开发说明

### 添加新的 AI API 来源

1. 在数据库的 `model_sources` 表中添加新记录
2. 确保 `type` 字段唯一
3. 配置正确的 `base_url` 和 `api_key`
4. 设置 `is_active` 为 1 启用

### 自定义路由

在 `routes/` 目录下创建新的路由文件，然后在 `app.js` 中注册：

```javascript
const newRoutes = require("./routes/newRoutes");
app.use("/api/new", newRoutes.routes()).use(newRoutes.allowedMethods());
```

## 注意事项

- 确保 MySQL 服务已启动并可连接
- 首次运行时会自动创建必要的数据库表
- 请勿将包含敏感信息的 `config/db.js` 文件提交到 Git 仓库
- 流式响应需要客户端支持 Server-Sent Events (SSE)
- 生产环境建议使用 PM2 等进程管理工具

## 故障排除

### 常见问题

1. **数据库连接失败**

   - 检查 MySQL 服务是否启动
   - 验证 `config/db.js` 中的连接信息
   - 确认数据库用户权限

2. **跨域问题**

   - 确认已安装 `@koa/cors` 中间件
   - 检查 CORS 配置是否正确

3. **流式响应中断**
   - 检查网络连接稳定性
   - 验证外部 API 服务状态
   - 查看控制台错误日志

### 调试模式

开发模式下会输出详细的调试日志，包括：

- 请求参数和响应状态
- 数据库查询结果
- 外部 API 调用信息
- 流式数据传输状态

## 许可证

本项目采用 MIT 许可证。
