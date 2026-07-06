# Checklist

## Task 1: Lesson 表单数据持久化
- [x] 添加表单中存在乐器选择器（电吉他/木吉他/尤克里里），默认选中"木吉他"
- [x] `saveLesson()` 将 `instrument` 字段写入 lesson 对象
- [x] `saveLesson()` 将 `targetDuration` 字段写入 lesson 对象（秒为单位）
- [x] `defaultData` 中示例 lesson 包含 `targetDuration` 字段
- [x] 新增课程后刷新页面，数据仍存在（localStorage 持久化正常）

## Task 2: Practice Session 硬编码参数修复
- [x] `startPractice()` 从 lesson 读取 `targetDuration`，不再硬编码 `10 * 60`
- [x] 计时器达到目标时长时有视觉提示（如颜色变化或提示文字）
- [x] `targetReps` 在 lesson 无配置时使用默认值 10
- [x] 练习模式下计时器、BPM、重复次数均正常工作

## Task 3: Dashboard 乐器卡片联动筛选
- [x] 点击 Dashboard 乐器卡片跳转到 Source Library
- [x] Source Library 仅显示对应乐器的来源和课程
- [x] 筛选状态在 Source Library 顶部可见（显示当前筛选乐器名）
- [x] 可通过"清除筛选"或"全部"标签恢复显示全部

## Task 4: Dashboard 技能进步卡片完善
- [x] 技能进步卡片显示 "X vs Y min" 数值对比
- [x] 箭头图标使用 Lucide `arrow-up/down/right`（与 Weekly Review 一致）
- [x] 技能命名统一为：和弦转换、音阶跑动、节奏训练、拨弦控制
- [x] Dashboard 和 Weekly Review 技能名称完全一致

## Task 5: Dashboard 推荐算法改进
- [x] 推荐列表优先展示超过 3 天未练习的课程
- [x] 推荐列表考虑用户近期卡点关联的课程
- [x] 推荐列表保持 3 条，不足时用其他课程补足
- [x] 推荐卡片显示推荐理由（如"3天未练习"）

## Task 6: Dashboard 全局空状态
- [x] 无 sessions 记录时 Dashboard 显示空状态引导卡片
- [x] 空状态包含图标 + "开始你的第一次练习" + 引导文案
- [x] 空状态下乐器卡片和小知识卡片仍可见
- [x] 有 sessions 记录时空状态不显示

## Task 7: Bottom Sheet 交互完善
- [x] Bottom sheet 顶部存在关闭按钮（Lucide `x` 图标）
- [x] 按 Escape 键可关闭表单
- [x] 点击关闭按钮可关闭表单
- [x] 关闭后表单输入被清空

## Task 8: 整体测试
- [x] 四个页面切换正常，底部导航 active 状态正确
- [x] 添加课程 → 进入练习 → 完成练习 → 周复盘全链路正常
- [x] 乐器卡片筛选联动正常
- [x] 空状态正确显示
- [x] Escape 键和关闭按钮正常工作
- [x] 响应式布局在移动端和桌面端正常
- [x] 无 console 报错
