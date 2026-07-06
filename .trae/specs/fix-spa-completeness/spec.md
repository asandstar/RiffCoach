# String Practice Compass SPA 完善修复 Spec

## Why
现有 `index.html` 已搭建完整 SPA 骨架（4 页面 + localStorage 持久化），但经评估发现 9 处功能缺陷/不完整项：表单数据丢失、硬编码参数、推荐算法缺失、页面间联动断裂、命名不一致等。本 Spec 旨在修复这些问题，使产品达到 DEV_HANDOFF.md 定义的可交付状态。

## What Changes
- 修复 `saveLesson()` 丢失 `formDuration` 和 `instrument` 字段的问题，添加乐器选择器
- 修复 `startPractice()` 中 `targetReps`/`targetDuration` 硬编码，改为从 lesson 读取
- 完善 Dashboard 技能进步卡片，显示 "X vs Y min" 数值对比
- 改进 Dashboard 推荐算法，基于最近练习时间 + 卡点关联推荐
- 修复 Dashboard 乐器卡片点击未联动 Source Library 筛选
- 统一技能命名（Dashboard "节奏感" → "节奏训练"）
- 统一技能进步箭头图标为 Lucide
- 接入 Dashboard 全局空状态视图
- 完善 Bottom Sheet 交互（关闭按钮 + Escape 键）

## Impact
- Affected code: `index.html`（单文件 SPA，所有修改集中在此文件）
- Affected data model: `Lesson` 新增 `targetDuration` 和 `instrument` 字段持久化
- Affected pages: Dashboard、Source Library、Practice Session

## MODIFIED Requirements

### Requirement: Lesson 表单数据持久化
`saveLesson()` 函数 SHALL 将表单收集的所有字段完整保存到 lesson 对象，包括 `title`、`sourceId`、`targetBPM`、`tags`、`instrument`、`targetDuration`。

#### Scenario: 添加新课程并选择乐器
- **WHEN** 用户在添加表单中选择乐器为"电吉他"、目标时长为 15 分钟
- **AND** 点击保存
- **THEN** 新建的 lesson 对象 `instrument` 字段为 `'electric'`，`targetDuration` 字段为 `900`（秒）
- **AND** 在素材库中可见该课程

#### Scenario: 添加表单乐器选择器
- **WHEN** 用户打开添加练习底部表单
- **THEN** 表单中 SHALL 存在乐器选择器（电吉他/木吉他/尤克里里），默认选中"木吉他"

### Requirement: Practice Session 目标参数从 Lesson 读取
`startPractice()` SHALL 从 lesson 对象读取 `targetDuration` 和 `targetReps`（如有），而非硬编码。

#### Scenario: 进入练习模式读取课程配置
- **WHEN** 用户点击一个目标时长 15 分钟的课程进入练习模式
- **THEN** 计时器目标时长 SHALL 显示为 15:00（到时提醒）
- **AND** 重复次数目标 SHALL 使用课程默认值（如无配置则默认 10）

### Requirement: Dashboard 乐器卡片联动筛选
Dashboard 乐器卡片点击 SHALL 传递乐器 ID 给 Source Library 进行筛选。

#### Scenario: 点击电吉他卡片筛选素材库
- **WHEN** 用户在 Dashboard 点击"电吉他"乐器卡片
- **THEN** 页面 SHALL 跳转到 Source Library
- **AND** Source Library SHALL 仅显示 instrument 为 `'electric'` 的来源和课程

### Requirement: Dashboard 技能进步数值展示
Dashboard 技能进步卡片 SHALL 显示本周 vs 上周的分钟数对比，格式与 Weekly Review 一致。

#### Scenario: 技能进步卡片显示数值
- **WHEN** Dashboard 渲染技能进步区域
- **THEN** 每个 skill-card SHALL 显示 "X vs Y min" 格式的数值对比
- **AND** 使用 Lucide `arrow-up/down/right` 图标（与 Weekly Review 统一）

### Requirement: 统一技能命名
技能名称 SHALL 在所有页面保持一致。

#### Scenario: 技能名称一致性
- **WHEN** 用户在 Dashboard 和 Weekly Review 之间切换
- **THEN** 技能名称 SHALL 完全一致（和弦转换、音阶跑动、节奏训练、拨弦控制）

### Requirement: Dashboard 全局空状态
Dashboard SHALL 在无任何练习记录时显示全局空状态视图。

#### Scenario: 首次使用空状态
- **WHEN** 用户首次打开应用且无任何 sessions 记录
- **THEN** Dashboard SHALL 显示空状态引导卡片（图标 + "开始你的第一次练习" + 引导文案）
- **AND** 乐器卡片和小知识卡片仍可见

### Requirement: Bottom Sheet 交互完善
添加练习底部表单 SHALL 支持关闭按钮和 Escape 键关闭。

#### Scenario: Escape 键关闭表单
- **WHEN** 用户打开添加练习表单后按 Escape 键
- **THEN** 表单 SHALL 关闭

#### Scenario: 关闭按钮关闭表单
- **WHEN** 用户点击表单内的关闭按钮
- **THEN** 表单 SHALL 关闭

### Requirement: Dashboard 推荐算法改进
今日推荐 SHALL 基于练习历史进行智能推荐，而非简单取前 3 条。

#### Scenario: 基于卡点推荐
- **WHEN** 用户最近练习中频繁出现"节奏不稳"卡点
- **THEN** 推荐列表 SHALL 优先展示与节奏相关的课程

#### Scenario: 基于久未练习推荐
- **WHEN** 某课程超过 3 天未练习
- **THEN** 推荐列表 SHALL 优先展示该课程
