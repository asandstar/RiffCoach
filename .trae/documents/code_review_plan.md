# RiffCoach 代码 Review 修复计划

## 问题清单

### Critical Bugs（严重缺陷）

1. **练习页缺少 Cover 关联信息区域**
   - 文件：index.html (练习页 HTML)
   - 问题：JS 代码引用了 `practice-cover-info`、`practice-cover-title`、`practice-cover-section`、`practice-daily-target`、`practice-ai-reason`、`practice-avoid-tips`，但 HTML 中不存在这些元素
   - 影响：练习页无法显示 Cover 关联信息

2. **练习页缺少 `practice-video-wrap` 元素**
   - 文件：index.html (练习页 HTML)
   - 问题：`setVideoSize` 函数引用了 `practice-video-wrap`，但 HTML 中不存在
   - 影响：视频尺寸切换功能在练习页不生效

3. **周复盘引用错误字段**
   - 文件：index.html (renderWeeklyReview 函数)
   - 问题：代码使用 `s.bpm`，但 session 对象使用的是 `currentBPM`
   - 影响：周复盘无法正确显示 BPM 数据

4. **AI 反馈页"继续练这个段落"按钮空指针**
   - 文件：index.html (renderAIFeedbackPage 函数)
   - 问题：当 session 没有 projectId 时，`startPracticeFromProject` 会收到空字符串
   - 影响：可能导致练习页无法正确渲染

### Major Issues（重要问题）

5. **generateDemoData 数据追加问题**
   - 文件：index.html (generateDemoData 函数)
   - 问题：demo 数据使用 `[...state.sessions, ...demoSessions]` 追加，多次加载会重复
   - 影响：练习记录会重复累积

6. **练习页返回按钮逻辑错误**
   - 文件：index.html (practice-back 事件)
   - 问题：无论从哪个页面进入练习页，返回都跳转到 source-library
   - 影响：用户体验差

7. **素材库缺少"AI 拆解为练习任务"按钮**
   - 文件：index.html (素材库渲染)
   - 问题：需求中提到要新增，但代码未实现
   - 影响：功能缺失

### Minor Issues（次要问题）

8. **底部导航 active 状态同步问题**
   - 文件：index.html (navigateTo 函数)
   - 问题：手动设置 nav-btn active 的逻辑可能与实际页面不匹配

9. **state 默认值缺少字段**
   - 文件：index.html (loadData/mergeDefaults)
   - 问题：loadData 返回的 state 可能缺少 coverProjects 等新字段

10. **Cover 详情页创建方式不一致**
    - 文件：index.html (showCoverDetail 函数)
    - 问题：动态创建 DOM 元素而非使用已有 bottom sheet，可能导致样式不一致

## 修复步骤

### Step 1: 修复练习页 HTML 缺失元素
- 在练习页 header 下方添加 Cover 关联信息区域
- 添加 `practice-video-wrap` 包裹视频区域

### Step 2: 修复周复盘字段引用
- 将 `s.bpm` 替换为 `s.currentBPM || s.bpm`

### Step 3: 修复 AI 反馈页按钮
- 添加 null check，当没有 projectId 时隐藏或禁用按钮

### Step 4: 修复 generateDemoData
- 将 `state.sessions = [...state.sessions, ...demoSessions]` 改为 `state.sessions = demoSessions`

### Step 5: 修复练习页返回逻辑
- 记录进入练习页前的页面，返回时回到原页面

### Step 6: 添加素材库 AI 拆解按钮
- 在素材库课程卡片中添加"AI 拆解"按钮

### Step 7: 完善 state 默认值
- 确保 mergeDefaults 正确处理所有新增字段

### Step 8: 统一 Cover 详情页创建方式
- 使用已有的 bottom sheet 结构

## 文件修改清单

| 文件 | 修改内容 |
|------|----------|
| index.html | 添加练习页 Cover 信息区域 HTML |
| index.html | 添加 practice-video-wrap |
| index.html | 修复周复盘 bpm 字段引用 |
| index.html | 修复 AI 反馈页按钮 null check |
| index.html | 修复 generateDemoData 数据追加 |
| index.html | 修复练习页返回逻辑 |
| index.html | 添加素材库 AI 拆解按钮 |
| index.html | 完善 state 默认值 |

## 测试路径

1. 加载演示数据 → 验证数据不重复
2. 进入 Cover 页面 → 验证项目显示正确
3. 进入练习页 → 验证 Cover 关联信息显示
4. 完成练习 → 验证 AI 反馈页显示
5. 查看周复盘 → 验证 BPM 显示正确
6. 练习页返回 → 验证回到正确页面

## 提交到 GitHub

修复完成后执行：
```bash
git add index.html
git commit -m "Fix bugs: practice page elements, weekly review bpm field, demo data duplication"
git push
```