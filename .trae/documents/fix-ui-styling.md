# UI 样式修复计划

## 问题诊断

从截图可见，整个应用的 Tailwind CSS 完全未生效：
- 所有 `space-y-6`、`p-6`、`rounded-xl` 等 utility class 无效，元素挤在一起
- 按钮没有渐变背景和正确圆角
- 底部导航样式失效
- 完全没有玻璃拟态视觉效果

**根因**：缺少 `postcss.config.js`，Vite 无法处理 CSS 中的 `@tailwind` 指令，导致 Tailwind 未被编译。

## 当前状态分析

- `tailwind.config.js` ✅ 存在且配置完整
- `src/index.css` ✅ 包含 `@tailwind` 指令和自定义样式
- `package.json` ✅ 已安装 `tailwindcss`、`postcss`、`autoprefixer`
- `postcss.config.js` ❌ **缺失** — 这是根因
- `PageShell.tsx` ❌ 缺少底部 padding，导航栏会遮挡内容

## 修复步骤

### Step 1: 创建 PostCSS 配置文件

**文件**：`postcss.config.js`

创建标准的 PostCSS 配置，注册 Tailwind CSS 和 Autoprefixer 插件：

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Step 2: 修复 PageShell 底部遮挡

**文件**：`src/components/PageShell.tsx`

当前页面内容会被底部导航栏（高 64px）遮挡。需要在主内容区添加底部 padding：

```tsx
<main className="px-4 pt-4 pb-24">
```

（`pb-24` = 96px，足够容纳 64px 导航栏 + 32px 留白）

### Step 3: 修复 TodayPage 的"最近练习"数据展示

**文件**：`src/pages/TodayPage.tsx`

当前"最近练习"区域的数字和标签垂直堆叠（截图显示"25"、"分钟"、"80"、"BPM"各占一行），需要改为水平排列的统计卡片布局。

将现有的：
```tsx
<div className="flex items-center gap-4 mt-3">
  <div className="text-center">
    <p className="text-2xl font-bold text-primary">{Math.round(...)}</p>
    <p className="text-xs text-text-tertiary">分钟</p>
  </div>
  ...
</div>
```

保持现有结构即可，Tailwind 生效后 `flex items-center gap-4` 会自动水平排列。

### Step 4: 验证修复

1. 重启 dev server
2. 检查今日页：
   - 卡片之间应有 `space-y-6`（24px）间距
   - GlassCard 应有圆角和半透明背景
   - 按钮应有渐变背景和悬停效果
   - 底部导航应有毛玻璃效果
3. 检查其他页面样式是否正常

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `postcss.config.js` | 新建 | PostCSS 配置，启用 Tailwind |
| `src/components/PageShell.tsx` | 编辑 | 添加 `pb-24` 防止导航栏遮挡 |

## 验证步骤

1. 创建 `postcss.config.js` 后，重启 `npm run dev`
2. 打开浏览器，检查：
   - 页面背景是否为 `#F0EEF5`
   - 卡片是否有圆角和阴影
   - 按钮是否为渐变紫色
   - 底部导航是否有毛玻璃效果
   - 滚动时内容不被导航栏遮挡
