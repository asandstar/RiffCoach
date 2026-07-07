# 代码审查与 Bug 修复计划

## 🔍 检查范围
- 9 个核心页面（TodayPage, CoverPage, ResourcePage, VideoStudyPage, KnowledgePage, PracticePage, AIFeedbackPage, ReviewPage, MePage）
- 底部导航、页面路由
- 组件跳转逻辑

## 🐛 发现的问题

### 1. 🔴 高优先级：TodayPage "继续观看"和"加入今日计划"按钮无响应
**文件**: [src/pages/TodayPage.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a486b37f296dc6b73da3fec/string-practice-compass/src/pages/TodayPage.tsx)
**位置**: 第 252-255 行
**问题**:
- "继续观看"按钮没有 onClick 事件，点击无反应
- "加入今日计划"按钮没有 onClick 事件，点击无反应
**修复**:
- "继续观看" → 跳转到 video-study 页面
- "加入今日计划" → 添加到今日计划（可先跳转到 resource 页面，或实现简单逻辑）

### 2. 🟡 中优先级：KnowledgePage "加入练习"和"相关视频"按钮无响应
**文件**: [src/pages/KnowledgePage.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a486b37f296dc6b73da3fec/string-practice-compass/src/pages/KnowledgePage.tsx)
**位置**: 第 260-268 行
**问题**:
- "加入练习"按钮没有 onClick 事件
- "相关视频"按钮没有 onClick 事件
**修复**:
- "加入练习" → 跳转到 practice 页面
- "相关视频" → 跳转到 resource 页面的视频 tab

### 3. 🟡 中优先级：KnowledgePage 返回按钮跳转到 "me" 页面，可能不合理
**文件**: [src/pages/KnowledgePage.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a486b37f296dc6b73da3fec/string-practice-compass/src/pages/KnowledgePage.tsx)
**位置**: 第 65 行
**问题**:
- 知识库是底部导航的一级页面，返回按钮跳转到"我的"页面不符合直觉
- 用户从底部导航进入知识库后，看到返回按钮会困惑
**修复**:
- 从底部导航进入的页面不需要返回按钮
- 或者返回按钮跳转到上一个页面（但目前没有路由历史）
- 建议：移除返回按钮，因为底部导航已经有"我的"了

### 4. 🟡 中优先级：VideoStudyPage 练习模式缺少返回按钮
**文件**: [src/pages/VideoStudyPage.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a486b37f296dc6b73da3fec/string-practice-compass/src/pages/VideoStudyPage.tsx)
**问题**:
- 视频学习页没有底部导航，用户只能通过左上角返回按钮返回
- 这是正确的，但需要确认返回按钮正常工作
- （已确认：第 264 行有返回按钮，跳转到 resource 页面，正常）

### 5. 🟢 低优先级：BottomNav 导入了未使用的 Calendar 图标
**文件**: [src/components/BottomNav.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a486b37f296dc6b73da3fec/string-practice-compass/src/components/BottomNav.tsx)
**位置**: 第 1 行
**问题**: 导入了 Calendar 但没有使用
**修复**: 移除未使用的导入

### 6. 🟡 中优先级：MePage "快速入口"中的"知识库"按钮可能重复
**文件**: [src/pages/MePage.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a486b37f296dc6b73da3fec/string-practice-compass/src/pages/MePage.tsx)
**问题**:
- 底部导航已经有"知识库"入口
- "我的"页面的快速入口又有一个"知识库"
- 可能造成冗余
**建议**: 保留也可以，方便用户快速访问，不算 bug

### 7. 🔴 高优先级：PracticePage 完成练习后的数据可能不完整
**文件**: [src/pages/PracticePage.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a486b37f296dc6b73da3fec/string-practice-compass/src/pages/PracticePage.tsx)
**问题**:
- PracticePage 的 handleComplete 函数中使用了 `currentLesson`，但这个变量可能是 undefined
- 需要检查是否所有情况下都有 currentLesson
- （需要进一步确认，可能在某些场景下 lessonId 为 null）

### 8. 🟡 中优先级：视频学习页练习模式的 Cover 进度更新可能有问题
**文件**: [src/pages/VideoStudyPage.tsx](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a486b37f296dc6b73da3fec/string-practice-compass/src/pages/VideoStudyPage.tsx)
**问题**:
- 练习模式的 handleCompletePractice 函数中使用了 `currentLesson`，但视频学习页可能没有对应的 lesson
- Cover 进度更新可能不会正确执行
- 这是新添加的功能，需要验证逻辑正确性

## 📋 修复步骤

### 步骤 1: 修复 TodayPage 按钮无响应
- 给"继续观看"按钮添加 onClick → 跳转到 video-study
- 给"加入今日计划"按钮添加 onClick → 跳转到 resource 页面

### 步骤 2: 修复 KnowledgePage 按钮无响应
- 给"加入练习"按钮添加 onClick → 跳转到 practice
- 给"相关视频"按钮添加 onClick → 跳转到 resource 页面

### 步骤 3: 修复 KnowledgePage 返回按钮
- 移除返回按钮（因为知识库是底部导航一级页面）
- 或者保留但跳转到 today 页面

### 步骤 4: 清理 BottomNav 未使用的导入
- 移除 Calendar 图标导入

### 步骤 5: 验证 VideoStudyPage 练习模式逻辑
- 检查 currentLesson 是否可能为 undefined
- 确保没有 lesson 时练习也能正常完成
- 确保 AI 反馈生成正常

### 步骤 6: 全面测试构建
- 运行 npm run build 确保无类型错误
- 检查所有页面跳转逻辑

## 📁 涉及文件
1. src/pages/TodayPage.tsx
2. src/pages/KnowledgePage.tsx
3. src/components/BottomNav.tsx
4. src/pages/VideoStudyPage.tsx（验证）
