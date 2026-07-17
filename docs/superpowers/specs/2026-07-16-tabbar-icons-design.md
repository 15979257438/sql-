# 底部菜单栏图标展示与美化设计

## 背景

项目为 Taro + React 的微信小程序（`校园二手交易`）。底部导航已配置为自定义 tabBar（`tabBar.custom: true`），素材图标已放置于 `src/assets/icons/`，但当前实现存在两个问题：

1. 自定义 tabBar 组件（`src/custom-tab-bar/index.tsx`）中图标路径使用绝对路径 `/assets/icons/...`，在微信小程序自定义组件中无法正确加载，代码中已用 emoji 兜底。
2. 视觉风格较为基础，缺少精致感和品牌辨识度。

## 目标

- 修复 tabBar 图标加载问题，让图标正常展示。
- 美化自定义 tabBar，采用伪玻璃拟态风格，提升整体质感。

## 设计方向

- **图标风格**：精致线性图标（沿用现有 PNG 素材）。
- **发布按钮**：异形悬浮圆形按钮，带渐变背景，作为视觉重心。
- **背景风格**：伪玻璃拟态（半透明背景，无 backdrop-filter 模糊，确保全机型兼容）。
- **交互**：点击时图标/按钮有轻微缩放反馈。

## 视觉规范

### TabBar 容器

| 属性 | 值 |
|------|-----|
| 背景色 | `rgba(255, 255, 255, 0.92)` |
| 顶部边框 | `1rpx solid #e8e8e8` |
| 高度 | `calc(112rpx + env(safe-area-inset-bottom))` |
| 底部安全区 | `env(safe-area-inset-bottom)` |
| 布局 | flex, space-around, 垂直居中 |

### 常规 Tab 项

| 状态 | 图标颜色 | 文字颜色 | 文字大小 | 字重 |
|------|----------|----------|----------|------|
| 未选中 | `#999999` | `#999999` | `22rpx` | 500 |
| 选中 | `#2b8cff` | `#2b8cff` | `22rpx` | 600 |

- 图标尺寸：`44rpx × 44rpx`
- 图标与文字间距：`6rpx`

### 发布按钮（中间项）

| 属性 | 值 |
|------|-----|
| 形状 | 正圆 |
| 直径 | `96rpx` |
| 背景 | `linear-gradient(135deg, #2b8cff, #1a7aee)` |
| 图标 | 白色（使用 `tab-publish-active.png`） |
| 阴影 | `0 8rpx 24rpx rgba(43, 140, 255, 0.30)` |
| 位置 | 垂直向上突出 tabBar 上边缘约 `28rpx` |

### 交互动效

- 点击常规 tab 图标：`transform: scale(0.92)` → `scale(1.0)`，过渡 `150ms`。
- 点击发布按钮：`transform: scale(0.92)` → `scale(1.0)`，过渡 `150ms`。
- 微信小程序 transition 需通过内联样式或 WXSS 实现；在 `CoverView`/`CoverImage` 上使用 `transition: transform 150ms ease-out`。

## 技术实现

### 文件范围

仅修改：`src/custom-tab-bar/index.tsx`

### 关键修复

将图标路径从绝对路径改为相对于自定义 tabBar 组件的相对路径：

```diff
- icon: '/assets/icons/tab-home.png',
- activeIcon: '/assets/icons/tab-home-active.png',
+ icon: '../assets/icons/tab-home.png',
+ activeIcon: '../assets/icons/tab-home-active.png',
```

> 说明：Taro 编译后自定义 tabBar 组件位于 `dist/custom-tab-bar/index`，图片通过 `copy` 配置复制到 `dist/assets/icons/`。相对路径 `../assets/icons/...` 可正确解析到小程序根目录下的 `assets/icons/`。

### 组件选择

继续使用 `CoverView` + `CoverImage`，确保 tabBar 可覆盖地图、视频等原生组件。

### 状态与降级

保留 `imgError` 状态：若图标加载失败仍 fallback 到 emoji，保证可用性。

## 兼容性

- iOS / Android 微信小程序
- 安全区适配（底部刘海屏）
- 不使用 `backdrop-filter`，避免 CoverView 样式支持不一致问题

## 验收标准

- [ ] 底部 tabBar 正常显示图标，不再 fallback 到 emoji。
- [ ] 选中态图标和文字变为品牌蓝色。
- [ ] 发布按钮为悬浮渐变圆形，视觉突出。
- [ ] 点击任意 tab 有轻微缩放反馈。
- [ ] iPhone 底部安全区高度正确，不被遮挡。
