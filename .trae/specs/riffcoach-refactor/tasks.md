# RiffCoach 前端项目化 + 资料学习体验重构 - 实现计划

## [ ] Task 1: 初始化 Vite + React + TypeScript 项目
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 使用 Vite 创建 React + TypeScript 项目
  - 安装 Tailwind CSS 3、Lucide React、Zustand（状态管理）
  - 配置路径别名
  - 创建基础样式文件（tokens.css, global.css）
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: `npm run dev` 启动无编译错误
  - `programmatic` TR-1.2: `npm run build` 构建成功
- **Notes**: 项目根目录初始化，保留旧 index.html 作为参考

## [ ] Task 2: 定义类型系统
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 创建 `src/types/index.ts`
  - 定义所有数据类型：Lesson、Session、CoverProject、CoverSection、MaterialInboxItem、VideoResource、KnowledgeBaseItem 等
  - 定义状态接口 AppState
- **Acceptance Criteria Addressed**: FR-1
- **Test Requirements**:
  - `programmatic` TR-2.1: TypeScript 编译无类型错误
- **Notes**: 参考旧代码中的数据结构

## [ ] Task 3: 实现状态管理和数据层
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 创建 `src/store/useAppStore.ts` 使用 Zustand
  - 实现 loadData、saveData、migrateData 函数
  - 兼容旧 localStorage 数据迁移
  - 添加新字段默认值（materialInbox、videoResources 等）
- **Acceptance Criteria Addressed**: FR-11, AC-7
- **Test Requirements**:
  - `human-judgment` TR-3.1: 旧数据能正常加载和迁移
  - `human-judgment` TR-3.2: 新字段自动补齐默认值
- **Notes**: 保留旧数据结构，新增字段不破坏兼容性

## [ ] Task 4: 实现 B站工具函数
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 创建 `src/utils/bilibili.ts`
  - 实现 extractBvid、buildBiliPlayerUrl、fetchBiliEpisodes、normalizeBiliEpisodes、getBiliFallbackEpisodes
  - fetchBiliEpisodes 带多代理兜底，失败返回 null
- **Acceptance Criteria Addressed**: FR-6, AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: extractBvid 能正确提取 BVID
  - `human-judgment` TR-4.2: 获取选集失败时 UI 不卡死，提供手动输入
- **Notes**: 代理列表可配置，超时时间 5 秒

## [ ] Task 5: 创建默认数据和演示数据
- **Priority**: high
- **Depends On**: Task 2, Task 4
- **Description**: 
  - 创建 `src/data/defaultData.ts` - 默认配置和知识库数据
  - 创建 `src/data/demoData.ts` - 演示数据生成函数
  - 创建 `src/data/videoResources.ts` - 8 个视频资源数据
  - 创建 `src/data/knowledgeBase.ts` - 目录式知识库数据
- **Acceptance Criteria Addressed**: FR-7
- **Test Requirements**:
  - `human-judgment` TR-5.1: 演示数据包含 8 个视频资源
  - `human-judgment` TR-5.2: 知识库目录结构完整（电吉他、木吉他、尤克里里）
- **Notes**: 视频资源包含真实 BVID，演示不依赖视频成功加载

## [ ] Task 6: 创建基础组件和页面壳
- **Priority**: high
- **Depends On**: Task 1, Task 3
- **Description**: 
  - 创建 `src/components/GlassCard.tsx` - 玻璃拟态卡片组件
  - 创建 `src/components/BottomNav.tsx` - 底部导航组件
  - 创建 `src/components/PageShell.tsx` - 页面外壳组件
  - 创建 `src/components/QuickAddMaterialSheet.tsx` - 快速添加资料弹窗
- **Acceptance Criteria Addressed**: FR-2, FR-8
- **Test Requirements**:
  - `human-judgment` TR-6.1: 底部导航 5 个入口正常切换
  - `human-judgment` TR-6.2: 玻璃拟态风格一致
- **Notes**: 保留当前视觉风格，使用 CSS 变量

## [ ] Task 7: 实现今日页
- **Priority**: high
- **Depends On**: Task 3, Task 5, Task 6
- **Description**: 
  - 创建 `src/pages/TodayPage.tsx`
  - 包含：RiffCoach Hero、高效练习模式、当前 Cover 目标、今日推荐、快速添加入口、最近视频卡片
  - 实现 generateEfficientPracticePlan 集成
- **Acceptance Criteria Addressed**: FR-10, AC-6
- **Test Requirements**:
  - `human-judgment` TR-7.1: 高效练习计划生成正常
  - `human-judgment` TR-7.2: 快速添加和最近视频入口可用
- **Notes**: 保留现有高效练习逻辑

## [ ] Task 8: 实现 Cover 页面
- **Priority**: high
- **Depends On**: Task 3, Task 5, Task 6
- **Description**: 
  - 创建 `src/pages/CoverPage.tsx`
  - 显示 Cover 项目列表、项目详情、段落进度、AI 拆解
  - 实现 updateCoverProgressFromSession
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgment` TR-8.1: Cover 项目卡片显示正确
  - `human-judgment` TR-8.2: 段落进度计算正确
- **Notes**: 保留现有 Cover 逻辑

## [ ] Task 9: 实现资料中心页面
- **Priority**: high
- **Depends On**: Task 3, Task 4, Task 5, Task 6
- **Description**: 
  - 创建 `src/pages/ResourcePage.tsx`
  - 包含：搜索/粘贴入口、最近使用、素材篮、视频教程、已整理练习
  - 实现 AI 整理资料功能（analyzeMaterial）
- **Acceptance Criteria Addressed**: FR-3, AC-2, AC-3
- **Test Requirements**:
  - `human-judgment` TR-9.1: 搜索和快速添加正常
  - `human-judgment` TR-9.2: AI 整理生成 2-4 个建议任务
- **Notes**: 素材篮状态：unprocessed、processed、converted

## [ ] Task 10: 实现视频学习页
- **Priority**: high
- **Depends On**: Task 3, Task 4, Task 6
- **Description**: 
  - 创建 `src/pages/VideoStudyPage.tsx`
  - 创建 `src/components/VideoPlayerCard.tsx`
  - 创建 `src/components/VideoEpisodePicker.tsx`
  - 实现选集切换（自动获取 + 手动输入兜底）
- **Acceptance Criteria Addressed**: FR-5, AC-4
- **Test Requirements**:
  - `human-judgment` TR-10.1: 选集切换 iframe 参数更新
  - `human-judgment` TR-10.2: 获取失败时可手动输入 P 数
- **Notes**: 手动输入时更新 localStorage

## [ ] Task 11: 实现知识库页面
- **Priority**: medium
- **Depends On**: Task 3, Task 5, Task 6
- **Description**: 
  - 创建 `src/pages/KnowledgePage.tsx`
  - 创建 `src/components/KnowledgeSidebar.tsx`
  - 桌面端：左侧目录 + 右侧内容
  - 移动端：横向滑动一级目录 + 二级列表 + 内容卡片
- **Acceptance Criteria Addressed**: FR-4, AC-5
- **Test Requirements**:
  - `human-judgment` TR-11.1: 目录导航正常
  - `human-judgment` TR-11.2: 知识点详情完整展示
- **Notes**: 知识库数据从 knowledgeBase.ts 加载

## [ ] Task 12: 实现练习页和 AI 反馈页
- **Priority**: medium
- **Depends On**: Task 3, Task 6
- **Description**: 
  - 创建 `src/pages/PracticePage.tsx` - 练习页面
  - 创建 `src/pages/AIFeedbackPage.tsx` - AI 反馈页面
  - 实现计时器、节拍器、自评、卡点、AI 反馈生成
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgment` TR-12.1: 练习流程正常（计时、节拍器、完成）
  - `human-judgment` TR-12.2: AI 反馈完整显示（总结、BPM、建议）
- **Notes**: 保留现有练习逻辑和 AI mock 引擎

## [ ] Task 13: 实现复盘页和我的页
- **Priority**: medium
- **Depends On**: Task 3, Task 6
- **Description**: 
  - 创建 `src/pages/ReviewPage.tsx` - 周复盘页面
  - 创建 `src/pages/MePage.tsx` - 我的页面
  - 包含：本周统计、Cover 进度、AI 建议、日历、导入导出、演示数据
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgment` TR-13.1: 周复盘数据正确显示
  - `human-judgment` TR-13.2: 导入导出功能正常
- **Notes**: 保留现有复盘逻辑

## [ ] Task 14: 整合主应用和路由
- **Priority**: high
- **Depends On**: Task 6-13
- **Description**: 
  - 创建 `src/App.tsx` - 主应用组件
  - 创建 `src/main.tsx` - 入口文件
  - 实现客户端路由（基于 URL hash 或状态）
  - 处理练习页隐藏底部导航
- **Acceptance Criteria Addressed**: AC-1, AC-6
- **Test Requirements**:
  - `human-judgment` TR-14.1: 所有页面能正常切换
  - `human-judgment` TR-14.2: 练习页隐藏底部导航
- **Notes**: 使用简单的状态路由，不引入 react-router

## [ ] Task 15: 测试和验证
- **Priority**: high
- **Depends On**: Task 1-14
- **Description**: 
  - 完整走一遍演示路径
  - 修复发现的 bug
  - 验证数据迁移
  - 检查控制台错误
- **Acceptance Criteria Addressed**: AC-1-7
- **Test Requirements**:
  - `human-judgment` TR-15.1: 完整演示路径无报错
  - `human-judgment` TR-15.2: 控制台无明显错误
  - `human-judgment` TR-15.3: 旧数据迁移成功
- **Notes**: 重点测试资料中心、视频学习页、知识库
