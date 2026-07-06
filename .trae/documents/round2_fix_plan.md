# RiffCoach 第二轮修复和验收优化计划

## 现状分析

当前项目是单文件 HTML 应用（RiffCoach / String Practice Compass），已完成第一轮叙事重构，新增了 AI 高效练习、Cover 目标、AI mock 反馈、演示数据等功能。

**已确认语法无错误**（Node.js --check 通过），但存在以下问题需要修复。

---

## 一、数据结构统一（高优先级）

### 1.1 painPointDetails 字段类型统一
- **问题**：需求文档说"旧 session 没有 painPointDetails 时设为空对象"，但代码实际使用数组类型
- **决策**：统一为数组类型（与现有代码一致），更新 migrateData 的默认值逻辑
- **修改位置**：migrateData 函数

### 1.2 importData 缺少数据迁移
- **问题**：导入数据时没有调用 migrateData，可能导致旧格式数据导入后出错
- **修复**：在 importData 中调用 migrateData(data) 后再赋值

### 1.3 字段兜底检查
- 检查 state.coverProjects 默认空数组 ✓（已实现）
- 检查 lesson.projectId / sectionId 默认 null ✓（已实现）
- 检查 session.aiFeedback 默认 null ✓（已实现）
- 检查 session.cleanBPM 推断逻辑 ✓（已实现）
- 检查 currentEfficientPlan 默认 null ✓（已实现）
- 检查 videoSize 默认 compact ✓（已实现）
- 检查 knowledgeBase 默认值 ✓（已实现）

---

## 二、演示路径关键按钮修复（高优先级）

### 2.1 重复确认问题
- **问题**：点击"加载比赛演示数据"会弹两次 confirm（btn-load-demo 事件里一次，generateDemoData 里又一次）
- **修复**：btn-load-demo 事件里去掉 confirm，只保留 generateDemoData 内的 confirm
- **注意**："我的"页直接调用 generateDemoData() 的按钮也会有 confirm，是合理的

### 2.2 生成计划按钮空值保护
- **问题**：btn-generate-plan 点击时直接取 .plan-time-btn.active 和 .plan-state-btn.active，如果没有选中会报错
- **修复**：添加 null check，没有选中时给出提示或使用默认值

### 2.3 一键开始练习按钮绑定
- **问题**：btn-start-plan-practice 使用 onclick 赋值，可能在重新渲染后失效
- **确认**：当前是在 btn-generate-plan 的 click 事件里赋值，只要 plan 结果不被重新渲染应该没问题
- **加固**：确保 dashboard 重新渲染时不会重置 plan 结果区域

---

## 三、练习状态管理修复（高优先级）

### 3.1 stopPracticeRuntime 调用完整性检查
- **已确认调用位置**：
  - navigateTo 离开练习页 ✓
  - startPractice 开始前 ✓
  - completePractice ✓
  - generateDemoData ✓
- **待确认**：
  - resetTimer / 重置练习
  - 重新开始另一个练习

### 3.2 计时器/节拍器防重复启动
- **检查**：toggleTimer 和 toggleMetronome 启动前是否先清理旧 interval
- **修复**：确保启动前调用 clearInterval 防止重复

---

## 四、AI 反馈和高效练习计划修复（高优先级）

### 4.1 generateAIFeedback 输出结构检查
- **问题**：需求要求 nextPlan.steps 必须是数组至少 3 步
- **当前**：有 nextSteps 数组，但返回结构中字段名是 nextPlan（字符串）和 nextSteps（数组）
- **修复**：统一输出结构，确保 renderAIFeedbackPage 使用正确字段

### 4.2 高效练习计划兜底逻辑
- **问题**：没有 coverProjects 时的回退逻辑
- **确认**：startPracticeFromPlan 中有回退到素材库的逻辑 ✓
- **加固**：generateEfficientPracticePlan 在无数据时也要返回合理结构，不报错

---

## 五、Cover 页面修复（高优先级）

### 5.1 空状态
- ✓ 已实现空状态

### 5.2 进度计算
- 总进度：sections 平均 progress ✓
- 最高干净 BPM：取最大值 ✓
- 最大卡点：聚合统计 ✓

### 5.3 继续练习入口
- 检查 startPracticeFromProject 是否正确关联 lesson
- ✓ 已实现临时 lesson 创建逻辑

---

## 六、周复盘修复（中优先级）

### 6.1 Date 对象修改问题
- 检查 getThisWeekSessions / getLastWeekSessions 是否修改原始 Date 对象
- 使用新的 Date 实例进行计算，避免副作用

### 6.2 AI 下周建议来源
- 优先使用最近一次 session.aiFeedback.nextPlan
- 没有则回退到 generateSuggestions

### 6.3 Cover 进度区域空状态
- 没有 coverProjects 时隐藏或显示友好提示

---

## 七、我的页面修复（中优先级）

### 7.1 renderProfilePage 实现
- **问题**：当前是空函数，只调用 lucide.createIcons()
- **分析**：HTML 是静态的，按钮用 onclick 属性，理论上应该能工作
- **确认**：检查是否有动态内容需要渲染

### 7.2 日历和知识库返回路径
- 检查二级页面返回按钮是否正常工作
- practiceLessonId / practiceProjectId 等变量在返回时不需要重置

---

## 八、控制台错误修复（中优先级）

### 8.1 已知问题
- lucide.createIcons 安全检查 ✓（已全部添加 window.lucide 判断）
- lightColors 越界 ✓（已修复，搜索无结果）
- refreshFormUI 调用 ✓（已委托给 updateFormChipSelections）

### 8.2 待检查
- fetchBiliEpisodes 失败时的错误处理
- iframe src 为空时的处理
- getLessonById 返回 null 时的调用方保护

---

## 九、UI 和移动端体验（中优先级）

### 9.1 底部导航遮挡
- 检查页面底部 padding 是否足够
- 练习页长内容滚动

### 9.2 Hero 卡片高度
- 确保首屏能看到核心按钮

### 9.3 按钮按压反馈
- glass-card 已有 :active 缩放效果 ✓

---

## 十、修改步骤清单

### Phase 1: 数据结构和导入导出修复
- [ ] 统一 painPointDetails 为数组类型（更新文档理解）
- [ ] importData 添加 migrateData 调用
- [ ] 检查 loadData 中所有字段兜底

### Phase 2: 演示路径关键按钮修复
- [ ] 移除 btn-load-demo 事件中的重复 confirm
- [ ] btn-generate-plan 添加空值保护
- [ ] 检查一键开始练习按钮绑定稳定性

### Phase 3: 练习状态管理加固
- [ ] 检查 resetTimer 是否调用 stopPracticeRuntime
- [ ] toggleTimer/toggleMetronome 防重复启动
- [ ] 确保所有退出练习场景都停止运行状态

### Phase 4: AI 反馈和计划生成修复
- [ ] 统一 generateAIFeedback 返回结构
- [ ] renderAIFeedbackPage 使用正确字段
- [ ] generateEfficientPracticePlan 无数据兜底

### Phase 5: Cover 页面和周复盘修复
- [ ] 周复盘 Date 对象防修改
- [ ] 周复盘 AI 建议来源逻辑
- [ ] Cover 进度区域空状态

### Phase 6: 我的页面和二级页面
- [ ] 确认 renderProfilePage 是否需要补充内容
- [ ] 检查日历/知识库返回按钮
- [ ] 检查所有二级页面的返回逻辑

### Phase 7: 控制台错误清理
- [ ] 检查 B站 API 失败处理
- [ ] 检查 iframe 空 src 处理
- [ ] 全局检查 null 访问

### Phase 8: 最终验证
- [ ] Node.js 语法检查
- [ ] 手动走一遍演示路径
- [ ] 导出数据字段完整性检查

---

## 十一、预期修改文件
- 仅修改：`index.html`

---

## 十二、风险和注意事项

1. **数据兼容性**：所有修改必须兼容旧 localStorage 数据，migrateData 是唯一入口
2. **单文件限制**：保持单文件 HTML，不拆分
3. **断网可用**：核心演示路径不依赖网络，B站视频加载失败不影响主流程
4. **不删除功能**：保留所有现有页面和功能
5. **视觉风格**：不改变梦幻玻璃拟态风格
