# RiffCoach 前端项目化 + 资料学习体验重构

## Overview
- **Summary**: 将当前单文件 HTML 的 RiffCoach 重构为标准前端项目（Vite + React + TypeScript），拆分模块结构，优化资料中心和知识库体验，修复B站选集切换问题，提升整体可用性。
- **Purpose**: 解决当前布局不方便、高频功能入口过深、视频教程信息不足、知识库查阅体验差、选集切换不稳定等问题，让产品更像真正可用的学习工具。
- **Target Users**: 业余吉他学习者（电吉他、木吉他、尤克里里），需要高效练习计划和系统化学习资源管理。

## Goals
- 将单文件 HTML 重构为 Vite + React + TypeScript 模块化项目
- 重新设计底部导航，突出"资料"入口
- 重构资料中心，整合视频教程、素材篮、已整理练习
- 重构知识库为目录式结构，提升查阅效率
- 修复B站选集切换不稳定问题，提供兜底方案
- 新增快速添加资料流程（素材篮）
- 保留所有现有核心功能（今日高效练习、Cover目标、练习页、AI反馈、周复盘等）
- 实现旧 localStorage 数据迁移

## Non-Goals (Out of Scope)
- 不添加真实后端或云服务
- 不接真实 AI API（继续使用 mock）
- 不改变梦幻玻璃拟态视觉风格
- 不删除任何现有页面或功能
- 不引入新的前端框架（保持 React）

## Background & Context
- 当前项目是单文件 HTML，包含约 5000+ 行代码
- 使用 Tailwind CSS (CDN) 和 Lucide 图标
- localStorage 存储，包含 sources、lessons、sessions、coverProjects、knowledgeBase 等数据
- 已有 AI mock 引擎（generateEfficientPracticePlan、generateAIFeedback）
- B站视频嵌入已有基本功能，但选集切换不稳定

## Functional Requirements

### FR-1: 项目结构重构
- 将单文件 index.html 拆分为模块化的 React 组件结构
- 使用 TypeScript 定义所有数据类型
- 使用 Vite 作为构建工具

### FR-2: 底部导航重新设计
- 保留 5 个入口：今日、Cover、资料、复盘、我的
- "资料"页作为高频入口，整合视频教程和素材管理

### FR-3: 资料中心重构
- 顶部搜索/粘贴链接快速入口
- 4 个区域：最近使用、素材篮、视频教程、已整理练习
- 视频卡片展示：标题、乐器、难度、阶段、技能标签、AI摘要

### FR-4: 知识库重构
- 桌面端：左侧目录 + 右侧内容
- 移动端：横向滑动一级目录 + 二级列表 + 内容卡片
- 每个知识点包含：标题、解释、阶段、关联技能、常见错误、练习建议

### FR-5: 视频学习页重构
- 顶部：返回、标题、来源标签
- 主区域：B站 iframe 播放器
- 右侧/下方：视频关键信息卡、选集区域
- 选集切换失败时提供手动输入兜底

### FR-6: B站工具函数抽离
- extractBvid(url): 从URL提取BVID
- buildBiliPlayerUrl(bvid, page): 构建播放器URL
- fetchBiliEpisodes(bvid): 获取选集（带多代理兜底）
- normalizeBiliEpisodes(apiResponse): 标准化响应
- getBiliFallbackEpisodes(maxPage): 获取兜底选集列表

### FR-7: 视频资源数据优化
- 新增 videoResources 数据结构
- 包含 8 个以上演示视频资源
- 每个资源包含：标题、来源、乐器、难度、阶段、技能、摘要、关键要点、建议练习

### FR-8: 资料快速添加流程
- QuickAddMaterialSheet 组件
- 轻量字段：链接/标题、类型、用途、备注
- 支持"先放进素材篮"和"AI整理成练习任务"

### FR-9: AI 整理资料
- analyzeMaterial(material, state): 根据资料生成建议练习任务
- 支持预览，用户确认后加入素材库

### FR-10: 今日页入口优化
- "刚看到一个教程？"快速添加入口
- "继续看上次的视频"最近打开视频卡片

### FR-11: 数据迁移
- 兼容旧 localStorage 数据
- 自动补齐新字段（materialInbox、videoResources、recentResources、favoriteResources）

## Non-Functional Requirements
- **NFR-1**: 移动端优先，响应式设计
- **NFR-2**: 核心演示断网可跑通
- **NFR-3**: 保留梦幻玻璃拟态视觉风格
- **NFR-4**: 代码可维护性，模块拆分清晰

## Constraints
- **Technical**: Vite + React + TypeScript，Tailwind CSS，localStorage 存储
- **Business**: 比赛提交用，必须稳定可用
- **Dependencies**: Lucide React、Tailwind CSS、Vite

## Assumptions
- 用户有基础前端开发环境（Node.js >= 18）
- 不需要真实后端或 AI API
- 现有 localStorage 数据需要迁移

## Acceptance Criteria

### AC-1: 项目可构建运行
- **Given**: 已安装依赖
- **When**: 运行 `npm run dev`
- **Then**: 项目正常启动，无编译错误
- **Verification**: `programmatic`

### AC-2: 资料页可搜索和快速添加
- **Given**: 用户在资料页
- **When**: 粘贴 B站链接并点击"快速添加"
- **Then**: 资料进入素材篮，状态为"未整理"
- **Verification**: `human-judgment`

### AC-3: AI 整理资料生成练习任务
- **Given**: 素材篮有未整理资料
- **When**: 点击"AI 整理"
- **Then**: 显示 2-4 个建议练习任务预览
- **Verification**: `human-judgment`

### AC-4: 视频学习页选集切换
- **Given**: 进入视频学习页
- **When**: 切换选集（自动或手动）
- **Then**: iframe page 参数更新，当前选集高亮，数据保存
- **Verification**: `human-judgment`

### AC-5: 知识库目录式浏览
- **Given**: 进入知识库
- **When**: 点击左侧目录或横向滑动导航
- **Then**: 右侧内容区域更新，显示知识点详情
- **Verification**: `human-judgment`

### AC-6: 完整演示路径
- **Given**: 打开项目，加载演示数据
- **When**: 按验收路径操作
- **Then**: 所有步骤正常完成，无报错
- **Verification**: `human-judgment`

### AC-7: 旧数据迁移
- **Given**: localStorage 有旧版数据
- **When**: 打开新项目
- **Then**: 数据自动迁移，无丢失，新功能正常使用
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要保留旧的 pages/ 和 partials/ 目录？（计划删除，使用新的组件结构）
