# Tasks

- [x] Task 1: 修复 Lesson 表单数据持久化
  - [x] SubTask 1.1: 在添加表单 HTML 中添加乐器选择器（电吉他/木吉他/尤克里里下拉或胶囊按钮组），默认选中"木吉他"
  - [x] SubTask 1.2: 修改 `saveLesson()` 函数，将 `formDuration` 和 `instrument` 字段写入 lesson 对象
  - [x] SubTask 1.3: 确保 `defaultData` 中的示例 lesson 对象包含 `targetDuration` 字段

- [x] Task 2: 修复 Practice Session 硬编码参数
  - [x] SubTask 2.1: 修改 `startPractice()`，从 lesson 对象读取 `targetDuration`（如有），移除 `targetDuration = 10 * 60` 硬编码
  - [x] SubTask 2.2: 添加计时器到时提醒（计时器达到目标时长时视觉提示）
  - [x] SubTask 2.3: 保留 `targetReps = 10` 作为默认值（lesson 无此字段时的 fallback）

- [x] Task 3: 修复 Dashboard 乐器卡片联动筛选
  - [x] SubTask 3.1: 修改乐器卡片 `onclick`，传递 `instrument` 参数：`navigateTo('source-library', { instrument: 'electric' })`
  - [x] SubTask 3.2: 修改 `navigateTo()` 或 `renderSourceLibrary()`，接收并应用 instrument 筛选参数
  - [x] SubTask 3.3: 筛选状态在 Source Library 顶部显示当前筛选的乐器名，并可通过"清除筛选"恢复全部

- [x] Task 4: 完善 Dashboard 技能进步卡片
  - [x] SubTask 4.1: 修改 `renderDashboard()` 中技能进步卡片渲染，添加 "X vs Y min" 数值显示
  - [x] SubTask 4.2: 将内联 SVG 箭头替换为 Lucide `arrow-up/down/right` 图标，与 Weekly Review 统一
  - [x] SubTask 4.3: 统一技能命名：将 Dashboard 的 "节奏感" 改为 "节奏训练"

- [x] Task 5: 改进 Dashboard 推荐算法
  - [x] SubTask 5.1: 实现推荐算法：优先展示久未练习的课程（超过 3 天），其次关联用户近期卡点的课程
  - [x] SubTask 5.2: 推荐列表数量保持 3 条，不足时用其他课程补足
  - [x] SubTask 5.3: 推荐卡片可显示推荐理由（如"3天未练习"、"卡点关联"）

- [x] Task 6: 接入 Dashboard 全局空状态
  - [x] SubTask 6.1: 在 Dashboard HTML 中添加空状态容器（图标 + "开始你的第一次练习" + 引导文案）
  - [x] SubTask 6.2: 修改 `renderDashboard()`，当 `state.sessions.length === 0` 时显示空状态，隐藏推荐/卡点/技能区域

- [x] Task 7: 完善 Bottom Sheet 交互
  - [x] SubTask 7.1: 在 bottom-sheet 顶部添加关闭按钮（Lucide `x` 图标）
  - [x] SubTask 7.2: 添加 `keydown` 事件监听 Escape 键关闭表单
  - [x] SubTask 7.3: 关闭时清空表单输入

- [x] Task 8: 整体测试与验证
  - [x] SubTask 8.1: 本地服务器启动，浏览器测试四个页面切换正常
  - [x] SubTask 8.2: 测试添加课程 → 进入练习 → 完成练习 → 周复盘全链路
  - [x] SubTask 8.3: 测试乐器卡片筛选联动
  - [x] SubTask 8.4: 测试空状态显示
  - [x] SubTask 8.5: 测试 Escape 键和关闭按钮

# Task Dependencies
- Task 2 depends on Task 1（Practice Session 需要读取 lesson 中持久化的 targetDuration）
- Task 8 depends on Task 1, 2, 3, 4, 5, 6, 7（所有功能修复完成后进行整体测试）
- Task 3, 4, 5, 6, 7 互相独立，可并行
