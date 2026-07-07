# AI 反馈页动画效果实施计划

## 概述
为 `src/pages/AIFeedbackPage.tsx` 添加动画效果，包括加载状态、打字机效果和渐入动画，保持现有功能不变。

## 改动清单

### 1. 导入新增依赖
- 导入 `AILoading` 组件（从 `@/components/AILoading`）
- 导入 `useTypewriter` hook（从 `@/hooks/useTypewriter`）
- 导入 `useState`, `useEffect`（从 `react`）

### 2. 加载状态
- 添加 `isLoading` 状态，初始为 `true`
- 使用 `useEffect` 在组件挂载后 1 秒设置 `isLoading = false`
- 加载时显示 `AILoading` 组件，文案为 "AI 分析中..."，size 为 `lg`
- 加载状态居中显示在页面内容区域

### 3. 打字机效果
- 对以下文本使用 `useTypewriter` hook：
  - `feedback.summary`（speed=30, startDelay=0）
  - `feedback.reason`（speed=30, startDelay=200）
  - `feedback.coverUpdate`（speed=30, startDelay=400）- 条件渲染
- nextSteps 和 avoid 为数组，不使用打字机效果（使用渐入动画即可）

### 4. 渐入动画（按顺序出现）
- 使用 CSS opacity + transform + transition 实现
- 各卡片按顺序延迟出现，每个延迟 150ms
- 动画效果：从 `opacity-0 translate-y-2` 到 `opacity-100 translate-y-0`
- 动画顺序：
  1. 今日总结卡片
  2. BPM 数据卡片组
  3. 可能原因卡片
  4. 下次练习计划卡片
  5. 不建议做什么卡片（条件渲染）
  6. Cover 进度更新卡片（条件渲染）
  7. 底部按钮组

## 技术细节
- 使用 Tailwind 现有的 transition 类
- 通过内联 style 设置 animationDelay 实现顺序动画
- 保持现有代码风格和 TypeScript 类型
- 不修改任何业务逻辑，只添加视觉效果
