# 二手交易平台改造 · 进度日志

## 2026-07-16 会话启动

- 读取 [REMAINING.md](REMAINING.md) 与旧 UI 计划
- 创建 `task_plan.md`、`findings.md`、`progress.md`
- 启动子代理全面探索代码结构
- 待完成：根据探索结果细化阶段 1，向用户确认后端/支付方案

## 2026-07-16 代码结构探索完成

- 子代理返回完整项目结构、页面、状态、服务、类型梳理
- 关键结论：
  - 无后端，全部本地 Storage
  - 无支付/钱包代码
  - 聊天按用户聚合，未关联商品
  - TabBar 第二 tab 为购物车，需改为分类
  - 首页分类为垂直大卡片，需改为横向一排
- 下一步：向用户确认后端与支付方案

## 2026-07-16 用户确认方案

- 后端：Node.js + Express + Socket.IO + MongoDB
- 支付：钱包余额优先 + 微信支付脚手架

## 2026-07-16 首页与 TabBar 优化完成

- 首页分类改为横向滚动 pills，点击跳转 `/pages/category/index?cat=xxx`
- 新增 `src/custom-tab-bar/index.tsx`，文字放大、图标放大
- `app.config.ts` 启用自定义 TabBar，第二 tab 改为「分类」
- 修复 `common.ts` 中 CSSProperties 字面量类型推断问题
- `npm run typecheck` 通过

## 2026-07-16 后端与核心功能完成

- 搭建 `server/`：Express + Socket.IO + MongoDB + Mongoose
- 完成数据模型：User、Product、Order、Conversation、Message、Bargain、Transaction、Notification
- 完成 REST API 与 Socket.IO 实时消息转发
- 前端 API 抽象层 `src/services/api.ts`
- 重写 `authService` 支持微信一键登录 + 测试账号 fallback
- 重写 `productService`、`orderService`、`chatService` 调用后端
- 新增 `walletService`、`bargainService`
- 新增 `socketService` 管理 Socket.IO 连接
- 新增 `WalletPage`、`BargainListPage`
- 改造 `LoginPage` 增加微信一键登录按钮
- 改造 `ChatListPage` 按商品-用户维度展示会话
- 改造 `ChatDetailPage` 顶部显示商品信息，接入 Socket.IO 实时收发
- 改造 `ProductDetailPage` 增加砍价入口
- 改造 `MePage` 显示余额并添加快捷入口
- 更新 TypeScript 类型定义
- `npm run typecheck` 通过
- `npm run build:weapp` 构建成功

## 待后续完善

- 接入真实微信支付商户号（当前为脚手架）
- 后端 seed 脚本初始化商品数据
- 图片存储可迁移至 COS/OSS
- 真机测试跨设备聊天与支付流程

## 2026-07-16 修复微信开发者工具 `process is not defined`

- 根因：`src/constants/config.ts` 和 `src/services/uploadService.ts` 直接访问 `process.env`
- 微信小程序运行时没有 `process` 对象
- 修复：将 `API_BASE_URL` 硬编码为 `'http://localhost:4000/api'`，移除 `uploadService` 中的 `process` 引用
- 验证：`dist/` 中不再包含 `process` 引用，`npm run build:weapp` 成功
- 注意：真机调试时需将 `API_BASE_URL` 改为电脑局域网 IP

## 2026-07-16 修复 TabBar 与首页空白

- 恢复 TabBar 第二 tab 为「购物车」（原应用设计）
- 修复自定义 TabBar 图标路径，使用根相对路径 `/assets/icons/...`
- 增加图标加载失败时的 emoji 兜底
- 放大 TabBar 文字至 26rpx 并加粗
- `productService.list/getById` 增加后端不可用时的本地 mock 数据回退
- 确保后端未启动时首页也能显示本地商品
- `npm run typecheck` 与 `npm run build:weapp` 均通过
