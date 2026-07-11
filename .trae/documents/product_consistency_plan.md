# 产品级一致性检查与修复计划

## 概述
从"产品推向市场、获取付费用户"的角度，对项目进行全面一致性检查和修复。重点关注：资源泄漏、数据一致性、用户体验闭环、代码整洁度、品牌专业度。

---

## 一、严重问题 - 影响用户核心体验

### P1. usePractice 组件卸载时资源未清理
- **文件**：`src/hooks/usePractice.ts`
- **问题**：当组件（PracticePage/VideoStudyPage）卸载时，以下资源不会被清理：
  - `timerRef`（setInterval）- 计时器在后台继续运行
  - `metronomeRef`（setTimeout 递归）- 节拍器在后台继续播放
  - `audioContextRef`（AudioContext）- 音频上下文保持打开
- **影响**：用户离开练习页面后，计时器/节拍器仍在后台运行，浪费资源且可能在其他页面发出声音
- **修复**：添加一个 `cleanup` 方法并在 usePractice 的返回对象中导出，在 PracticePage/VideoStudyPage 的 useEffect cleanup 中调用它

### P2. AudioContext 从不关闭
- **文件**：`src/hooks/usePractice.ts` L36
- **问题**：`audioContextRef` 一旦创建就永远不会调用 `audioContext.close()`。浏览器通常限制 AudioContext 实例数（Chrome 限制6个），长时间使用可能耗尽
- **修复**：在 `cleanup` 方法中关闭 AudioContext

### P3. PracticePage BpmKnob onChangeEnd 创建无用 AudioContext
- **文件**：`src/pages/PracticePage.tsx` L451-458
- **问题**：`onChangeEnd` 回调中 `new (window.AudioContext...)()` 每次拖动结束都会创建新的 AudioContext 实例但不使用。这些实例不会被关闭，直到触发浏览器上限
- **修复**：完全移除 `onChangeEnd` 属性（usePractice 内部已有自己的 AudioContext 管理）

---

## 二、中等问题 - 影响代码质量和可维护性

### P4. 未使用的图标导入（PracticePage）
- **文件**：`src/pages/PracticePage.tsx` L2
- **问题**：导入了 `Target`、`Music` 但 JSX 中未使用
- **修复**：从导入列表删除 `Target`, `Music`

### P5. 未使用的图标导入（VideoStudyPage）
- **文件**：`src/pages/VideoStudyPage.tsx` L2
- **问题**：导入了 `Music` 但 JSX 中未使用
- **修复**：从导入列表删除 `Music`

### P6. onKeyPress 已废弃
- **文件**：`src/components/VideoPlayerCard.tsx` L67-68, L144, L166
- **问题**：`onKeyPress` 是已废弃的 DOM 事件，React 官方推荐使用 `onKeyDown`。某些浏览器可能不再触发 `onKeyPress`
- **修复**：替换 `onKeyPress` 为 `onKeyDown`，重命名 `handleKeyPress` 为 `handleKeyDown`

### P7. VideoResource.keyPoints 有数据但未在UI展示
- **文件**：`src/types/index.ts` L142, `src/data/defaultData.ts` 13处, `src/pages/VideoStudyPage.tsx`
- **问题**：`keyPoints` 字段在所有12个视频资源中都有数据，类型定义也有，但"视频关键信息"区域没有展示。这导致数据准备了但用户看不到
- **修复**：在 VideoStudyPage 的"视频关键信息"卡片中，在"关键技能"区块下方添加"关键要点"区块，展示 `video.keyPoints`

### P8. localStorage 直接使用与 Zustand persist 重复
- **文件**：`src/pages/KnowledgePage.tsx` L69-76, `src/hooks/usePractice.ts` L29, L55
- **问题**：KnowledgePage 中用 localStorage 直接存储侧边栏折叠状态，usePractice 中用 localStorage 直接存储模板，与 Zustand 的 persist 中间件模式不一致。如果 localStorage 不可用（如隐私模式），会抛出异常
- **修复**：
  1. 在 localStorage 操作处添加 try-catch
  2. 将 KnowledgePage 的侧边栏状态移入 Zustand store

### P9. 倒计时结束缺少提醒
- **文件**：`src/hooks/usePractice.ts` L103-107
- **问题**：倒计时到0时只是自动停止计时器，没有任何视觉或音频提醒。用户设置了倒计时目标，到时间应该有通知
- **修复**：倒计时结束时播放一个提示音，并可以显示一个简单的 toast 提示

---

## 三、轻微问题 - 影响产品专业度

### P10. 缺少无障碍属性
- **文件**：所有页面组件
- **问题**：整个应用没有任何 `aria-label` 或 `role` 属性。对于面向付费用户的产品，这是基本要求
- **修复**：为关键交互按钮添加 `aria-label`：
  - 播放/暂停按钮：`aria-label="播放"` / `aria-label="暂停"`
  - 节拍器开关：`aria-label="节拍器开关"`
  - 重置按钮：`aria-label="重置"`
  - 前进/后退按钮：`aria-label="前进5秒"` / `aria-label="后退5秒"`

### P11. favicon 使用默认 Vite 图标
- **文件**：`index.html` L5
- **问题**：`<link rel="icon" type="image/svg+xml" href="/vite.svg" />` 使用 Vite 默认图标，付费产品应该使用自己的品牌图标
- **修复**：创建一个简单的 RiffCoach 品牌 SVG favicon（吉他音符风格），替换引用

### P12. 根目录有冗余文件
- **文件**：根目录下 `colors_and_type.css`、`generation-tree.json`、`orchestration-summary.json`、`riffcoach-check.sh`、`riffcoach-health-report.md`、`string-practice-compass.design`、`technical-docs.md`、`DEV_HANDOFF.md`
- **问题**：这些是开发过程中生成的临时/参考文件，不应出现在产品代码库中，增加仓库体积且容易误导
- **修复**：删除这些文件

### P13. 产品副标题不一致
- **文件**：`index.html` L7 "弦乐练习指南针", `README.md` L1 "AI 高效练习教练", `src/components/OnboardingModal.tsx` "RiffCoach"
- **问题**：不同位置使用不同的产品描述语
- **修复**：统一为 "RiffCoach · AI 高效练习教练"

---

## 修改步骤

### Step 1: 修复 usePractice 资源泄漏（P1, P2）
```typescript
// 在 usePractice.ts 中添加 cleanup 方法
const cleanup = useCallback(() => {
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
  if (metronomeRef.current) {
    clearTimeout(metronomeRef.current);
    metronomeRef.current = null;
  }
  if (audioContextRef.current) {
    audioContextRef.current.close().catch(() => {});
    audioContextRef.current = null;
  }
  setIsRunning(false);
  setIsMetronomeOn(false);
  beatCounterRef.current = 0;
  setCurrentBeat(0);
}, []);

// 在返回对象中添加 cleanup
return { ..., cleanup };
```

在 PracticePage 和 VideoStudyPage 中：
```typescript
useEffect(() => {
  return () => {
    practice.cleanup();
  };
}, [practice]);
```

### Step 2: 修复 PracticePage BpmKnob 和导入（P3, P4）
- 移除 BpmKnob 的 onChangeEnd 属性和 min/max 属性
- 删除 Target, Music 导入

### Step 3: 修复 VideoStudyPage 导入（P5）
- 删除 Music 导入

### Step 4: 修复 VideoPlayerCard onKeyPress（P6）
- 替换 onKeyPress 为 onKeyDown

### Step 5: 展示 keyPoints（P7）
- 在 VideoStudyPage 的视频关键信息中添加关键要点展示

### Step 6: localStorage 安全性和倒计时提醒（P8, P9）
- 添加 try-catch 保护
- 倒计时结束时播放提示音

### Step 7: 添加 aria-label（P10）
- 为关键交互按钮添加无障碍标签

### Step 8: 创建品牌 favicon（P11）
- 创建 SVG favicon 并更新 index.html

### Step 9: 清理冗余文件和统一副标题（P12, P13）
- 删除根目录冗余文件
- 统一产品描述语

### Step 10: 构建验证和提交
