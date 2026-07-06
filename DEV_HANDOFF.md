# String Practice Compass — 开发交接文档

## 项目概述

弦乐器自学练习追踪工具，面向弹吉他/尤克里里的自学者。支持管理练习来源、计时练习、记录卡点、周复盘进步。

## 文件结构

```
string-practice-compass/
├── colors_and_type.css        # 设计 token（CSS 变量体系，可直接复用）
├── pages/
│   ├── dashboard.html         # 今日工作台
│   ├── dashboard-empty.html   # 工作台空状态
│   ├── source-library.html    # 素材库
│   ├── source-library-empty.html # 素材库空状态
│   ├── practice-session.html  # 练习模式（沉浸式，无底部导航）
│   ├── weekly-review.html     # 周复盘
│   └── weekly-review-empty.html # 周复盘空状态
├── partials/
│   └── project-shell.html     # 共享底部导航壳
└── string-practice-compass.design # Canvas 设计文件
```

## 页面导航图

```
Dashboard ──→ Source Library ──→ Practice Session ──→ Weekly Review
    ↑              │                    │                  │
    └──────────────┘                    │                  │
    └───────────────────────────────────┘                  │
    └──────────────────────────────────────────────────────┘
```

底部导航 3 个 tab：工作台 / 素材库 / 周复盘。练习模式从素材库的 Lesson 点击进入，无底部导航。

## 设计 Token 体系

所有 token 定义在 `colors_and_type.css` 的 `:root` 中，可直接 copy 到项目全局 CSS。

### 颜色

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-primary` | `#B89CD4` | 主色调（粉紫） |
| `--color-primary-hover` | `#A488C0` | 主色 hover |
| `--color-primary-light` | `rgba(184,156,212,0.20)` | 主色淡底 |
| `--gradient-primary` | `#C4A4D7 → #8BA4C7` | 主渐变（CTA按钮、高亮卡片） |
| `--color-lavender` | `#D4C4E8` | 薰衣草紫 |
| `--color-mint` | `#B8D8C8` | 薄荷绿 |
| `--color-amber-soft` | `#F0D8A8` | 柔和琥珀 |
| `--color-rose-soft` | `#E8B8C4` | 柔和玫瑰 |
| `--color-warm-cream` | `#F5E6D0` | 暖奶油 |
| `--state-error` | `#D4788A` | 错误/卡点（柔和红） |
| `--state-success` | `#7EBCA6` | 成功/进步（柔和绿） |
| `--state-warning` | `#E8C87A` | 警告（柔和黄） |

### 乐器专属渐变

| Token | 值 | 用途 |
|-------|-----|------|
| `--gradient-electric` | `#FFF5E6 → #F0D8A8` | 电吉他卡片底色 |
| `--gradient-acoustic` | `#F0FAF5 → #B8D8C8` | 木吉他卡片底色 |
| `--gradient-ukulele` | `#F5F0FF → #D4C4E8` | 尤克里里卡片底色 |

### 背景/表面

| Token | 值 | 用途 |
|-------|-----|------|
| `--bg-base` | `#F0EEF5` | 页面底色（淡紫灰） |
| `--bg-surface` | `rgba(255,255,255,0.55)` | 毛玻璃卡片背景 |
| `--bg-surface-elevated` | `rgba(255,255,255,0.72)` | 提升表面（底部导航、hover） |
| `--bg-input` | `rgba(255,255,255,0.60)` | 输入框背景 |
| `--border-default` | `rgba(184,156,212,0.20)` | 默认边框 |
| `--glass-blur` | `blur(16px)` | 毛玻璃模糊 |
| `--glass-border` | `1px solid rgba(255,255,255,0.35)` | 玻璃边框 |

### 文字

| Token | 值 | 用途 |
|-------|-----|------|
| `--text-primary` | `#4A3F5C` | 主文字（深紫灰） |
| `--text-secondary` | `#7B6E94` | 次要文字 |
| `--text-tertiary` | `#A99BBF` | 辅助文字（占位符、时间） |
| `--text-on-primary` | `#FFFFFF` | 渐变背景上的白色文字 |

### 字体

| Token | 值 | 用途 |
|-------|-----|------|
| `--font-sans` | `'Nunito', ...` | UI 字体（圆润可爱） |
| `--font-mono` | `'JetBrains Mono', ...` | 数据字体（BPM、计时器、时长） |

### 间距

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-1` | `0.25rem` (4px) | 最小间距 |
| `--space-2` | `0.5rem` (8px) | 元素内间距 |
| `--space-3` | `0.75rem` (12px) | 紧凑间距 |
| `--space-4` | `1rem` (16px) | 标准间距 |
| `--space-6` | `1.5rem` (24px) | 区块间距 |
| `--space-8` | `2rem` (32px) | 大区块间距 |

### 圆角

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | `6px` | 小元素（标签） |
| `--radius-md` | `10px` | 中等元素 |
| `--radius-lg` | `16px` | 卡片、按钮、输入框 |
| `--radius-full` | `9999px` | 胶囊按钮、标签 |

### 阴影

| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-static` | `0 2px 8px rgba(74,63,92,0.06)` | 静态卡片 |
| `--shadow-elevated` | `0 8px 24px rgba(74,63,92,0.10)` | 提升卡片 |
| `--shadow-float` | `0 12px 32px rgba(74,63,92,0.14)` | 悬浮元素（FAB） |
| `--shadow-glow` | `0 4px 20px rgba(184,156,212,0.20)` | 主色发光（CTA、播放按钮） |

### 动效

| Token | 值 | 用途 |
|-------|-----|------|
| `--transition-fast` | `200ms ease-out` | 微交互（press、hover） |
| `--transition-base` | `300ms ease-out` | 标准过渡（展开、颜色变化） |
| `--transition-slow` | `500ms ease-out` | 页面切换、大幅动画 |

> 动效原则：全部 `ease-out`，不使用弹跳/快速闪烁。节奏像 Dream Pop — 缓慢、温柔。

## 页面结构说明

### 1. Dashboard（今日工作台）

```
┌─────────────────────────────┐
│ 早上好 ☁️          [app名]   │  ← 顶部问候
├─────────────────────────────┤
│ [电吉他] [木吉他] [尤克里里] │  ← 3列网格，各自渐变底色
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🎸 小知识卡片（渐变底色）│ │  ← 粉紫渐变 + 白字
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 今日推荐                     │
│ ┌─ [色条] 基础和弦转换 80BPM┐ │  ← 白色毛玻璃卡片
│ ├─ [色条] C大调音阶 100BPM  ┤ │
│ └─ [色条] 扫弦节奏 90BPM    ┘ │
├─────────────────────────────┤
│ 主要卡点                     │
│ [大横按切换慢] [节奏不稳]... │  ← 柔红胶囊标签
├─────────────────────────────┤
│ 技能进步        │
│ 和弦转换↑ 音阶↑ 节奏→ 拨弦↓ │  ← 2x2 网格
├─────────────────────────────┤
│    [工作台]  [素材库]  [周复盘]│  ← 底部导航
└─────────────────────────────┘
```

**交互逻辑**：
- 乐器卡片点击 → 跳转素材库（筛选该乐器）
- 推荐练习卡片点击 → 进入练习模式

### 2. Source Library（素材库）

```
┌─────────────────────────────┐
│ 素材库                       │
│ 管理你的练习来源              │
├─────────────────────────────┤
│ [全部] [B站] [YouTube] [教程书] [曲谱] │ ← flex-wrap 胶囊按钮
├─────────────────────────────┤
│ ▼ JustinGuitar 和弦课程      │
│ │ YouTube │ 12个课程         │  ← 展开状态
│ │ ├─ Open Chord Practice     │
│ │ │   BPM:80  和弦  2天前    │
│ │ ├─ Chord Transitions       │
│ │ │   BPM:90  转换·节奏 昨天 │
│ │ └─ Barre Chord Basics      │
│ │     BPM:60  大横按  今天    │
│ ▶ 小林信一 摇滚吉他  8个课程  │  ← 折叠状态
│ ▶ 押尾コータロー 指弹 5个课程│
├─────────────────────────────┤
│                        [+] │  ← 浮动添加按钮
├─────────────────────────────┤
│    [工作台]  [素材库]  [周复盘]│
└─────────────────────────────┘
```

**交互逻辑**：
- 分类标签：点击筛选，选中态渐变底色+白字
- 来源卡片：点击展开/折叠，chevron 旋转 180deg（300ms ease-out）
- Lesson 行：点击进入练习模式
- FAB 按钮：弹出底部添加表单（bottom sheet）

**添加 Lesson 表单字段**：
- 标题（文本输入框）
- 来源选择（下拉）
- 目标 BPM（数字输入 / 自定义 range 滑块）
- 技能标签（多选胶囊标签）
- 目标时长（胶囊按钮组点选）

### 3. Practice Session（练习模式）

```
┌─────────────────────────────┐
│ ←  基础和弦转换练习          │  ← 无底部导航
│    JustinGuitar               │
├─────────────────────────────┤
│                              │
│         05:23                │  ← 64px JetBrains Mono
│                              │
│      [⏸]  [▶]  [↺]         │  ← 3个圆形按钮
│                              │
│      当前 BPM                 │
│      [−]  80  [+]           │  ← 滑块或 +/- 按钮
│                              │
│      重复次数  3 / 10        │
│      ━━━━━━━━━━━━━━━━━░░░░  │  ← 进度条
│                              │
│ ┌─────────────────────────┐  │
│ │ 自我评价                 │  │
│ │ ★ ★ ★ ☆ ☆              │  │  ← 星星自评
│ │                          │  │
│ │ 今天遇到的问题            │  │
│ │ [节奏不稳✓] [换和弦慢✓] │  │  ← 多选标签
│ │ [手指僵硬] [其他]        │  │
│ │                          │  │
│ │ [写点什么吧~           ]  │  │  ← 备注文本框
│ └─────────────────────────┘  │
│                              │
│ ┌─────────────────────────┐  │
│ │     完成练习 ✨          │  │  ← 渐变全宽按钮
│ └─────────────────────────┘  │
└─────────────────────────────┘
```

**背景**：根据乐器切换渐变色（电吉他=淡琥珀、木吉他=淡薄荷、尤克里里=淡薰衣草）

**交互逻辑**：
- 计时器冒号有缓慢脉冲动画（2s 循环，opacity 1→0.3→1）
- 播放按钮有 `shadow-glow` 发光效果
- 星星点击切换填充/空心
- 卡点标签点击选中/取消
- "完成练习" → 保存记录 → 跳转周复盘

### 4. Weekly Review（周复盘）

```
┌─────────────────────────────┐
│ 周复盘                       │
│ 2025.06.30 - 2025.07.06     │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │    180    │    4 天      │ │  ← 渐变底色卡片，白色大字
│ │    分钟   │   练习天数    │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 本周练了什么                  │
│ 07/04  基础和弦转换  25min   │
│ 07/03  C大调音阶    20min   │
│ 07/02  扫弦节奏      30min  │
│ 06/30  和弦转换      40min  │
├─────────────────────────────┤
│ 技能进步                      │
│ ┌────────┐ ┌────────┐       │
│ │和弦转换 │ │音阶跑动 │       │  ← 2x2 网格
│ │45 vs 30↑│ │32 vs 40↓│      │
│ └────────┘ └────────┘       │
│ ┌────────┐ ┌────────┐       │
│ │节奏训练 │ │拨弦控制 │       │
│ │28 vs 20↑│ │15 vs 15→│      │
│ └────────┘ └────────┘       │
├─────────────────────────────┤
│ 反复卡点                      │
│ [大横按切换慢 ×5] [节奏不稳 ×4] │  ← 大小表示频率
│ [手指僵硬 ×3] [换和弦慢 ×2]   │
├─────────────────────────────┤
│ 下周建议                      │
│ ┃ 集中突破大横按              │  ← 左侧彩色竖条装饰
│ │ 本周大横按卡点最多...       │
│ ┃ 提升扫弦速度                │
│ │ 当前扫弦BPM 90，目标100    │
│ ┃ 复习音阶跑动                │
│ │ 上周音阶时间下降，需巩固     │
├─────────────────────────────┤
│    [工作台]  [素材库]  [周复盘]│
└─────────────────────────────┘
```

## 交互状态规范

### 按钮

| 状态 | 效果 |
|------|------|
| Default | 正常显示 |
| Hover | 背景色加深 / 阴影增大 |
| Active (press) | `transform: scale(0.97)` |
| Focus-visible | `outline: 2px solid var(--color-primary); outline-offset: 2px` |
| Disabled | `opacity: 0.5; cursor: not-allowed` |

### 底部导航

| 状态 | 效果 |
|------|------|
| Active | `color: var(--color-primary)`，图标+文字 |
| Inactive | `color: var(--text-tertiary)` |
| Hover | 颜色过渡 `var(--transition-base)` |

### 卡片

| 状态 | 效果 |
|------|------|
| Default | 毛玻璃背景 + `shadow-elevated` |
| Hover | `shadow-float`（阴影增大） |
| Active | `opacity: 0.8` 或 `scale(0.97)` |

### 来源卡片展开/折叠

- Chevron 旋转 `0deg ↔ 180deg`（`transition: transform var(--transition-base)`）
- Lessons 列表通过 `max-height` 动画展开（`transition: max-height var(--transition-slow)`）

### 计时器

- 冒号脉冲动画：`@keyframes colonPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`
- 动画周期：2s

### 星星自评

- 空心：`stroke: currentColor`，颜色 `var(--text-tertiary)`
- 填充：`fill: var(--color-primary)` + `stroke: var(--color-primary)`

## 数据模型建议

```typescript
interface Instrument {
  id: string;
  name: string;           // "电吉他" | "木吉他" | "尤克里里"
  gradient: string;       // 对应 CSS 渐变 token
  weeklyMinutes: number;
  lastPractice: Date;
}

interface Source {
  id: string;
  name: string;
  type: string;           // "bilibili" | "youtube" | "book" | "score"
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  sourceId: string;
  title: string;
  targetBPM: number;
  tags: string[];          // 技能标签 ["和弦", "节奏", "大横按"]
  lastPractice: Date | null;
}

interface PracticeSession {
  id: string;
  lessonId: string;
  instrument: string;
  date: Date;
  durationSeconds: number;
  bpm: number;
  repetitions: number;
  selfRating: 1 | 2 | 3 | 4 | 5;
  painPoints: string[];    // ["节奏不稳", "换和弦慢"]
  notes: string;
}

interface WeeklyReview {
  weekStart: Date;
  totalMinutes: number;
  practiceDays: number;
  sessions: PracticeSession[];
  skillProgress: SkillProgress[];
  recurringPainPoints: { name: string; count: number }[];
  suggestions: Suggestion[];
}
```

## 技术建议

### CSS 变量迁移

将 `colors_and_type.css` 中的 `:root` 变量直接复制到项目全局 CSS。框架无关，原生 CSS 变量在 React/Vue/Svelte 中均可直接使用。

### 毛玻璃效果

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-elevated);
}
```

### 响应式

- 移动端（<480px）：全宽，内容区 `max-width: 100%`
- 桌面端（>=480px）：内容区 `max-width: 480px`，居中显示
- 底部导航同样居中，`max-width: 480px`

### 无障碍

- 所有交互元素已有 `aria-label`
- 焦点可见状态：`outline: 2px solid var(--color-primary)`
- 减弱动画偏好：`@media (prefers-reduced-motion: reduce)` 将所有过渡设为 0.01ms

### 图标

设计稿使用 Lucide 图标库（圆角线条风格）。推荐在开发中使用 `lucide-react`（React）或 `lucide-vue-next`（Vue）。
