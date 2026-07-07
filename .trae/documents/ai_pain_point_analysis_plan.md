# AI 卡点智能分析模块实施计划

## 目标
在 ReviewPage.tsx 中新增"AI 卡点智能分析"模块，展示本周 TOP3 卡点、出现次数、AI 改进建议及柱状图可视化。

## 背景信息
- 项目使用 React + TypeScript + Tailwind CSS
- 状态管理使用 Zustand
- 图标库使用 lucide-react
- 已有 `painCounts` 统计卡点出现次数
- 已有 AILoading 组件可用于加载状态
- 数据类型 `PainPoint` 已定义在 `@/types`

## 变更内容

### 1. 导入新增依赖
**文件**: `src/pages/ReviewPage.tsx`
- 从 `@/components/AILoading` 导入 `AILoading` 组件
- 从 `lucide-react` 补充导入 `Sparkles` 图标

### 2. 计算 TOP3 卡点数据
**文件**: `src/pages/ReviewPage.tsx`
- 基于已有的 `painCounts` 对象，按出现次数降序排序
- 取前 3 个卡点作为 TOP3
- 计算最大次数用于柱状图比例计算

### 3. Mock AI 改进建议数据
**文件**: `src/pages/ReviewPage.tsx`
- 创建一个卡点到建议的映射对象（mock 数据）
- 针对每种常见卡点提供专业的练习建议
- 建议内容参考 `aiMock.ts` 中的风格

### 4. 添加"AI 卡点智能分析"模块 UI
**文件**: `src/pages/ReviewPage.tsx`
- 位置：在现有"反复卡点"模块之后，"AI 下周建议"模块之前
- 使用 `GlassCard` 组件包裹
- 标题包含 `Sparkles` 图标，表示 AI 智能分析
- 包含内容：
  - 柱状图可视化（用 div 模拟，水平柱状图）
  - TOP3 卡点列表，每个卡点显示：
    - 排名序号
    - 卡点名称
    - 出现次数
    - AI 改进建议

### 5. 柱状图实现
- 使用纯 div + Tailwind 样式实现水平柱状图
- 柱子宽度按最大次数的比例计算
- 使用渐变色或主题色
- 每个柱子旁显示卡点名称和次数

## 代码风格要求
- 保持与现有代码一致的 TypeScript 类型定义
- 使用与现有模块一致的 GlassCard、间距、字体样式
- 遵循现有代码的命名约定和组件结构
- 不添加注释
- 不引入新的第三方依赖

## 非目标
- 不修改现有功能
- 不修改其他文件
- 不使用第三方图表库
