# 代码一致性检查与修复计划

## 发现的一致性问题

### 问题 1：未使用的导入（PracticePage.tsx）
- **文件**：`src/pages/PracticePage.tsx` L2
- **问题**：导入了 `Target`、`Music` 图标，但在组件中未使用（之前BPM区域有单独的 `<Music>` 和 `<Target>` 图标，重构后已移除）
- **修复**：从导入列表中删除 `Target` 和 `Music`

### 问题 2：未使用的导入（VideoStudyPage.tsx）
- **文件**：`src/pages/VideoStudyPage.tsx` L2
- **问题**：导入了 `BookOpen`、`Music` 图标，`BookOpen` 仅在空状态显示时使用（L99），`Music` 未使用
- **修复**：从导入列表中删除 `Music`

### 问题 3：BpmKnob onChangeEnd 创建了无意义的 AudioContext（PracticePage.tsx）
- **文件**：`src/pages/PracticePage.tsx` L451-458
- **问题**：`onChangeEnd` 回调中创建了一个新的 AudioContext 实例但什么也没做，仅检查状态并 resume。这段代码没有实际意义，因为 usePractice hook 内部已经管理了自己的 audioContextRef
- **修复**：移除 PracticePage 中 BpmKnob 的 `onChangeEnd` 属性

### 问题 4：onKeyPress 已废弃（VideoPlayerCard.tsx）
- **文件**：`src/components/VideoPlayerCard.tsx` L144, L166
- **问题**：使用已废弃的 `onKeyPress` 事件，React 建议使用 `onKeyDown` 替代
- **修复**：将 `onKeyPress` 替换为 `onKeyDown`，同时修改 handleKeyPress 函数名为 handleKeyDown，`e.key` 检查不变

### 问题 5：VideoResource 类型中 keyPoints 字段未被使用
- **文件**：`src/types/index.ts` L142
- **问题**：`VideoResource` 接口定义了 `keyPoints: string[]`，但整个代码库中没有任何地方使用 `video.keyPoints`
- **修复**：从 `VideoResource` 接口中删除 `keyPoints` 字段（如果确认未使用的话）。但如果考虑将来可能使用，也可以保留。此处选择删除，因为项目已有 `skills` 和 `summary` 字段提供类似信息

### 问题 6：PracticePage 中 BpmKnob 传入了冗余的 min/max
- **文件**：`src/pages/PracticePage.tsx` L459-460
- **问题**：BpmKnob 组件默认 min=40, max=200，传入的 min={40} max={200} 与默认值相同，属于冗余代码
- **修复**：移除冗余的 min/max 属性（可选，风险极低，仅代码整洁性）

## 修改步骤

1. **修复 PracticePage.tsx**：
   - 删除未使用的 `Target`、`Music` 导入
   - 移除 BpmKnob 的 `onChangeEnd` 和冗余的 `min`/`max` 属性

2. **修复 VideoStudyPage.tsx**：
   - 删除未使用的 `Music` 导入

3. **修复 VideoPlayerCard.tsx**：
   - 将 `onKeyPress` 替换为 `onKeyDown`

4. **修复 types/index.ts**：
   - 从 `VideoResource` 接口中删除未使用的 `keyPoints` 字段

5. **构建验证**

## 风险评估

- 所有修改均为代码清理，不影响功能
- `keyPoints` 删除需确认 defaultData.ts 中是否引用（搜索结果显示只有类型定义和 defaultData 中声明，但未在页面中使用）
- `onKeyDown` 替换 `onKeyPress` 行为一致，风险极低
