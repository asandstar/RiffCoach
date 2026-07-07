# TodayPage 增强计划

## 概述

对 `src/pages/TodayPage.tsx` 进行功能增强和视觉优化，保持现有功能不变，添加动画效果和视觉层次。

## 变更清单

### 1. 导入新组件和 Hook
- 从 `@/components/AILoading` 导入 `AILoading` 组件
- 从 `@/hooks/useTypewriter` 导入 `useTypewriter` hook

### 2. 添加加载状态
- 使用 `useState` 添加 `isGenerating` 状态
- 在 `handleGeneratePlan` 函数中：
  - 设置 `isGenerating = true`
  - 等待 1.5 秒（使用 `setTimeout`）
  - 生成计划
  - 设置 `isGenerating = false`
- "生成今日计划"按钮在生成期间显示禁用状态和加载文案

### 3. 计划展示区域加载状态
- 在生成计划期间（`isGenerating` 为 true），在计划卡片位置显示 `AILoading` 组件
- 加载文案："AI 正在为你定制练习计划..."

### 4. 打字机效果
- 对计划的 `target` 和 `reason` 文本应用打字机效果
- 使用 `useTypewriter` hook
- `target` 打字速度：40ms，延迟：0ms
- `reason` 打字速度：25ms，延迟：800ms（在 target 之后开始）
- 仅在新生成计划时触发打字效果（使用 key 或状态控制重置）

### 5. Hero 区域优化

#### 5.1 标题优化
- 主标题从 "RiffCoach" 改为更有吸引力的文案，例如："今天，让琴弦为你歌唱 🎸"
- 副标题从 "从喜欢的歌，到第一支 cover" 改为更有行动力的文案，例如："20 分钟，离你的目标 cover 更近一步"

#### 5.2 添加"3步开始练习"引导
- 在 Hero 区域添加三步引导：
  - 第1步：告诉 AI 你今天有多少时间
  - 第2步：AI 生成最小有效练习计划
  - 第3步：一键开始练习
- 使用图标 + 文字的横向排列布局
- 使用数字序号或图标标识步骤

#### 5.3 视觉层次优化
- 增大标题字号和字重
- 添加渐变色标题效果（使用 bg-clip-text）
- 调整按钮样式，主按钮更突出
- 优化间距和内边距，营造呼吸感

## 技术细节

### 状态管理
- 新增 `isGenerating: boolean` 状态
- 新增 `planKey: number` 状态（用于重置打字机效果，每次生成新计划时递增）

### 打字机效果实现
- 使用 `useTypewriter` hook 分别处理 `target` 和 `reason`
- 通过 `planKey` 作为 key 或依赖项来触发重置
- 保持 steps、avoid、completion 等其他文本不变（无打字效果）

### 组件结构变更
- Hero 区域 GlassCard 内部重构
- 计划生成区域条件渲染（加载中 vs 计划内容）

## 文件影响

仅修改 `src/pages/TodayPage.tsx` 一个文件。

## 保持不变的功能
- 时间选择功能
- 精力选择功能
- 计划生成逻辑（generateEfficientPracticePlan）
- 开始练习跳转
- 当前 Cover 目标展示
- 快速添加资料
- 最近视频展示
- 最近练习展示
- 加载演示数据功能
