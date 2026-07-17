# 校园二手交易平台

<p align="center">
  <img src="https://img.shields.io/badge/Taro-4.0.8-blue?logo=wechat" alt="Taro 4.0.8">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react" alt="React 18">
  <img src="https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs" alt="Node.js Express">
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</p>

> 一款面向高校学生的微信小程序二手交易平台，支持商品发布、在线砍价、实时聊天、钱包支付、订单管理等功能。

---

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [API 概览](#api-概览)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 项目简介

本项目是一个完整的校园二手交易解决方案，包含：

- **微信小程序端**：基于 Taro + React 开发的跨端小程序，提供流畅的移动端交易体验。
- **后端服务**：基于 Node.js + Express + Socket.IO + MongoDB 的 RESTful API 与实时消息服务。

旨在帮助学生方便地发布闲置物品、进行价格协商、在线沟通并完成交易。

---

## 功能特性

### 用户端

- 🔐 微信一键登录
- 🏠 首页商品瀑布流浏览
- 🔍 分类筛选与关键词搜索
- 🛒 购物车与一键下单
- 💬 买家/卖家实时聊天
- 💰 钱包余额支付与充值
- 🪓 在线砍价
- ⭐ 商品收藏与浏览历史
- 🔔 消息通知中心

### 卖家端

- 📝 商品发布与编辑
- 📦 已发布商品管理
- 💳 订单管理与收款
- 📊 个人钱包与收支明细

### 平台能力

- ⚡ Socket.IO 实时消息推送
- 🖼️ 图片上传与 base64 处理
- 🔒 JWT 身份认证
- 🛡️ 商品举报与审核机制
- 📱 响应式微信小程序界面

---

## 技术栈

### 前端

| 技术 | 说明 |
|------|------|
| [Taro 4](https://docs.taro.zone/) | 开放式跨端跨框架解决方案 |
| [React 18](https://react.dev/) | 用户界面构建库 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全的 JavaScript |
| [Zustand](https://github.com/pmndrs/zustand) | 轻量级状态管理 |
| [SCSS](https://sass-lang.com/) | CSS 预处理器 |

### 后端

| 技术 | 说明 |
|------|------|
| [Node.js](https://nodejs.org/) | JavaScript 运行时 |
| [Express](https://expressjs.com/) | Web 应用框架 |
| [Socket.IO](https://socket.io/) | 实时双向通信 |
| [MongoDB](https://www.mongodb.com/) | 文档型数据库 |
| [Mongoose](https://mongoosejs.com/) | MongoDB ODM |
| [JWT](https://jwt.io/) | 用户认证 |
| [tsx](https://github.com/privatenumber/tsx) | TypeScript 执行器 |

---

## 项目结构

```
campus-trading/
├── assets/                  # 静态资源（图标、图片）
├── config/                  # Taro 构建配置
├── scripts/                 # 构建脚本
├── server/                  # 后端服务
│   ├── src/
│   │   ├── index.ts         # 服务入口
│   │   ├── models/          # Mongoose 数据模型
│   │   ├── routes/          # REST API 路由
│   │   ├── socket/          # Socket.IO 实时通信
│   │   ├── middleware/      # 认证等中间件
│   │   └── utils/           # 工具函数
│   ├── .env.example         # 环境变量模板
│   └── package.json
├── src/                     # 小程序前端源码
│   ├── pages/               # 页面（按功能模块划分）
│   ├── services/            # API 请求服务
│   ├── stores/              # Zustand 状态管理
│   ├── constants/           # 常量定义
│   ├── types/               # TypeScript 类型
│   └── utils/               # 前端工具函数
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

---

## 快速开始

### 前置要求

- Node.js >= 18
- npm 或 pnpm
- 本地 MongoDB 实例（或远程 MongoDB Atlas）
- 微信开发者工具（用于预览小程序）

### 1. 克隆项目

```bash
git clone https://github.com/15979257438/sql-.git
cd sql-
```

### 2. 安装前端依赖

```bash
npm install
```

### 3. 安装并启动后端

```bash
cd server
cp .env.example .env
# 编辑 .env，填入 MongoDB 连接地址与微信小程序 AppID/Secret
npm install
npm run dev
```

后端服务默认运行在 http://localhost:4000。

### 4. 启动小程序开发

```bash
# 在项目根目录
npm run dev:weapp
```

使用微信开发者工具导入项目根目录，预览小程序。

---

## 环境变量

后端环境变量配置（`server/.env`）：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | `4000` |
| `MONGODB_URI` | MongoDB 连接地址 | `mongodb://localhost:27017/campus_trading` |
| `JWT_SECRET` | JWT 签名密钥 | 必填，生产环境请使用强随机字符串 |
| `WECHAT_APPID` | 微信小程序 AppID | 必填 |
| `WECHAT_SECRET` | 微信小程序 Secret | 必填 |
| `WECHAT_MCH_ID` | 微信支付商户号 | 可选 |
| `WECHAT_API_KEY` | 微信支付 API 密钥 | 可选 |
| `WECHAT_NOTIFY_URL` | 微信支付回调地址 | 可选 |

---

## API 概览

完整 API 文档请参阅 [server/README.md](./server/README.md)。

主要接口：

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/auth/wechat` | 微信登录 |
| `GET` | `/api/users/me` | 当前用户信息 |
| `GET` | `/api/products` | 商品列表 |
| `POST` | `/api/products` | 发布商品 |
| `GET` | `/api/orders` | 订单列表 |
| `POST` | `/api/orders` | 创建订单 |
| `POST` | `/api/orders/:id/pay` | 余额支付 |
| `GET` | `/api/wallet` | 钱包信息 |
| `GET` | `/api/chats/conversations` | 会话列表 |
| `POST` | `/api/chats/conversations/:id/messages` | 发送消息 |
| `POST` | `/api/upload/image` | 图片上传 |

### 实时消息事件

- `join_conversation` / `leave_conversation` — 加入/离开会话
- `send_message` — 发送消息
- `mark_read` — 标记已读
- `message` — 新消息推送
- `conversation_updated` — 会话更新

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/xxx`
3. 提交更改：`git commit -m 'feat: add xxx'`
4. 推送分支：`git push origin feature/xxx`
5. 创建 Pull Request

---

## 许可证

本项目基于 [MIT License](./LICENSE) 开源。

---

<p align="center">Made with ❤️ for campus life.</p>
