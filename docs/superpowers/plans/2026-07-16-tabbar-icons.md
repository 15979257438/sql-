# 底部菜单栏图标展示与美化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复微信小程序自定义 tabBar 图标加载问题，并将其美化成伪玻璃拟态风格。

**Architecture:** 仅修改 `src/custom-tab-bar/index.tsx` 一个文件。修复图标相对路径、调整 tabBar 容器与 tab 项样式、将发布按钮改为悬浮渐变圆形，并添加点击缩放反馈。通过微信开发者工具 / 真机预览进行人工验收。

**Tech Stack:** Taro 3 (React), TypeScript, 微信小程序自定义 tabBar (CoverView / CoverImage)

---

## File Structure

- **Modify:** `src/custom-tab-bar/index.tsx`
  -  responsibility: 自定义底部 tabBar 组件，包含图标渲染、状态切换、样式。

---

### Task 1: 修复图标路径并调整 tab 项样式

**Files:**
- Modify: `src/custom-tab-bar/index.tsx`

- [ ] **Step 1: 备份当前文件**

  复制 `src/custom-tab-bar/index.tsx` 为 `src/custom-tab-bar/index.tsx.bak` 以防需要回滚。

- [ ] **Step 2: 修改图标路径**

  将 `TABS` 数组中所有 `icon` 和 `activeIcon` 的路径前缀从 `/assets/icons/` 改为 `../assets/icons/`。

  修改前：
  ```ts
  { pagePath: 'pages/home/index', text: '首页', icon: '/assets/icons/tab-home.png', activeIcon: '/assets/icons/tab-home-active.png', emoji: '🏠' },
  ```

  修改后：
  ```ts
  { pagePath: 'pages/home/index', text: '首页', icon: '../assets/icons/tab-home.png', activeIcon: '../assets/icons/tab-home-active.png', emoji: '🏠' },
  ```

  对全部 5 个 tab 项执行相同修改。

- [ ] **Step 3: 调整常规 tab 图标与文字样式**

  在 `renderIcon` 函数内，将图标尺寸统一为 `44rpx × 44rpx`，并保证非发布 tab 的图标与文字间距为 `6rpx`。

  确认 `Text` 标签样式：
  ```tsx
  <Text
    style={{
      fontSize: '22rpx',
      fontWeight: isSelected ? 600 : 500,
      color: isSelected ? colors.primary : colors.textHint,
    }}
  >
    {tab.text}
  </Text>
  ```

- [ ] **Step 4: 运行开发编译**

  Run:
  ```bash
  npm run dev:weapp
  ```

  Expected: 编译成功，无 TypeScript / ESLint 报错。

- [ ] **Step 5: 在微信开发者工具中验证图标显示**

  打开微信开发者工具，导入 `dist/` 目录，进入任意 tab 页面，确认底部显示图标而非 emoji。

---

### Task 2: 美化 tabBar 容器为伪玻璃拟态背景

**Files:**
- Modify: `src/custom-tab-bar/index.tsx`

- [ ] **Step 1: 重写 tabBar 容器样式**

  将外层 `CoverView` 的 `style` 改为：
  ```tsx
  <CoverView
    style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      height: 'calc(112rpx + env(safe-area-inset-bottom))',
      paddingBottom: 'env(safe-area-inset-bottom)',
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      borderTop: '1rpx solid #e8e8e8',
    }}
  >
  ```

- [ ] **Step 2: 调整每个 tab 项的点击区域**

  保持每个 tab 项 `CoverView` 的 flex 布局，确保垂直居中、高度 100%。

  ```tsx
  <CoverView
    key={tab.pagePath}
    onClick={() => switchTab(index)}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      height: '100%',
    }}
  >
  ```

- [ ] **Step 3: 编译并预览**

  Run:
  ```bash
  npm run dev:weapp
  ```

  在微信开发者工具中查看 tabBar 背景是否变为半透明白色、顶部是否有细边框。

---

### Task 3: 将发布按钮改为悬浮渐变圆形

**Files:**
- Modify: `src/custom-tab-bar/index.tsx`

- [ ] **Step 1: 修改发布按钮容器**

  找到 `isPublish` 分支中的 `CoverView`，改为：
  ```tsx
  {isPublish ? (
    <CoverView
      style={{
        width: '96rpx',
        height: '96rpx',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #2b8cff, #1a7aee)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8rpx 24rpx rgba(43, 140, 255, 0.30)',
        marginTop: '-28rpx',
      }}
    >
      {renderIcon(tab, isSelected)}
    </CoverView>
  ) : (
    renderIcon(tab, isSelected)
  )}
  ```

  注意：CoverView 不支持 CSS `background` 简写属性时，使用 `backgroundImage` 替代：
  ```tsx
  backgroundImage: 'linear-gradient(135deg, #2b8cff, #1a7aee)',
  ```

- [ ] **Step 2: 发布按钮始终使用白色图标**

  在 `renderIcon` 中，当 `tab.text === '发布'` 时，始终使用 `tab.activeIcon`，避免未选中时显示灰色图标。

  修改后的 `renderIcon` 大致如下：
  ```tsx
  const renderIcon = (tab: typeof TABS[0], isSelected: boolean) => {
    const key = `${tab.pagePath}_${isSelected}`;
    if (imgError[key]) {
      return (
        <Text style={{ fontSize: tab.text === '发布' ? '44rpx' : '40rpx', marginBottom: '6rpx' }}>
          {tab.emoji}
        </Text>
      );
    }
    const useActive = isSelected || tab.text === '发布';
    return (
      <CoverImage
        src={useActive ? tab.activeIcon : tab.icon}
        style={{ width: tab.text === '发布' ? '48rpx' : '44rpx', height: tab.text === '发布' ? '48rpx' : '44rpx' }}
        onError={() => setImgError(prev => ({ ...prev, [key]: true }))}
      />
    );
  };
  ```

- [ ] **Step 3: 编译并预览**

  Run:
  ```bash
  npm run dev:weapp
  ```

  在微信开发者工具中确认发布按钮为圆形、渐变、向上悬浮、带阴影。

---

### Task 4: 添加点击缩放反馈

**Files:**
- Modify: `src/custom-tab-bar/index.tsx`

- [ ] **Step 1: 添加按下状态**

  在组件内部新增一个状态记录当前被按下的 tab 索引：
  ```ts
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  ```

- [ ] **Step 2: 修改点击事件**

  将 `switchTab` 逻辑拆分为 `onPressIn` / `onPressOut` 模拟触摸反馈，或在 `onClick` 中通过 `setPressedIndex` 短暂触发：
  ```tsx
  const handlePress = (index: number) => {
    setPressedIndex(index);
    setTimeout(() => setPressedIndex(null), 150);
    switchTab(index);
  };
  ```

  将 `onClick={() => switchTab(index)}` 替换为 `onClick={() => handlePress(index)}`。

- [ ] **Step 3: 应用缩放样式**

  在 tab 项 `CoverView` 的 `style` 中加入：
  ```tsx
  style={{
    ...,
    transform: pressedIndex === index ? 'scale(0.92)' : 'scale(1)',
    transition: 'transform 150ms ease-out',
  }}
  ```

  发布按钮本身也应用相同逻辑：
  ```tsx
  transform: pressedIndex === index ? 'scale(0.92)' : 'scale(1)',
  transition: 'transform 150ms ease-out',
  ```

- [ ] **Step 4: 编译并真机预览**

  Run:
  ```bash
  npm run dev:weapp
  ```

  在微信开发者工具及真机预览中点击每个 tab，确认有轻微缩放回弹效果。

---

### Task 5: 验收与清理

**Files:**
- Modify: `src/custom-tab-bar/index.tsx`
- Delete: `src/custom-tab-bar/index.tsx.bak`（如不再需要）

- [ ] **Step 1: 删除备份文件**

  ```bash
  rm src/custom-tab-bar/index.tsx.bak
  ```

- [ ] **Step 2: 验收检查清单**

  在微信开发者工具 / 真机中逐项确认：
  - [ ] 底部 tabBar 显示图标，无 emoji fallback。
  - [ ] 选中态图标和文字为品牌蓝色 `#2b8cff`。
  - [ ] 未选中态图标和文字为灰色 `#999999`。
  - [ ] 发布按钮为圆形、蓝渐变、向上悬浮、带阴影。
  - [ ] 点击任意 tab 有 150ms 缩放反馈。
  - [ ] iPhone 底部安全区正常，内容不被遮挡。

- [ ] **Step 3: 最终提交**

  ```bash
  git add src/custom-tab-bar/index.tsx
  git commit -m "feat(tabbar): 修复图标路径并美化自定义 tabBar"
  ```

---

## Self-Review

- **Spec coverage:** 所有视觉规范（背景、颜色、尺寸、阴影、悬浮、路径修复、交互）均对应到具体任务。
- **Placeholder scan:** 无 TBD/TODO，所有步骤包含具体代码。
- **Type consistency:** 沿用了现有 `TABS` 类型和 `colors` 变量，未引入新类型冲突。
