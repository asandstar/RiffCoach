# 练习工具重构计划

## 问题分析

### 1. 计时器功能混淆
- **现状（第208-210行 `setTimePoint`）**: 点击时间按钮直接设置 `timeElapsed` 为对应分钟数，相当于跳转到那个时间点继续正计时
- **问题**: 用户期望是倒计时，但实际是正计时跳转到某个起始点
- **需求**: 
  - 时间按钮 → 设置倒计时目标（如选30分钟就是倒计时30分钟）
  - 开始按钮 → 启动正计时（累计练习时间）
  - 两种模式需要清晰区分

### 2. 节拍器功能增强
- **现状（第117行）**: 重音判断是 `beatCounterRef.current % 4 === 0`，固定4/4拍
- **现状**: 只有音频重音，没有视觉拍数显示
- **需求**:
  - 显示拍数（1 2 3 4），第一拍高亮显示
  - 支持拍号调整（2/4、3/4、4/4、6/8拍）

### 3. 三个卡片分散
- **现状**: 
  - 卡片1（第334-427行）: 计时器 + 控制按钮 + 时间预设 + 节拍器开关
  - 卡片2（第429-445行）: BPM调节
  - 卡片3（第447-464行）: 重复次数
- **需求**: 整合成一个练习工具卡片

## 重构方案

### 核心设计：统一练习工具卡片

#### 桌面端布局（横向两栏）
左侧：环形进度条 + 时间显示
右侧：模式切换 + 控制按钮 + 时间预设 + 节拍器 + BPM + 重复次数

#### 移动端布局（纵向堆叠）
顶部：环形进度条 + 时间显示
中部：模式切换 + 控制按钮 + 时间预设
下部：节拍器拍数 + BPM + 拍号选择
底部：重复次数

---

### 具体修改（基于 PracticePage.tsx）

#### 1. 新增状态和类型（第27-44行附近）

**新增类型**:
```typescript
type TimerMode = 'count-up' | 'count-down';
type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';
```

**新增状态**:
```typescript
const [timerMode, setTimerMode] = useState<TimerMode>('count-up');
const [targetTime, setTargetTime] = useState(30 * 60); // 倒计时目标，默认30分钟
const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
const [currentBeat, setCurrentBeat] = useState(0);
```

**新增配置**:
```typescript
const timeSignatureConfigs: Record<TimeSignature, { beats: number; downbeats: number[]; label: string }> = {
  '2/4': { beats: 2, downbeats: [0], label: '2/4' },
  '3/4': { beats: 3, downbeats: [0], label: '3/4' },
  '4/4': { beats: 4, downbeats: [0], label: '4/4' },
  '6/8': { beats: 6, downbeats: [0, 3], label: '6/8' },
};
```

**新增 ref**:
```typescript
const timeSignatureRef = useRef(timeSignature);
```

**同步 timeSignatureRef**（第70-72行附近添加）:
```typescript
useEffect(() => {
  timeSignatureRef.current = timeSignature;
}, [timeSignature]);
```

#### 2. 修改计时器逻辑

**修改时间显示（第361行）**:
- 正计时：`formatTime(timeElapsed)` + 副标题"累计练习"
- 倒计时：`formatTime(Math.max(0, targetTime - timeElapsed)) / formatTime(targetTime)` + 副标题"倒计时"

**修改环形进度条（第353-358行）**:
- 正计时：`Math.min(timeElapsed, 3600) / 3600`（以1小时为基准）
- 倒计时：`Math.min(timeElapsed, targetTime) / targetTime`

**修改 `setTimePoint` 函数（第208-210行）**:
```typescript
const setTimePoint = (minutes: number) => {
  setTimerMode('count-down');
  setTargetTime(minutes * 60);
  if (isRunning) {
    setTimeElapsed(0);
  }
};
```

**新增模式切换函数**:
```typescript
const switchTimerMode = (mode: TimerMode) => {
  setTimerMode(mode);
  setTimeElapsed(0);
};
```

**修改计时器 effect（第75-93行）**:
- 倒计时模式下，当 timeElapsed >= targetTime 时，自动停止计时，播放提示
- 可用 useEffect 监听 timeElapsed 实现

#### 3. 修改节拍器音频逻辑

**修改重音判断（第117行）**:
```typescript
// 原代码: const isDownbeat = beatCounterRef.current % 4 === 0;
// 新代码:
const config = timeSignatureConfigs[timeSignatureRef.current];
const beatIndex = beatCounterRef.current % config.beats;
const isDownbeat = config.downbeats.includes(beatIndex);
const isSubDownbeat = beatIndex === 3 && timeSignatureRef.current === '6/8'; // 6/8第4拍次重音
```

**修改频率和音量（第118-119行）**:
```typescript
let volume = 0.3;
let frequency = 800;
if (isDownbeat) {
  volume = 0.4;
  frequency = 1200;
} else if (isSubDownbeat) {
  volume = 0.35;
  frequency = 1000;
}
```

**修改 currentBeat 更新（第133行附近）**:
```typescript
setCurrentBeat(beatIndex);
```

**拍号变化时重置计数器**:
- 在拍号切换函数中重置 beatCounterRef.current = 0

#### 4. UI整合（三个卡片合并）

**删除原有三个独立卡片**（第334-464行），替换为一个卡片：

```
<GlassCard elevated className="p-6">
  {/* 标题 + 重置按钮 */}
  
  <div className="flex flex-col md:flex-row gap-6">
    {/* 左侧：环形进度条 + 时间显示 */}
    <div className="flex flex-col items-center justify-center md:w-1/3">
      {/* 环形进度条 */}
      {/* 时间显示 */}
      {/* 模式标签 */}
    </div>
    
    {/* 右侧：控制区 */}
    <div className="flex-1 space-y-4">
      {/* 模式切换：正计时 / 倒计时 */}
      
      {/* 控制按钮：后退、播放/暂停、前进、节拍器 */}
      
      {/* 时间预设按钮 */}
      
      <hr className="border-border-subtle" />
      
      {/* 节拍器拍数显示 + 拍号选择 */}
      
      {/* BPM 旋钮 */}
      
      <hr className="border-border-subtle" />
      
      {/* 重复次数 */}
    </div>
  </div>
</GlassCard>
```

#### 5. 拍数视觉指示器组件

新增内联组件或直接在 JSX 中实现：
```typescript
const BeatIndicator = () => {
  const config = timeSignatureConfigs[timeSignature];
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: config.beats }).map((_, i) => {
        const isDownbeat = config.downbeats.includes(i);
        const isActive = isMetronomeOn && currentBeat === i;
        return (
          <div
            key={i}
            className={`rounded-full transition-all duration-100 ${
              isDownbeat ? 'w-4 h-4' : 'w-3 h-3'
            } ${
              isActive
                ? isDownbeat
                  ? 'bg-primary shadow-lg shadow-primary/50 scale-125'
                  : 'bg-primary/80 scale-110'
                : isDownbeat
                ? 'bg-primary/30'
                : 'bg-text-tertiary/30'
            }`}
          />
        );
      })}
    </div>
  );
};
```

---

### 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `src/pages/PracticePage.tsx` | 全部重构：新增状态、修改计时器逻辑、增强节拍器、整合UI |

### 不修改的文件
- `src/components/BpmKnob.tsx` - 保持原样，继续使用
- `src/components/GlassCard.tsx` - 保持原样
- `src/utils/date.ts` - formatTime 已够用

---

### 执行步骤

1. **状态和类型准备**（5分钟）
   - 添加 TimerMode、TimeSignature 类型
   - 添加 timerMode、targetTime、timeSignature、currentBeat 状态
   - 添加拍号配置和 ref

2. **计时器双模式逻辑**（20分钟）
   - 修改时间显示和进度条
   - 修改 setTimePoint 函数
   - 添加模式切换
   - 倒计时结束提醒

3. **节拍器增强**（20分钟）
   - 修改音频重音逻辑
   - 添加拍数视觉指示器
   - 添加拍号选择器
   - 测试各拍号

4. **UI整合布局**（25分钟）
   - 三卡合一
   - 桌面端两栏布局
   - 移动端堆叠布局
   - 调整间距和视觉层次

5. **测试验证**（10分钟）
   - 构建验证
   - 功能测试
   - 布局测试

---

## 验收标准

- [ ] **正计时模式**：点开始从0开始计时，进度条随时间增长（1小时满）
- [ ] **倒计时模式**：点时间预设按钮自动切换倒计时并设置目标，开始后倒计时
- [ ] **模式切换**：正计时/倒计时可自由切换，时间归零
- [ ] **节拍器拍数显示**：圆点指示器，重音拍更大更亮，当前拍有放大动画
- [ ] **拍号切换**：支持2/4、3/4、4/4、6/8四种拍号，音频重音位置正确
- [ ] **卡片整合**：计时器、BPM、重复次数整合到一个卡片内
- [ ] **响应式**：桌面端两栏布局（md断点以上），移动端纵向堆叠
- [ ] **构建通过**：`npm run build` 无错误
- [ ] **完成练习**：保存数据正常，AI反馈正常
