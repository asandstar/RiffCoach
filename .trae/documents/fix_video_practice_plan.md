# 修复视频显示和练习相关功能计划

## 问题诊断

### 1. 视频选集问题（核心问题）

**问题1.1：VideoStudyPage中的节拍器和计时器使用旧代码**
- `VideoStudyPage.tsx` 第91-121行：节拍器使用旧的 `setInterval` 方式
- 声音持续时间只有 **0.05秒**（第109行），人耳几乎无法感知
- 音量只有 **0.1**（第108行），移动设备上听不到
- BPM变化时频繁重启节拍器（第123-128行），声音断断续续
- 与我们之前在 `PracticePage.tsx` 中修复的代码不一致！

**问题1.2：选集标题显示不准确**
- 当 `customEpisodes` 为空时尝试从B站API获取
- 代理获取经常失败，失败后使用 `getBiliFallbackEpisodes(10)` 返回通用标题
- 视频实际只有6集，但fallback返回10集，显示多余集数
- 标题显示为"第1集"、"第2集"等，没有实际分集标题

**问题1.3：视频链接解析功能不完善**
- `extractBvid` 函数只能提取BV号
- 没有支持完整URL解析（如 `https://www.bilibili.com/video/BVxxx`）
- 没有支持YouTube链接解析

### 2. 倍速播放功能问题

**问题2.1：倍速设置未应用到iframe**
- `VideoPlayerCard.tsx` 中显示了倍速菜单，但选择后未应用到视频播放
- `playerUrl` 没有包含倍速参数

### 3. 计时器逻辑问题

**问题3.1：状态更新冗余**
- `stopTimer` 内部调用 `setIsTimerRunning(false)`，与 `toggleTimer` 重复
- 需要统一状态管理逻辑

---

## 修复方案

### 修改文件 1：`src/pages/VideoStudyPage.tsx`

#### 修复1：同步节拍器代码到PracticePage标准
- 使用 `setTimeout` 递归替代 `setInterval`
- 使用 `bpmRef` 动态读取BPM，BPM变化时不重启节拍器
- 延长声音持续时间：0.05秒 → **0.15秒**
- 增大音量：0.1 → **0.3/0.4**
- 添加音量attack淡入效果
- 添加错误处理和try-catch

#### 修复2：优化计时器逻辑
- 移除 `stopTimer` 内部的 `setIsTimerRunning(false)` 调用
- 使用 `useRef` 存储计时器ID，避免闭包问题

### 修改文件 2：`src/components/VideoPlayerCard.tsx`

#### 修复3：倍速播放实际应用到iframe
- 在 `buildBiliPlayerUrl` 中添加倍速参数支持
- 将倍速值传递给iframe URL

### 修改文件 3：`src/utils/bilibili.ts`

#### 修复4：优化视频链接解析
- 增强 `extractBvid` 函数，支持完整URL解析
- 添加YouTube链接解析支持
- 添加更多平台的URL匹配模式

### 修改文件 4：`src/data/defaultData.ts`

#### 修复5：完善所有视频资源的分集数据
- 确保每个视频资源都有完整的 `episodes` 数组
- 确保集数和标题与实际视频匹配
- 添加缺失的视频资源分集数据

---

## 具体代码修改

### VideoStudyPage.tsx 修改

1. **添加 refs**：
   ```typescript
   const bpmRef = useRef(bpm);
   const beatCounterRef = useRef(0);
   ```

2. **修改节拍器 useEffect**：
   - 使用 `setTimeout` 递归，动态读取 `bpmRef`
   - 延长声音到0.15秒，音量到0.3/0.4
   - 添加淡入效果和错误处理

3. **修改计时器 useEffect**：
   - 移除 `stopTimer` 中的 `setIsTimerRunning(false)`

### VideoPlayerCard.tsx 修改

1. **传递倍速参数**：
   ```typescript
   const playerUrl = buildBiliPlayerUrl(bvid, page, playbackSpeed);
   ```

### bilibili.ts 修改

1. **增强链接解析**：
   ```typescript
   export function extractBvid(url: string | undefined): string | null {
     if (!url) return null;
     // 支持完整URL解析
     const bvidMatch = url.match(/BV([a-zA-Z0-9]{10})/);
     if (bvidMatch) return 'BV' + bvidMatch[1];
     return null;
   }
   
   // 添加YouTube链接解析
   export function extractVideoId(url: string | undefined, platform: 'bilibili' | 'youtube'): string | null {
     if (!url) return null;
     if (platform === 'bilibili') {
       return extractBvid(url);
     }
     // YouTube链接解析
     const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
     return youtubeMatch ? youtubeMatch[1] : null;
   }
   ```

2. **添加倍速参数支持**：
   ```typescript
   export function buildBiliPlayerUrl(bvid: string, page: number = 1, playbackSpeed: number = 1): string {
     return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}&high_quality=1&speed=${playbackSpeed}`;
   }
   ```

---

## 验证步骤

1. 构建项目，确认无TypeScript错误
2. 打开视频学习页面，点击节拍器按钮，确认能听到清晰的节拍声
3. 拖动BPM旋钮，确认节拍器不会频繁重启，声音连续稳定
4. 切换倍速，确认视频播放速度发生变化
5. 检查所有视频资源的选集标题是否正确显示
6. 测试链接解析功能，确认能正确提取视频ID

## 风险评估

- **低风险**：修改主要是参数调整和逻辑同步，不涉及数据结构变更
- **注意点**：B站播放器API的倍速参数可能有版本兼容性问题，需要测试
