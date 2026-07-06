# 修复界面布局问题 — Tailwind CSS 缺失 + 安全区适配

## Summary

当前 `index.html` 中大量使用 Tailwind CSS 工具类（`flex`、`grid`、`px-4`、`gap-3` 等），但 `<head>` 中从未引入 Tailwind CSS，导致 Dashboard、Source Library、Weekly Review 三个页面的网格布局、间距、Flex 排列全部失效。此外还有底部导航遮挡内容和 FAB 按钮与导航栏重叠的安全区适配问题。

## Current State Analysis

### 问题根因
- **P0 阻塞**: `<head>`（第 7-10 行）仅引入了 Lucide 图标和 Google Fonts，**没有引入 Tailwind CSS**
- HTML 中使用了约 50+ 处 Tailwind 工具类，包括 `grid grid-cols-3`、`grid grid-cols-2`、`flex flex-col gap-3`、`px-4 pt-6 pb-6` 等
- 受影响页面：Dashboard（乐器网格、推荐列表、技能网格）、Source Library（分类标签、来源卡片列表）、Weekly Review（统计卡片、日志列表、技能网格）
- Practice Session 页面不受影响（全部使用 inline style）

### 次要问题
- `.page` 的 `padding-bottom: 80px`（第 117 行）在带 Home Indicator 的 iPhone 上不足（导航栏实际高度 ≈ 94px）
- FAB 按钮 `bottom: 88px`（第 508 行）是固定值，与导航栏高度不匹配，可能重叠
- Bottom Sheet 缺少 `max-width: 480px` 约束，宽屏上表单会拉伸到全屏宽度

## Proposed Changes

### 修改文件
`/Users/azq/Library/Application Support/TRAE SOLO CN/ModularData/ai-agent/work-mode-projects/6a486b37f296dc6b73da3fec/string-practice-compass/index.html`

### Change 1: 引入 Tailwind CSS CDN（P0 — 核心修复）

**位置**: `<head>` 标签内，第 10 行 Google Fonts link 之后

**操作**: 添加 Tailwind CSS CDN script：
```html
<script src="https://cdn.tailwindcss.com"></script>
```

**原因**: HTML 中已大量使用 Tailwind 工具类，引入 CDN 后所有类立即生效，是最快、最低风险的修复方式。

### Change 2: 修复底部导航遮挡内容（P1 — 安全区适配）

**位置**: `<style>` 中 `.page` 规则（第 114-118 行附近）

**操作**: 将 `padding-bottom: 80px` 改为动态计算值：
```css
.page {
    /* 原有属性不变 */
    padding-bottom: calc(60px + env(safe-area-inset-bottom, 20px));
}
```

**原因**: 底部导航栏高度 = 60px + safe-area-inset-bottom（iPhone 约 34px），原固定值 80px 在 iPhone 上会导致底部内容被遮挡约 14px。

### Change 3: 修复 FAB 按钮与导航栏重叠（P1）

**位置**: `<style>` 中 `.fab` 规则（第 501-518 行附近）

**操作**: 将 `bottom: 88px` 改为动态计算值：
```css
.fab {
    /* 原有属性不变 */
    bottom: calc(72px + env(safe-area-inset-bottom, 16px));
}
```

**原因**: 原固定值 88px 在带安全区的 iPhone 上会与导航栏重叠。新值 = 导航栏高度(60px) + 间距(12px) + 安全区。

### Change 4: Bottom Sheet 宽度约束（P2 — 体验优化）

**位置**: `<style>` 中 `.bottom-sheet` 规则（第 543-556 行附近）

**操作**: 添加 `max-width` 和居中：
```css
.bottom-sheet {
    /* 原有属性不变 */
    max-width: 480px;
    margin: 0 auto;
    left: 50%;
    transform: translate(-50%, 100%);
}
.bottom-sheet.visible {
    transform: translate(-50%, 0);
}
```

**原因**: 原表单在宽屏上会拉伸到全屏宽度，与页面的 480px 居中布局不一致。注意需要同步修改 `.visible` 状态的 transform 以保持居中。

## Assumptions & Decisions

1. **Tailwind CDN 版本**: 使用 `https://cdn.tailwindcss.com` 最新版，无需指定版本号（这是 Tailwind 官方推荐的 CDN 方式）
2. **不改写现有 Tailwind 类**: 已有的 HTML 中所有 `flex`、`grid`、`px-4` 等类保持不变，引入 CDN 后自动生效
3. **Practice Session 页面不做改动**: 该页面使用 inline style，布局正常，无需修改
4. **`env(safe-area-inset-bottom)` fallback 值**: 使用 16px/20px 作为非 iOS 设备的 fallback

## Verification Steps

1. **本地服务器验证**: 确保服务器仍在 `http://localhost:8000` 运行
2. **Dashboard 验证**:
   - 乐器卡片应显示为 3 列网格（非纵向堆叠）
   - 推荐卡片之间应有间距
   - 技能进步应显示为 2x2 网格
   - 页面内容应有左右内边距（不再贴边）
3. **Source Library 验证**:
   - 分类标签应横向排列并自动换行
   - 来源卡片之间应有间距
   - FAB 按钮不应与底部导航重叠
4. **Weekly Review 验证**:
   - 统计卡片内"分钟"和"练习天数"应横向排列
   - 练习日志之间应有间距
   - 技能进步应显示为 2x2 网格
5. **底部内容不被导航遮挡**: 滚动到页面最底部，最后一条内容应完整可见
6. **Bottom Sheet 宽度**: 在宽屏浏览器上打开添加表单，表单宽度不超过 480px 且居中
7. **Practice Session 不受影响**: 练习模式页面布局保持正常
8. **Console 无报错**: 浏览器控制台无新增错误
