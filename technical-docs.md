# String Practice Compass - 技术文档

## 1. 项目概述

### 1.1 项目名称
String Practice Compass（琴弦练习指南针）

### 1.2 项目定位
一款智能乐器练习辅助工具，专为吉他、尤克里里学习者设计，提供精准计时、BPM控制、知识管理、视频学习等一体化练习解决方案。

### 1.3 核心价值
- 帮助乐器学习者高效管理练习时间
- 提供精准的速度控制和节奏训练
- 整合专业知识和教学资源
- 通过数据记录追踪学习进度

---

## 2. 技术架构

### 2.1 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | React | 18+ | UI组件开发 |
| 语言 | TypeScript | 5+ | 类型安全 |
| 构建工具 | Vite | 5+ | 快速构建 |
| 样式 | Tailwind CSS | 3+ | 原子化CSS |
| 状态管理 | Zustand | 4+ | 轻量级状态管理 |
| 图标 | Lucide React | 0.312+ | 矢量图标库 |

### 2.2 项目结构

```
src/
├── components/           # 通用组件
│   ├── BpmKnob.tsx       # BPM旋钮控件
│   ├── BottomNav.tsx     # 底部导航
│   ├── GlassCard.tsx     # 玻璃拟态卡片
│   └── VideoPlayerCard.tsx # 视频播放器卡片
├── pages/                # 页面组件
│   ├── PracticePage.tsx  # 练习页面
│   ├── KnowledgePage.tsx # 知识库页面
│   ├── ReviewPage.tsx    # 练习记录页面
│   ├── CoverPage.tsx     # Cover目标页面
│   └── TodayPage.tsx     # 今日首页
├── store/                # 状态管理
│   └── useAppStore.ts    # 全局状态
├── data/                 # 默认数据
│   └── defaultData.ts    # 默认知识库、视频等数据
├── utils/                # 工具函数
│   ├── bilibili.ts       # B站API封装
│   ├── aiMock.ts         # AI反馈模拟
│   └── date.ts           # 日期时间工具
├── types/                # TypeScript类型定义
│   └── index.ts          # 全局类型
├── App.tsx               # 主应用组件
├── main.tsx              # 入口文件
└── index.css             # 全局样式
```

---

## 3. 核心功能实现

### 3.1 智能计时器

**文件**: [PracticePage.tsx](src/pages/PracticePage.tsx)

**功能特性**:
- 精确计时（秒级精度）
- 暂停/继续控制
- 前进/后退60秒
- 时间点快速选择（5/10/15/20/30/45/60分钟）

**实现逻辑**:
```typescript
const [timeElapsed, setTimeElapsed] = useState(0);
const [isRunning, setIsRunning] = useState(false);
const timerRef = useRef<number | null>(null);

// 计时器逻辑
useEffect(() => {
  if (isRunning) {
    timerRef.current = window.setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
  } else {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, [isRunning]);
```

### 3.2 BPM旋钮控件

**文件**: [BpmKnob.tsx](src/components/BpmKnob.tsx)

**功能特性**:
- 旋钮旋转调节（270°旋转范围）
- 手动输入数值
- 输入验证（40-200范围）
- 实时数值反馈
- 支持鼠标拖动和触摸滑动

**实现逻辑**:

**旋转角度计算**:
```typescript
const ROTATION_RANGE = 270; // 旋转范围
const START_ANGLE = -135;   // 起始角度

const percentage = ((value - min) / (max - min)) * 100;
const rotation = START_ANGLE + (percentage / 100) * ROTATION_RANGE;
```

**角度与数值转换**:
```typescript
const deltaAngle = currentAngle - startAngle;
const valueDelta = (deltaAngle / ROTATION_RANGE) * (max - min);
const newValue = Math.round(startBpm + valueDelta);
```

**输入验证**:
```typescript
const handleInputBlur = () => {
  const newValue = parseInt(inputValue, 10);
  if (isNaN(newValue) || newValue < min || newValue > max) {
    setShowError(true);
    setTimeout(() => setShowError(false), 2000);
    setInputValue(value.toString());
  } else {
    onChange(newValue);
  }
};
```

### 3.3 节拍器功能

**文件**: [PracticePage.tsx](src/pages/PracticePage.tsx)

**功能特性**:
- 基于Web Audio API实现
- 可调BPM（40-200）
- 点击声频率800Hz
- 自动适应BPM变化

**实现逻辑**:
```typescript
const playClick = () => {
  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContext();
  }
  const ctx = audioContextRef.current;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.value = 800;
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.05);
};

// 根据BPM计算间隔
const interval = (60 / bpm) * 1000;
metronomeRef.current = window.setInterval(playClick, interval);
```

### 3.4 知识库导航

**文件**: [KnowledgePage.tsx](src/pages/KnowledgePage.tsx)

**功能特性**:
- 按需收起/展开导航栏
- 平滑过渡动画（300ms）
- 状态记忆（localStorage）
- 收起状态保留图标导航

**实现逻辑**:
```typescript
const STORAGE_KEY = 'knowledge_nav_collapsed';
const [isNavCollapsed, setIsNavCollapsed] = useState(false);

// 加载保存的状态
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    setIsNavCollapsed(saved === 'true');
  }
}, []);

// 保存状态
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, isNavCollapsed.toString());
}, [isNavCollapsed]);
```

### 3.5 B站视频集成

**文件**: [utils/bilibili.ts](src/utils/bilibili.ts)

**功能特性**:
- 视频链接解析
- 选集信息获取
- 超时控制（5秒）
- 重试机制（最多3次）

**实现逻辑**:
```typescript
export async function fetchBiliEpisodes(bvid: string): Promise<BiliEpisode[]> {
  const proxyUrls = [
    `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
    // 备用代理...
  ];
  
  for (let i = 0; i < proxyUrls.length; i++) {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 5000);
    
    try {
      const response = await fetch(proxyUrls[i], { 
        signal: abortController.signal,
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return parseEpisodes(data);
      }
    } catch {
      clearTimeout(timeoutId);
    }
  }
  
  return [];
}
```

---

## 4. 数据模型

### 4.1 练习记录 (Session)

```typescript
interface Session {
  id: string;
  lessonId: string | null;
  instrument: InstrumentType;
  date: number;
  durationSeconds: number;
  bpm: number;
  currentBPM: number;
  repetitions: number;
  selfRating: number;
  painPoints: PainPoint[];
  painPointDetails: { painPoint: string; detail: string }[];
  notes: string;
  cleanBPM: number;
  feedback?: AIFeedback;
}
```

### 4.2 知识库条目 (KnowledgeBaseItem)

```typescript
interface KnowledgeBaseItem {
  id: string;
  category: string;
  instrument: InstrumentType;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  summary: string;
  stage: '零基础' | '入门' | '进阶' | '曲目';
  relatedSkills: string[];
  commonMistakes: string[];
  practiceSuggestions: string[];
  content: ContentItem[];
}
```

### 4.3 视频资源 (VideoResource)

```typescript
interface VideoResource {
  id: string;
  title: string;
  source: 'bilibili';
  bvid: string;
  instrument: InstrumentType;
  stage: '零基础' | '入门' | '进阶' | '曲目';
  difficulty: 1 | 2 | 3;
  skills: string[];
  summary: string;
  keyPoints: string[];
  commonMistakes: string[];
  suggestedPractice: {
    durationMinutes: number;
    startBPM: number;
    targetBPM: number;
    steps: string[];
  };
  episodes?: {
    page: number;
    title: string;
    skills: string[];
    summary: string;
    suggestedTaskTitle: string;
  }[];
}
```

---

## 5. 状态管理

**文件**: [store/useAppStore.ts](src/store/useAppStore.ts)

### 5.1 核心状态

```typescript
interface AppState {
  instruments: Instrument[];
  sources: Source[];
  sessions: Session[];
  coverProjects: CoverProject[];
  knowledgeBase: KnowledgeBase;
  videoResources: VideoResource[];
  currentEfficientPlan: EfficientPlan | null;
  videoSize: 'compact' | 'expanded';
}
```

### 5.2 核心Actions

| Action | 功能 |
|--------|------|
| `addSession` | 添加练习记录 |
| `updateSession` | 更新练习记录 |
| `setSessionFeedback` | 设置AI反馈 |
| `updateCoverProject` | 更新Cover项目 |
| `toggleVideoSize` | 切换视频尺寸 |

---

## 6. 性能优化

### 6.1 懒加载
- 使用React Suspense和lazy加载非关键页面
- 视频资源按需加载

### 6.2 缓存策略
- 练习记录本地存储
- B站选集数据缓存
- 知识库导航状态记忆

### 6.3 渲染优化
- 使用React.memo避免不必要的重渲染
- 列表渲染使用稳定的key

---

## 7. 响应式设计

### 7.1 断点策略

| 断点 | 宽度 | 布局 |
|------|------|------|
| 移动端 | < 640px | 单列堆叠 |
| 平板 | 640px - 1024px | 双列布局 |
| 桌面 | > 1024px | 完整布局 |

### 7.2 适配方案
- 底部导航仅在移动端显示
- 知识库侧边栏在移动端可收起
- 视频播放器自适应容器尺寸

---

## 8. 浏览器兼容性

| 浏览器 | 版本要求 | 支持特性 |
|--------|----------|----------|
| Chrome | ≥ 90 | 完整支持 |
| Firefox | ≥ 88 | 完整支持 |
| Safari | ≥ 14 | 完整支持 |
| Edge | ≥ 90 | 完整支持 |

---

## 9. 构建与部署

### 9.1 构建命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 预览生产版本
npm run preview
```

### 9.2 部署配置

- Vercel部署：自动检测项目配置
- 静态文件部署：将dist目录上传至静态托管服务

---

## 10. 未来优化方向

### 10.1 功能增强
- 社交分享功能
- 练习计划定制
- 社区互动模块

### 10.2 技术优化
- PWA支持（离线使用）
- 数据同步（云端备份）
- 性能监控

### 10.3 内容扩展
- 更多乐器支持
- 第三方课程接入
- 用户贡献内容