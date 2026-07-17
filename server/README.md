# 校园二手交易平台后端

Node.js + Express + Socket.IO + MongoDB 后端服务。

## 快速开始

1. 安装依赖
```bash
cd server
npm install
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env，填写 MongoDB 连接地址与微信小程序 AppID/Secret
```

3. 启动 MongoDB（本地）
```bash
# 确保本地已安装并启动 MongoDB，默认监听 mongodb://localhost:27017
```

4. 启动服务
```bash
npm run dev
```

服务默认运行在 http://localhost:4000。

## 环境变量

| 变量 | 说明 |
|------|------|
| PORT | 服务端口，默认 4000 |
| MONGODB_URI | MongoDB 连接地址 |
| JWT_SECRET | JWT 签名密钥 |
| WECHAT_APPID | 微信小程序 AppID |
| WECHAT_SECRET | 微信小程序 Secret |
| WECHAT_MCH_ID | 微信支付商户号（可选） |
| WECHAT_API_KEY | 微信支付 API 密钥（可选） |
| WECHAT_NOTIFY_URL | 微信支付回调地址（可选） |

## 目录结构

```
server/
├── src/
│   ├── index.ts          # 入口：Express + Socket.IO
│   ├── models/           # Mongoose 模型
│   ├── routes/           # REST API 路由
│   ├── socket/           # Socket.IO 实时消息
│   ├── middleware/       # 认证中间件
│   └── utils/            # 工具函数
├── package.json
└── tsconfig.json
```

## API 概览

- `POST /api/auth/wechat` — 微信登录（开发期无配置时可用任意 code）
- `GET /api/users/me` — 当前用户信息
- `GET/POST /api/products` — 商品列表/发布
- `GET/POST /api/orders` — 订单列表/创建
- `POST /api/orders/:id/pay` — 余额支付
- `GET/POST /api/wallet` — 钱包余额与充值
- `GET/POST /api/chats/conversations` — 会话列表/创建
- `GET/POST /api/chats/conversations/:id/messages` — 消息
- `GET/POST /api/bargains` — 砍价列表/创建
- `POST /api/upload/image` — 图片上传（base64）

## 实时消息

Socket.IO 监听事件：
- `join_conversation` / `leave_conversation`
- `send_message`
- `mark_read`

推送事件：
- `message` — 新消息
- `conversation_updated` — 会话更新

前端连接时需在 `auth.token` 中传入 JWT。
