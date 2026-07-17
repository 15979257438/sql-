---
name: wechat-miniapp-dev
description: 校园二手交易平台微信小程序开发规范与最佳实践
metadata:
  type: project
---

# 微信小程序开发 Skill

本项目是一个基于 **Taro 4 + React 18 + TypeScript + SCSS + Zustand** 的校园二手交易微信小程序，后端使用 **Node.js + Express + Socket.IO + MongoDB**。

## 技术栈

- **框架**: Taro 4.0.8
- **UI 库**: React 18.3.1
- **语言**: TypeScript 5.5.4
- **样式**: SCSS
- **状态管理**: Zustand 4.5.4
- **构建工具**: Webpack 5
- **后端**: Express 4 + Socket.IO 4 + Mongoose 8
- **数据库**: MongoDB

## 常用命令

```bash
# 安装前端依赖
npm install

# 启动微信小程序开发模式
npm run dev:weapp

# 后端
 cd server
npm install
npm run dev          # 开发模式（tsx watch）
npm run build        # 构建
npm run typecheck    # TypeScript 类型检查
```

## 项目结构约定

```
src/
├── pages/           # 页面组件，每个页面一个目录
├── services/        # API 请求封装（按模块划分）
├── stores/          # Zustand 状态管理
├── constants/       # 常量定义
├── types/           # TypeScript 全局类型
├── utils/           # 工具函数
├── components/      # 公共组件
├── assets/          # 静态资源
├── app.tsx          # 应用入口
└── app.config.ts    # 页面/TabBar 配置
```

## 开发规范

### 1. 页面开发

- 每个页面目录下包含 `index.tsx` 和 `index.scss`
- 使用函数组件 + Hooks
- 页面级状态优先使用 Zustand，局部状态使用 `useState`
- 通过 `Taro.getCurrentInstance().router?.params` 获取页面参数

### 2. API 请求

- 统一放在 `src/services/` 下
- 使用 `src/services/api.ts` 中封装的请求实例
- 接口返回类型定义在 `src/types/index.ts`

### 3. 状态管理

- 使用 Zustand 的独立 store 模式
- 已有 store：auth、cart、chat、notification、order、product、search、ui
- 新增状态时，优先复用现有 store，避免过度拆分

### 4. 样式规范

- 使用 SCSS，变量定义在 `src/styles/common.scss`
- 采用 BEM-like 命名：`block__element--modifier`
- 避免行内样式，优先使用类名
- 适配微信小程序，避免使用 `vh/vw` 等不稳定的单位

### 5. 路由与导航

- 页面路径配置在 `src/app.config.ts`
- 使用 `src/utils/nav.ts` 中封装的导航工具
- TabBar 页面使用 `Taro.switchTab`，普通页面使用 `Taro.navigateTo`

### 6. 后端协作

- 后端代码在 `server/src/`
- 新增接口时同步更新 `server/README.md` 的 API 概览
- 环境变量通过 `server/.env` 管理，不要提交真实 `.env`

## 常用 Taro API

```typescript
import Taro from '@tarojs/taro';

// 页面跳转
Taro.navigateTo({ url: '/pages/product-detail/index?id=123' });
Taro.switchTab({ url: '/pages/home/index' });

// 本地存储
Taro.setStorageSync('key', value);
const value = Taro.getStorageSync('key');

// 网络请求
Taro.request({ url, method, data });

// 上传图片
Taro.chooseImage({ count: 1 }).then(res => {
  // res.tempFilePaths
});
```

## 注意事项

1. **不要直接调用浏览器 API**，小程序环境没有 `window`、`document`
2. **图片资源**使用相对路径或网络图片，大图片建议压缩
3. **性能**：长列表使用 `VirtualList` 或分页加载，避免一次性渲染过多节点
4. **类型安全**：新增接口和模型时补充 TypeScript 类型
5. **敏感信息**：AppID、Secret、JWT 密钥等通过 `.env` 管理

## 示例：新增一个页面

1. 在 `src/pages/` 下创建目录 `example/index.tsx` 和 `example/index.scss`
2. 在 `src/app.config.ts` 的 `pages` 数组中添加 `'pages/example/index'`
3. 如需 API，在 `src/services/` 下新增或复用 service
4. 如需状态，在 `src/stores/` 下新增或复用 store

## 相关文件

- [README.md](/README.md) — 项目总览
- [server/README.md](/server/README.md) — 后端 API 文档
- [src/app.config.ts](/src/app.config.ts) — 小程序页面配置
- [package.json](/package.json) — 前端依赖与脚本
- [server/package.json](/server/package.json) — 后端依赖与脚本
