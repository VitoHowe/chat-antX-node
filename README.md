# Koa 服务器项目

这是一个基于 Koa 框架的服务器项目，连接 MySQL 数据库。

## 功能介绍

- 提供基本的 Web API 服务
- 连接 MySQL 数据库实现数据存储
- 支持基本的增删改查操作

## 如何使用

1. 确保已安装 Node.js 环境
2. 安装依赖：`npm install`
3. 启动服务：`npm start`

## 项目结构

- `app.js`：应用入口文件
- `config/`：配置文件目录
- `routes/`：路由定义目录
- `controllers/`：控制器目录
- `models/`：数据模型目录

## API 接口说明

### 用户相关接口

- `GET /api/users`：获取所有用户
- `GET /api/users/:id`：获取指定 ID 的用户
- `POST /api/users`：创建新用户
- `PUT /api/users/:id`：更新指定 ID 的用户
- `DELETE /api/users/:id`：删除指定 ID 的用户

## 数据库配置

数据库连接信息在`.env`文件中配置，包括：

- 主机地址
- 端口号
- 用户名
- 密码
- 数据库名称

## 注意事项

- 确保 MySQL 服务已启动
- 确保数据库连接信息正确
- 首次使用需创建必要的数据库表结构
