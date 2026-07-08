# 修复播放按钮和BPM声音功能计划

## 问题诊断

### 1. BPM声音功能无法使用（根本原因）

**问题1.1：声音持续时间太短（根本问题）**
- 当前代码：`oscillator.stop(ctx.currentTime + 0.05)`，声音只有 **0.05秒**
- 人类听觉感知声音需要至少 **0.1-0.2秒**，0.05秒几乎无法听到
- 音量衰减：`gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)` 在0.05秒内从0.1衰减到0.001

**问题1.2：音量太小**
- 当前音量：`isDownbeat ? 0.15 : 0.1`
- 在移动设备上几乎听不到，建议增大到 **0.3-0.5**

**问题1.3：拖动BPM旋钮时节拍器频繁重启**
- 当拖动BPM旋钮时，`onChange` 被频繁调用
- 每次BPM变化都会触发第二个 `useEffect`：
  ```typescript
  useEffect(() => {
    if (isMetronomeOn) {
      stopMetronome();
      setIsMetronomeOn(true);
    }
  }, [bpm, stopMetronome]);
  ```
- 这导致节拍器不断停止和重新开始，声音断断续续

**问题1.4：AudioContext生命周期和自动播放策略**
- `AudioContext` 没有正确管理状态
- 浏览器自动播放策略可能阻止声音播放
- 缺少AudioContext状态检查和错误处理

### 2. 播放按钮（计时器）问题

**问题2.1：`stopTimer` 被调用两次**
- `useEffect` 的清理函数和主体都会调用 `stopTimer`
- 虽然不会导致错误，但逻辑冗余且可能引发竞态条件

**问题2.2：`stopTimer` 内部调用 `setIsRunning(false)`**
- 当用户点击暂停时，`toggleTimer` 已经设置 `isRunning = false`
- 然后 `useEffect` 运行又调用 `stopTimer()`，其中再次调用 `setIsRunning(false)`
- 状态更新混乱，可能导致闪烁

---

## 修复方案

### 修改文件 1：`src/pages/PracticePage.tsx`

#### 修复1：优化BPM声音参数
- 延长声音持续时间：0.05秒 → **0.15秒**
- 增大音量：0.1/0.15 → **0.3/0.4**
- 添加音量attack阶段（0.01秒内从0淡入到目标音量）
- 修改 `playClick` 函数中的 `oscillator.stop()` 和 `gainNode.gain` 参数

#### 修复2：添加节拍器防抖重启机制
- 引入 `useRef` 存储上一个BPM值
- 引入 `debounce` 机制，只有当BPM停止变化 **300ms** 后才重启节拍器
- 避免拖动BPM旋钮时的频繁重启

#### 修复3：优化AudioContext管理
- 在 `toggleMetronome` 中添加更完善的错误处理
- 添加 `AudioContext` 状态检查和自动恢复
- 确保在用户交互（点击）后才尝试播放声音
- 添加 `try-catch` 包裹声音播放逻辑

#### 修复4：修复计时器逻辑
- 移除 `stopTimer` 内部的 `setIsRunning(false)` 调用
- `stopTimer` 只负责清理 `setInterval`，不修改状态
- `toggleTimer` 统一控制 `isRunning` 状态

### 修改文件 2：`src/components/BpmKnob.tsx`

#### 修复5：优化BPM变化通知
- 添加 `onChangeEnd` 回调，只在拖动结束时通知父组件
- 拖动过程中只更新本地显示值
- 避免拖动过程中频繁触发父组件的状态更新和节拍器重启

---

## 具体代码修改

### PracticePage.tsx 修改

1. **添加防抖相关的 ref**：
   ```typescript
   const bpmDebounceRef = useRef<number | null>(null);
   const lastBpmRef = useRef(bpm);
   ```

2. **修改 `playClick` 函数**：
   - 延长声音到 0.15 秒
   - 增大音量到 0.3/0.4
   - 添加 attack 淡入
   - 添加 try-catch

3. **修改BPM变化的 useEffect**：
   - 使用防抖，300ms 后才重启节拍器
   - 避免拖动过程中的频繁重启

4. **修改 `stopTimer` 函数**：
   - 移除 `setIsRunning(false)` 调用

### BpmKnob.tsx 修改

1. **添加 `onChangeEnd` prop**：
   ```typescript
   interface BpmKnobProps {
     value: number;
     onChange: (value: number) => void;
     onChangeEnd?: (value: number) => void;  // 新增
     min?: number;
     max?: number;
   }
   ```

2. **修改拖动结束逻辑**：
   - `handleEnd` 中调用 `onChangeEnd?.(value)`

---

## 验证步骤

1. 构建项目，确认无TypeScript错误
2. 打开练习页面，点击节拍器按钮，确认能听到清晰的节拍声
3. 拖动BPM旋钮，确认节拍器不会频繁重启，声音连续稳定
4. 点击播放/暂停按钮，确认计时器正常启停
5. 切换不同BPM值，确认节拍器正确调整速度
6. 在移动设备上测试，确认声音清晰可听

## 风险评估

- **低风险**：修改主要是参数调整和逻辑优化，不涉及数据结构变更
- **注意点**：AudioContext的自动播放策略在不同浏览器可能有差异，需要充分测试
