# 校园二手交易平台 H5 全站视觉优化实施方案

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按照用户提供的参考图风格，对全站进行统一的简约电商风视觉优化，所有界面文字使用中文，最终通过 TypeScript 检查、生产构建与 Playwright 运行时验证。

**Architecture：** 先统一 Design Token 与公共组件（Tailwind 配置、全局样式、NavBar、TabBar、卡片/按钮/输入框），再按页面分组并行改造；每个页面保留原有业务逻辑，仅调整布局、圆角、阴影、字体层级与颜色。

**Tech Stack：** React 18 + TypeScript + Vite 5 + Tailwind CSS + Zustand + react-router-dom v6。

---

## 文件结构

### 需修改的公共文件
- `tailwind.config.js` — 补充/校准 Design Token（渐变、圆角、阴影、字阶、间距）。
- `src/index.css` — 全局基础样式、骨架屏、瀑布流、安全区适配。
- `src/components/layout/NavBar.tsx` — 透明/白色背景、返回按钮、右侧操作区。
- `src/components/layout/TabBar.tsx` — 底部导航样式与图标。
- `src/components/shared/Feedback.tsx` — 空状态、骨架屏组件。

### 需改造的页面
- `src/pages/home/HomePage.tsx`
- `src/pages/product-detail/ProductDetailPage.tsx`
- `src/pages/cart/CartPage.tsx`
- `src/pages/search/SearchPage.tsx`
- `src/pages/me/MePage.tsx`
- `src/pages/me/OrdersPage.tsx`
- `src/pages/publish/PublishPage.tsx`
- `src/pages/me/FavoritesPage.tsx`
- `src/pages/me/HistoryPage.tsx`
- `src/pages/chat/ChatListPage.tsx`
- `src/pages/chat/ChatDialogPage.tsx`
- `src/pages/category/CategoryPage.tsx`
- `src/pages/me/SettingsPage.tsx`
- `src/pages/notifications/NotificationsPage.tsx`
- `src/pages/login/LoginPage.tsx`

---

## 设计规范

### 色彩
- 主色：`#2B8CFF`（天蓝）
- 主色浅：`#E8F4FF`
- 主色深：`#1A6FD1`
- 背景：`#F5F7FA`
- 卡片：`#FFFFFF`
- 主文字：`#1A1A1A`
- 次文字：`#8A8A8A`
- 提示文字：`#B0B0B0`
- 边框：`#F0F0F0`
- 危险：`#FF4D4F`
- 成功：`#52C41A`
- CTA 渐变：`linear-gradient(135deg, #2B8CFF 0%, #1A6FD1 100%)`（可选）

### 字体与字阶
- 中文字体：PingFang SC、Noto Sans SC、system-ui
- 页面大标题：22-24px、加粗
- 卡片标题/商品名：14-16px、加粗
- 价格：18-24px、加粗、主色
- 辅助说明：12-13px、次文字色

### 圆角
- 卡片：`rounded-2xl` (24px)
- 按钮：`rounded-xl` (16px) / `rounded-2xl` (24px) 大 CTA
- 输入框：`rounded-xl` (16px)
- 头像：`rounded-full`

### 阴影
- 卡片：`shadow-card` (`0 4px 16px rgba(0,0,0,0.06)`)
- 主按钮：`shadow-btn` (`0 8px 24px rgba(43, 140, 255, 0.32)`)

### 间距
- 页面边距：`px-4` (16px)
- 模块间距：`space-y-4` / `space-y-5`
- 卡片内边距：`p-4`

---

## 任务清单

### Task 1: 统一 Design Token 与全局样式

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

**目标：** 确保当前已配置的 Token 足够支撑参考图风格；补齐缺失工具类。

- [ ] **Step 1: 校准 Tailwind 配置**
  检查 `colors`、`borderRadius`、`boxShadow`、`fontSize`、`spacing` 是否包含上述设计规范值；若缺少 `gradient` 或 `primary` 系列，补齐。

- [ ] **Step 2: 调整全局基础样式**
  确保 `body` 背景为 `#F5F7FA`、文字为 `#1A1A1A`、无默认边距；`input/textarea/button` 继承字体；`img` 块级显示。

- [ ] **Step 3: 运行样式检查**
  命令：`npx tsc --noEmit`
  预期：无错误。

---

### Task 2: 公共组件视觉升级

**Files:**
- Modify: `src/components/layout/NavBar.tsx`
- Modify: `src/components/layout/TabBar.tsx`
- Modify: `src/components/shared/Feedback.tsx`

**目标：** 顶部导航、底部 Tab、空状态/骨架屏与新的圆角、留白、字体层级一致。

- [ ] **Step 1: NavBar**
  - 支持 `transparent` / `white` 背景，透明模式下文字/图标为白色。
  - 标题字号 18px、加粗，返回按钮 24px 触控区。
  - 右侧操作区支持多个图标按钮。

- [ ] **Step 2: TabBar**
  - 底部安全区适配，背景白色，上边框 1px `#F0F0F0`。
  - 中间发布 CTA 使用蓝色圆形或圆角矩形，带 `shadow-btn`。
  - 选中文字/图标使用主色。

- [ ] **Step 3: Feedback 组件**
  - `EmptyState` 居中、图标 48px、标题 16px 加粗、描述 13px 次文字。
  - `Skeleton` 圆角与卡片一致。

---

### Task 3: 首页 HomePage 改造

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

**目标：** 首页与参考图左侧屏幕一致：顶部沉浸式 Banner、搜索栏浮层、Trending 横向滚动、分类大卡片、商品瀑布流。

- [ ] **Step 1: 顶部 Banner 区**
  - 全宽大图，高度约 55vh，底部圆角 `rounded-b-3xl`。
  - 顶部覆盖半透明搜索栏，左侧放大镜图标，右侧退出/购物车图标。
  - 图片下方叠加标题、价格、原价删除线、“查看全部”按钮。
  - 轮播指示器为底部小圆点。

- [ ] **Step 2: Trending 横向滚动**
  - 标题“热门推荐”+“查看全部 >”。
  - 卡片为竖向商品图 + 商品名 + 价格，圆角 24px，阴影。
  - 可横向滑动，隐藏滚动条。

- [ ] **Step 3: 分类入口**
  - 标题“分类”+“查看全部 >”。
  - 每个分类为一行大卡片：左侧图标圆圈、名称与数量、右侧箭头。
  - 点击分类跳转 `/category?cat=xxx`（当前代码已支持读取 query）。

- [ ] **Step 4: 商品瀑布流**
  - 双列瀑布流，商品卡片圆角 24px、阴影、图片占主要区域。
  - 标题最多两行、价格加粗、卖家小头像+昵称、收藏心形按钮。

---

### Task 4: 商品详情 ProductDetailPage 改造

**Files:**
- Modify: `src/pages/product-detail/ProductDetailPage.tsx`

**目标：** 与参考图中间屏幕一致：大图占满、透明导航、底部蓝色大 CTA。

- [ ] **Step 1: 顶部图片区**
  - 图片高度 55vh，底部大圆角，支持左右滑动切换。
  - 顶部透明 NavBar，右侧依次为购物车、举报、收藏图标。
  - 底部显示 `current/total` 指示器。

- [ ] **Step 2: 信息浮层卡**
  - 白色圆角卡片向上偏移覆盖图片底部，显示价格（主色大字号）、原价删除线、标题、分类/成色/交易方式标签、浏览/收藏/时间。

- [ ] **Step 3: 描述与卖家卡**
  - 商品描述卡片：标题“商品描述”、正文、交易地点。
  - 卖家卡片：大头像、昵称、学校/院系、评分、已售数量、“联系卖家”按钮。

- [ ] **Step 4: 底部固定操作栏**
  - 非卖家：聊一聊（边框蓝）、加入购物车（边框蓝）、我想要（实心蓝）。
  - 卖家：编辑商品、下架。
  - 有订单时：显示订单状态与对应操作按钮。

---

### Task 5: 购物车 CartPage 改造

**Files:**
- Modify: `src/pages/cart/CartPage.tsx`

**目标：** 与参考图右侧屏幕一致：商品卡片列表、底部合计与蓝色结算按钮。

- [ ] **Step 1: 商品卡片**
  - 左侧商品图（圆角 16px），右侧标题、卖家、价格、删除按钮。
  - 不实现数量加减（二手单品唯一），但保留“删除”操作。

- [ ] **Step 2: 底部结算栏**
  - 左侧“合计”+ 金额（大字号、主色）。
  - 右侧蓝色大按钮“一键下单 (N)”。

- [ ] **Step 3: 空状态**
  - 空购物车使用 `EmptyState` +“去逛逛”按钮。

---

### Task 6: 搜索/分类/我的/订单/发布/收藏历史改造

**Files:**
- Modify: `src/pages/search/SearchPage.tsx`
- Modify: `src/pages/category/CategoryPage.tsx`
- Modify: `src/pages/me/MePage.tsx`
- Modify: `src/pages/me/OrdersPage.tsx`
- Modify: `src/pages/publish/PublishPage.tsx`
- Modify: `src/pages/me/FavoritesPage.tsx`
- Modify: `src/pages/me/HistoryPage.tsx`

**目标：** 保持功能不变，统一为圆角大卡片、主色按钮、充足留白、中文文案。

- [ ] **Step 1: SearchPage**
  - 顶部搜索栏带“退出”按钮；搜索历史使用标签胶囊；结果列表为横向商品卡片。

- [ ] **Step 2: CategoryPage**
  - 分类网格图标放大、卡片化；商品列表使用统一商品卡片。

- [ ] **Step 3: MePage**
  - 顶部蓝色背景头部，大头像浮出；统计行使用卡片；菜单使用网格卡片；退出按钮大卡片。

- [ ] **Step 4: OrdersPage**
  - 订单卡片圆角阴影；状态标签彩色小药丸；操作按钮主色/次色；状态追踪条。

- [ ] **Step 5: PublishPage**
  - 图片上传、输入框、选择器分组为白色圆角卡片；底部大发布按钮。

- [ ] **Step 6: FavoritesPage / HistoryPage**
  - 商品卡片与搜索/结果一致；支持单条删除与清空。

---

### Task 7: 聊天/通知/设置/登录页改造

**Files:**
- Modify: `src/pages/chat/ChatListPage.tsx`
- Modify: `src/pages/chat/ChatDialogPage.tsx`
- Modify: `src/pages/notifications/NotificationsPage.tsx`
- Modify: `src/pages/me/SettingsPage.tsx`
- Modify: `src/pages/login/LoginPage.tsx`

**目标：** 保持功能，统一视觉语言。

- [ ] **Step 1: ChatListPage**
  - 会话列表卡片化，头像、昵称、最后消息、时间、未读角标。

- [ ] **Step 2: ChatDialogPage**
  - 顶部 NavBar 白色，气泡圆角，输入框圆角。

- [ ] **Step 3: NotificationsPage**
  - 通知卡片化，未读左侧蓝色竖条或圆点。

- [ ] **Step 4: SettingsPage**
  - 设置项分组卡片，退出登录红色按钮。

- [ ] **Step 5: LoginPage**
  - 密码/验证码登录切换已具备；样式统一为圆角输入框、蓝色主按钮、测试账号快速登录卡片。

---

### Task 8: 全站中文文案检查

**Files:** 全站

**目标：** 确保界面无英文残留（状态机内部值、URL 等除外）。

- [ ] **Step 1: 搜索英文 UI 文案**
  命令：`grep -R "My cart\|Check out\|Show all\|Recommendations\|Trending\|Categories" src/ --include="*.tsx"`
  预期：无英文 UI 文本命中。

- [ ] **Step 2: 人工抽查**
  重点检查 `CartPage`、`HomePage`、`ProductDetailPage`、`SearchPage` 的静态文本。

---

### Task 9: 验证与验收

**Files:** 全站

**目标：** 保证代码无编译错误、构建通过、关键页面可运行。

- [ ] **Step 1: TypeScript 检查**
  命令：`npx tsc --noEmit`
  预期：无错误。

- [ ] **Step 2: 生产构建**
  命令：`npx vite build`
  预期：构建成功，生成 `dist/`。

- [ ] **Step 3: Playwright 运行时验证**
  - 启动 `npx vite --port 5173`。
  - 用 Playwright 打开：
    1. `/login`：确认密码/验证码切换、测试账号卡片存在。
    2. `/home`：确认 Banner、Trending、分类、商品瀑布流渲染。
    3. `/product/:id`：确认举报按钮、大图、底部 CTA 渲染。
    4. `/cart`：确认商品列表、合计、一键下单按钮渲染。
  - 截图保存并检查无白屏/崩溃。

- [ ] **Step 4: 人工复核**
  检查关键交互：登录、加入购物车、下单、举报提交是否仍可正常完成。

---

## Spec 覆盖检查

| 需求 | 对应任务 |
|------|----------|
| 参考图风格（首页/详情/购物车） | Task 3 / 4 / 5 |
| 全站简约风细节优化 | Task 6 / 7 |
| 中文界面 | Task 8 |
| 严格验收 | Task 9 |

## 执行方式

**建议：使用 Workflow / 子代理并行执行 Task 3-7（公共基础 Task 1-2 先完成），最后统一验证。**

每个页面任务独立，可在不同代理中并行；公共组件 Task 1-2 必须先完成，以避免样式冲突。
