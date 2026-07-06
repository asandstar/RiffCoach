# 练习工具增强（节拍器声音 + 重置优化 + 素材库删改）

## 概述

针对用户反馈的练习工具问题进行增强：节拍器无声音、重置计时有冗余弹窗、素材库缺少删改功能。练习记录的时间戳已确认实现，无需改动。

## 当前状态分析

基于对 `index.html`（3881行）的探索：

### 1. 节拍器 — 完全无音频
- UI：第1269-1280行，只有"当前BPM"文字 + 减号按钮 + 数字显示 + 加号按钮
- `updateBPMDisplay()`（第2530-2532行）：仅更新文本
- 事件绑定（第3286-3293行）：`bpm-minus`/`bpm-plus` 仅调整数字，无声音
- **缺失**：无AudioContext、无oscillator、无start/stop按钮、无`playBeep`函数

### 2. 重置计时 — 有confirm弹窗
- 按钮：第1264行 `btn-reset`（rotate-ccw图标）
- 事件绑定（第3282-3284行）：
  ```js
  document.getElementById('btn-reset').addEventListener('click', () => {
      if (confirm('确定要重置计时器吗？')) resetTimer();
  });
  ```
- `resetTimer()`（第2516-2528行）：清零timerSeconds、停interval、重置按钮图标

### 3. 练习记录 — 已含时间戳（无需改动）
- `completePractice()`（第2592-2623行）创建session对象：
  ```js
  const session = {
      id: uid('sess'),
      lessonId: practiceLessonId,
      instrument: lesson.instrument,
      date: Date.now(),           // ← 已有完整时间戳
      durationSeconds: timerSeconds,
      bpm: currentBPM,
      repetitions: currentReps,
      selfRating: currentRating,
      painPoints: [...selectedPainPoints],
      notes: ...
  };
  ```
- 保存到 `state.sessions` → `localStorage`（通过`saveData()`）
- **结论**：已实现，向用户说明即可

### 4. 素材库 — 仅Create+Read，无Delete+Edit
- Create：添加课程表单（第3116-3157行）、从知识库添加（第3659-3695行）
- Read：`renderSourceLibrary()`（第2329-2360行）渲染source卡片+lesson行
- **缺失**：无`deleteSource`/`deleteLesson`/`editLesson`函数，UI无删除/编辑按钮

## 实施方案

### 改动1：节拍器声音实现（Web Audio API）

**目标**：用AudioContext+Oscillator生成电子beep，添加启动/停止按钮

**文件**：`index.html`

#### 1.1 添加全局变量（在timer相关变量附近，约第2400行前）
```javascript
let metronomeRunning = false;
let metronomeInterval = null;
let audioContext = null;
```

#### 1.2 修改节拍器UI（第1269-1280行）
在BPM加减按钮下方添加启动/停止按钮：
```html
<section style="display: flex; flex-direction: column; align-items: center; padding-bottom: 32px;">
    <p ...>当前 BPM</p>
    <div style="display: flex; align-items: center; gap: 16px;">
        <button class="btn-ghost" id="bpm-minus" ...>...</button>
        <span class="gradient-text" ... id="bpm-display">80</span>
        <button class="btn-ghost" id="bpm-plus" ...>...</button>
    </div>
    <button class="btn-primary" id="btn-metronome" style="margin-top: 12px; padding: 8px 20px; font-size: var(--text-sm);">
        <i data-lucide="play" style="width: 16px; height: 16px; margin-right: 4px;"></i>
        <span>启动节拍器</span>
    </button>
</section>
```

#### 1.3 添加节拍器函数（在`updateBPMDisplay`附近，约第2530行后）
```javascript
function playBeep() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 1000;  // 1000Hz 电子beep
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.05);
}

function toggleMetronome() {
    if (metronomeRunning) {
        stopMetronome();
    } else {
        startMetronome();
    }
}

function startMetronome() {
    metronomeRunning = true;
    const intervalMs = 60000 / currentBPM;
    playBeep();  // 立即播放第一拍
    metronomeInterval = setInterval(playBeep, intervalMs);
    updateMetronomeButton();
}

function stopMetronome() {
    metronomeRunning = false;
    if (metronomeInterval) {
        clearInterval(metronomeInterval);
        metronomeInterval = null;
    }
    updateMetronomeButton();
}

function updateMetronomeButton() {
    const btn = document.getElementById('btn-metronome');
    if (!btn) return;
    if (metronomeRunning) {
        btn.innerHTML = `<i data-lucide="pause" style="width: 16px; height: 16px; margin-right: 4px;"></i><span>停止节拍器</span>`;
    } else {
        btn.innerHTML = `<i data-lucide="play" style="width: 16px; height: 16px; margin-right: 4px;"></i><span>启动节拍器</span>`;
    }
    if (window.lucide) lucide.createIcons();
}
```

#### 1.4 修改BPM调整事件（第3286-3293行）
BPM变化时若节拍器正在运行，需更新interval：
```javascript
document.getElementById('bpm-minus').addEventListener('click', () => {
    currentBPM = Math.max(40, currentBPM - 5);
    updateBPMDisplay();
    if (metronomeRunning) { stopMetronome(); startMetronome(); }  // 重启以应用新BPM
});
document.getElementById('bpm-plus').addEventListener('click', () => {
    currentBPM = Math.min(240, currentBPM + 5);
    updateBPMDisplay();
    if (metronomeRunning) { stopMetronome(); startMetronome(); }
});
```

#### 1.5 添加节拍器按钮事件绑定
```javascript
document.getElementById('btn-metronome').addEventListener('click', toggleMetronome);
```

#### 1.6 离开练习页面时停止节拍器
在 `navigateTo` 函数中（或 `completePractice` 中）添加：
```javascript
if (metronomeRunning) stopMetronome();
```
**位置**：在`navigateTo`函数开头（约第1994行），当从practice页面离开时停止。

#### 1.7 window挂载
```javascript
window.toggleMetronome = toggleMetronome;
```

---

### 改动2：移除重置计时的confirm弹窗

**目标**：点击重置按钮直接重置，不弹确认框

**文件**：`index.html`，第3282-3284行

#### 修改事件绑定
```javascript
// 修改前
document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('确定要重置计时器吗？')) resetTimer();
});

// 修改后
document.getElementById('btn-reset').addEventListener('click', () => {
    resetTimer();
});
```

---

### 改动3：素材库删除功能

**目标**：支持删除整个来源卡片和删除单个课程

**文件**：`index.html`

#### 3.1 修改`renderSourceLibrary`（第2329-2360行）
在source卡片标题栏添加删除按钮，在lesson行添加删除按钮：

source卡片标题栏（约第2334-2341行）添加删除按钮：
```html
<button class="source-header" data-source-id="${src.id}" ...>
    <div ...>
        <span class="pill-tag" ...>${getSourceTypeName(src.type)}</span>
        <span ...>${src.name}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
        <span class="pill-tag" ...>${src.lessons.length} 个课程</span>
        <button class="btn-icon-danger" onclick="event.stopPropagation(); deleteSource('${src.id}')" aria-label="删除来源" style="...">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
        <svg class="chevron ..." ...></svg>
    </div>
</button>
```

lesson行（约第2344行）添加删除和编辑按钮：
```html
<div class="lesson-row" onclick="startPractice('${les.id}')" style="...">
    <div ...>
        <span ...>${les.title}</span>
        ...
    </div>
    <div style="display: flex; gap: 4px;" onclick="event.stopPropagation()">
        <button class="btn-icon" onclick="editLesson('${les.id}')" aria-label="编辑" style="...">
            <i data-lucide="pencil" style="width: 14px; height: 14px;"></i>
        </button>
        <button class="btn-icon-danger" onclick="deleteLesson('${les.id}')" aria-label="删除" style="...">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
    </div>
</div>
```

#### 3.2 添加CSS样式（在 `.no-scrollbar` 附近）
```css
.btn-icon { background: transparent; border: none; cursor: pointer; padding: 4px; border-radius: var(--radius-sm); color: var(--text-tertiary); display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); }
.btn-icon:hover { background: var(--bg-surface); color: var(--text-secondary); }
.btn-icon-danger { background: transparent; border: none; cursor: pointer; padding: 4px; border-radius: var(--radius-sm); color: var(--text-tertiary); display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); }
.btn-icon-danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
```

#### 3.3 添加`deleteSource`函数
```javascript
function deleteSource(sourceId) {
    const source = getSourceById(sourceId);
    if (!source) return;
    if (confirm(`确定要删除来源"${source.name}"及其所有课程吗？`)) {
        state.sources = state.sources.filter(s => s.id !== sourceId);
        saveData();
        renderSourceLibrary();
    }
}
```

#### 3.4 添加`deleteLesson`函数
```javascript
function deleteLesson(lessonId) {
    const lesson = getLessonById(lessonId);
    if (!lesson) return;
    if (confirm(`确定要删除课程"${lesson.title}"吗？`)) {
        const source = getSourceById(lesson.sourceId);
        if (source) {
            source.lessons = source.lessons.filter(l => l.id !== lessonId);
            // 如果来源没有课程了，一并删除
            if (source.lessons.length === 0) {
                state.sources = state.sources.filter(s => s.id !== source.id);
            }
            saveData();
            renderSourceLibrary();
        }
    }
}
```

---

### 改动4：素材库编辑课程功能

**目标**：支持编辑课程的标题、目标BPM、目标时长

**文件**：`index.html`

#### 4.1 添加`editLesson`函数
复用现有的添加课程表单（`add-lesson-sheet`），但填充已有数据并改为编辑模式：

```javascript
let editingLessonId = null;

function editLesson(lessonId) {
    const lesson = getLessonById(lessonId);
    if (!lesson) return;
    editingLessonId = lessonId;
    
    // 填充表单
    document.getElementById('form-title').value = lesson.title;
    document.getElementById('form-bpm').value = lesson.targetBPM || 80;
    document.getElementById('form-duration').value = (lesson.targetDuration || 600) / 60;
    
    // 显示表单（复用现有sheet）
    document.getElementById('sheet-overlay').classList.add('visible');
    document.getElementById('add-lesson-sheet').classList.add('visible');
    // 修改标题为"编辑课程"
    // ...（具体实现取决于现有表单结构）
}
```

**注意**：编辑功能的实现需要更深入了解添加课程表单的结构。在实施阶段需要读取第3116-3157行附近的表单HTML和JS逻辑，将"添加"模式扩展为"添加/编辑"双模式。

**简化方案**：如果表单复用复杂，可以只支持编辑标题和BPM，用一个简单的prompt或小型编辑sheet。但推荐复用现有表单以保持UI一致性。

#### 4.2 修改添加课程表单提交逻辑
在表单提交时检查`editingLessonId`：
- 若为null：执行现有添加逻辑
- 若不为null：执行更新逻辑（修改lesson的title、targetBPM、targetDuration），然后清空`editingLessonId`

#### 4.3 关闭表单时清空editingLessonId
在表单取消/关闭时重置`editingLessonId = null`

#### 4.4 window挂载
```javascript
window.deleteSource = deleteSource;
window.deleteLesson = deleteLesson;
window.editLesson = editLesson;
```

---

## 假设与决策

1. **节拍器音色**：1000Hz正弦波，50ms短促beep（经典电子节拍器声音）
2. **节拍器音量**：0.3增益（适中，不刺耳）
3. **BPM调整时重启节拍器**：用户调整BPM时若节拍器在运行，先停再启以应用新间隔
4. **离开练习页自动停止节拍器**：避免在其他页面继续响
5. **删除来源用confirm**：删除是不可逆操作，保留确认弹窗（用户只要求重置计时去掉confirm）
6. **删除空来源**：删除课程后若来源无课程，自动删除空来源
7. **编辑课程复用现有表单**：保持UI一致性，避免新增编辑弹窗
8. **练习记录已含时间戳**：`date: Date.now()`已实现，无需改动，向用户说明即可

## 验证步骤

1. **语法检查**：`node -c` 提取的JS代码无语法错误
2. **节拍器**：
   - 点击"启动节拍器"按钮 → 听到beep声，按钮变为"停止节拍器"
   - BPM=80时每750ms响一次，BPM=120时每500ms响一次
   - 调整BPM时节拍器间隔立即变化
   - 点击"停止节拍器" → 声音停止
   - 离开练习页面 → 节拍器自动停止
3. **重置计时**：
   - 点击重置按钮 → 直接重置，无confirm弹窗
   - 计时器归零，暂停状态
4. **练习记录**（已有功能确认）：
   - 完成练习后查看localStorage → session含`date: Date.now()`时间戳
5. **素材库删除**：
   - source卡片右上角有删除按钮 → 点击弹confirm → 确认后删除来源及所有课程
   - lesson行右侧有删除按钮 → 点击弹confirm → 确认后删除课程
   - 删除最后一个课程时来源自动删除
6. **素材库编辑**：
   - lesson行右侧有编辑按钮 → 点击弹出编辑表单
   - 修改标题/BPM/时长 → 保存后课程信息更新
7. **浏览器预览**：在 http://localhost:8000/index.html 验证所有功能
