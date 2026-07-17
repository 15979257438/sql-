# 二手交易平台改造 · 关键发现

## 项目结构

- 框架：**Taro 4.0.8 + React 18 + TypeScript + SCSS**
- 状态管理：**Zustand**
- 页面路径：`src/pages/*/index.tsx`（Taro 约定式路由）
- 数据持久化：当前全部使用 `Taro.setStorageSync` + `BroadcastChannel`（同浏览器标签页同步）
- 无真实后端，无跨设备数据隔离

## 已确认文件

| 文件 | 说明 |
|------|------|
| [src/app.tsx](src/app.tsx) | 应用入口，初始化 mock 数据与离线状态 |
| [src/app.config.ts](src/app.config.ts) | Taro 全局配置与 TabBar |
| [src/constants/config.ts](src/constants/config.ts) | 全局配置常量 |
| [src/styles/common.ts](src/styles/common.ts) | JS 设计 Token（颜色、字号、圆角、通用样式） |
| [src/services/storage.ts](src/services/storage.ts) | Taro Storage 封装 |
| [src/services/mockData.ts](src/services/mockData.ts) | 3 用户 + 20 商品 mock 数据 |
| [src/services/authService.ts](src/services/authService.ts) | 账号密码 + 模拟短信登录 |
| [src/services/chatService.ts](src/services/chatService.ts) | 本地聊天读写 |
| [src/services/productService.ts](src/services/productService.ts) | 商品 CRUD 与筛选 |
| [src/services/orderService.ts](src/services/orderService.ts) | 订单状态流转 |
| [src/services/uploadService.ts](src/services/uploadService.ts) | 图片上传（默认 mock base64） |
| [src/stores/authStore.ts](src/stores/authStore.ts) | 登录态 |
| [src/stores/chatStore.ts](src/stores/chatStore.ts) | 聊天状态 |
| [src/stores/productStore.ts](src/stores/productStore.ts) | 商品状态 |
| [src/stores/cartStore.ts](src/stores/cartStore.ts) | 购物车状态 |
| [src/stores/orderStore.ts](src/stores/orderStore.ts) | 订单状态 |
| [REMAINING.md](REMAINING.md) | 项目遗留任务清单 |

## 当前 TabBar

[app.config.ts](src/app.config.ts:30-43) 当前顺序：
1. 首页
2. 购物车
3. 发布
4. 消息
5. 我的

遗留任务指出第二 tab 应改为「分类」。

Taro 原生 TabBar 不支持直接调整字号，需改用 `custom: true` 自定义 TabBar 组件才能放大文字。

## 当前首页分类

[home/index.tsx](src/pages/home/index.tsx:456-537) 使用垂直大卡片列表，每个分类占一整行，占用区域过大。需求改为横向一排 pills/chips。

## 当前登录

[login/index.tsx](src/pages/login/index.tsx) 为账号密码 + 模拟短信，测试账号 `1/2/3` 密码 `123456`。未接入微信 OAuth。

## 当前聊天

- [chat/index.tsx](src/pages/chat/index.tsx) 会话列表按用户聚合
- [chat-detail/index.tsx](src/pages/chat-detail/index.tsx) 一对一聊天，无商品关联
- [chatService.ts](src/services/chatService.ts) 本地存储，无 WebSocket

## 支付/钱包

代码库中**没有任何**支付、钱包、余额相关实现。需要从零新增。

## 遗留任务与本需求重叠项

来自 [REMAINING.md](REMAINING.md)：

- 微信授权登录（当前为账号/密码测试账号）
- WebSocket 实时聊天（当前 BroadcastChannel 仅限同标签页）
- 接入真实后端 API（当前 localStorage 无法跨设备隔离）
- TabBar 第二 tab 当前为购物车，需求应改为「分类」

## 不一致点

- `docs/superpowers/plans/2026-07-15-ui-overhaul.md` 描述的架构为 **Vite + Tailwind + react-router-dom**，与当前 **Taro + SCSS** 项目不符，仅提取设计意图参考，不直接按该计划执行。
