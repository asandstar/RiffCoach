# 内置静态知识库 开发计划

## 一、需求概述

在现有 String Practice Compass 应用中新增「知识库」模块，作为底部第 5 个 tab。知识库包含：

1. **分类浏览**：按乐器（电吉他 / 木吉他 / 尤克里里）+ 类别（基础教程 / 基本功练习 / 视频课程 / 乐理知识）双重筛选
2. **知识点卡片**：每个知识点有标题、简介、难度、乐器、标签、详细内容（支持多行文本 + 步骤列表）
3. **视频教程集**：内置用户提供的 13 个 B 站视频，按乐器分类，带封面、标题、分集信息
4. **一键关联练习**：从知识库可直接"加入练习素材"，转化为 source-library 中的可练习条目
5. **收藏功能**：用户可收藏知识点，快速访问

## 二、当前代码分析

### 文件结构
- 单文件 SPA：`index.html`（约 2684 行）
- 数据持久化：`localStorage`，数据模型在 `defaultData`（第 1168-1212 行）
- 路由：`navigateTo()` 函数（第 1373-1404 行），通过 `.page` 容器 + `data-page` 导航
- 底部导航：`.bottom-nav-inner` 内有 4 个 nav-btn（dashboard / source-library / weekly-review / calendar）

### 现有页面模型
- Dashboard：工作台，乐器卡片 + 推荐练习 + 卡点 + 技能进步
- Source Library：素材库，来源列表 + 课程展开
- Practice Session：练习模式，计时器 + BPM + 评价
- Weekly Review：周复盘，统计 + 建议
- Calendar：练琴日历，月视图 + 日详情

### 数据模型
```js
state = {
  instruments: [],       // 乐器列表
  sources: [],           // 练习来源（含 lessons）
  sessions: [],          // 练习记录
  painPointOptions: []   // 痛点选项
}
```

## 三、知识库数据结构

新增 `knowledgeBase` 到 `defaultData` 和 `state`：

```js
knowledgeBase: {
  // 分类配置
  categories: [
    { id: 'basics', name: '基础教程', icon: 'book-open' },
    { id: 'practice', name: '基本功练习', icon: 'dumbbell' },
    { id: 'video', name: '视频课程', icon: 'play-circle' },
    { id: 'theory', name: '乐理知识', icon: 'music' }
  ],
  // 知识点列表
  items: [
    {
      id: 'kb_001',
      title: '持琴姿势与右手拨弦基础',
      instrument: 'electric',     // electric | acoustic | ukulele | all
      category: 'basics',
      difficulty: 1,              // 1-5 星
      tags: ['入门', '姿势', '拨弦'],
      summary: '正确的持琴姿势是一切技巧的基础，本教程讲解电吉他的标准持法与右手拨弦要领。',
      content: [
        { type: 'paragraph', text: '...' },
        { type: 'list', items: ['...', '...'] },
        { type: 'tip', text: '小提示：...' }
      ],
      video: null,                // 可选关联视频 bvid
      isBuiltIn: true             // 是否内置
    }
  ],
  // 视频教程（独立列表，也作为 category='video' 的条目）
  videos: [
    {
      id: 'vid_001',
      title: '电吉他入门教程',
      bvid: 'BV1NJVJzEEnn',
      instrument: 'electric',
      cover: '',                   // B站封面URL（可选，留空用默认）
      episodes: 40,                // 分集数（已知的填，未知的从API获取或留空）
      summary: '从零开始学电吉他...',
      tags: ['入门', '系统教学']
    }
  ],
  // 用户收藏的知识点 ID
  favorites: []
}
```

## 四、内置内容规划

### 4.1 基础教程（Basics）— 约 8-10 条
- **电吉他**：持琴姿势、右手拨弦、左手按弦、调音、换弦方法
- **木吉他**：持琴姿势、右手手指拨弦（pima）、左手按弦、调弦
- **尤克里里**：持琴姿势、右手扫弦、左手按弦、调弦

### 4.2 基本功练习（Practice）— 约 6-8 条
- **电吉他**：爬格子（Spider Exercise）、交替拨弦、击勾弦、推弦、揉弦、扫拨
- **木吉他**：爬格子、分解和弦、扫弦节奏型、指弹基础
- **尤克里里**：爬格子、扫弦节奏型、分解和弦

### 4.3 视频课程（Videos）— 用户提供的 13 个
按乐器分类：
- **电吉他（4个）**：
  - BV1NJVJzEEnn — 入门教程
  - BV1FT411Z7iu — 系统教学（p=43起）
  - BV1bx411H768 — 技巧进阶
  - BV1uq4y1m7QN — 乐曲教学
- **木吉他（4个）**：
  - BV1HG411V7wA — 入门教程
  - BV1c7411t7dR — 指弹教程
  - BV1oy421B76E — 弹唱教程
  - BV1hb411G7Pf — 技巧进阶
- **尤克里里（5个）**：
  - BV1Kx41147iq — 入门教程
  - BV1Dx41147rA — 弹唱教程
  - BV1Kx411S7vN — 指弹教程
  - BV1Rx411C7Nw — 技巧进阶
  - （第5个来自 bilibili space 合集，可能需要单独处理）

### 4.4 乐理知识（Theory）— 约 5-6 条
- 音名与唱名、十二平均律
- 音程基础
- 三和弦与七和弦构成
- 自然大调音阶与小调音阶
- 五声音阶与布鲁斯音阶
- 调式基础（Ionian / Dorian 等）

## 五、页面结构设计

### 5.1 知识库主页面（page-knowledge）

```
顶部筛选栏
  ├─ 乐器切换（电吉他 / 木吉他 / 尤克里里 / 全部）
  └─ 分类 tabs（基础 / 基本功 / 视频 / 乐理）

搜索框（可选，第一版简化可以不放）

内容列表（卡片式）
  ├─ 基础教程卡片：标题 + 难度星 + 标签 + 简介
  ├─ 基本功练习卡片：标题 + 难度星 + 时长 + "开始练习"按钮
  ├─ 视频卡片：封面 + 标题 + 集数 + 标签
  └─ 乐理卡片：标题 + 标签 + 简介

收藏浮窗 / 空状态
```

### 5.2 知识点详情页（Bottom Sheet 展开）
点击卡片弹出底部 Sheet：
- 标题 + 难度 + 标签
- 详细内容（段落 + 列表 + 小贴士）
- 底部操作栏：「收藏」+「加入练习素材」+（视频类）「播放」

### 5.3 视频播放页
复用现有 Practice Session 的视频播放区框架，但简化为纯观看模式：
- 顶部视频播放器（16:9）
- 视频标题 + 简介 + 标签
- 分集列表（如果有）
- 「加入练习素材」按钮

## 六、修改步骤

### Step 1：添加知识库数据模型
- 在 `defaultData` 中新增 `knowledgeBase` 字段
- 内置 30+ 条知识点内容（基础/基本功/乐理）+ 13 个视频
- `loadData()` 保持兼容（旧用户没有 knowledgeBase 字段时，合并默认数据）

### Step 2：底部导航新增第 5 个 tab
- 在 `.bottom-nav-inner` 中添加「知识库」按钮（book-open 图标）
- `navigateTo()` 中添加 `knowledge` 路由

### Step 3：新增知识库页面 HTML
- `page-knowledge` 容器
- 乐器切换 chips
- 分类 tabs
- 内容列表区（动态渲染）
- 知识点详情 Bottom Sheet

### Step 4：实现知识库渲染函数
- `renderKnowledgeBase()`：主页面渲染 + 筛选逻辑
- `renderKnowledgeCard()`：单张卡片渲染
- `openKnowledgeDetail(itemId)`：打开详情 Sheet
- `toggleFavorite(itemId)`：收藏切换

### Step 5：实现「加入练习素材」功能
- 从知识库条目一键创建 source + lesson（bilibili 类型）
- 自动填入标题、bvid、page、目标 BPM、标签等
- 创建后跳转到素材库并展开对应来源

### Step 6：视频播放功能
- 复用现有 B 站嵌入播放器逻辑
- 新增简化版视频观看页（或复用 practice 页面的视频区）
- 分集切换

### Step 7：样式与动效
- 卡片玻璃拟态风格（与现有 design token 一致）
- 分类切换动画
- 收藏星标动效
- 详情 Sheet 弹出动画（复用现有 bottom-sheet 样式）

## 七、涉及文件

仅需修改 **`index.html`** 一个文件（单页应用，所有代码在同一文件）：
- `<style>` 区：新增知识库相关 CSS
- `<body>` 区：新增 `page-knowledge` 页面 + 详情 Sheet
- `<script>` 区：
  - `defaultData` 新增 `knowledgeBase` 字段
  - `loadData()` 数据迁移（合并默认知识库数据）
  - `navigateTo()` 新增 knowledge 路由
  - 新增渲染函数（约 5-6 个）
  - 新增事件绑定

## 八、风险与注意事项

### 风险 1：内置内容质量
- **措施**：知识点内容保持精简实用，每篇控制在 200-500 字，重点是结构化和可操作性，不追求百科式详尽
- 视频课程的分集数可能不准确，先显示已知信息，用户点击后可从B站播放器内切换

### 风险 2：页面文件过大
- **现状**：当前约 2684 行
- **预计新增**：约 400-600 行（数据 + HTML + CSS + JS）
- **措施**：知识库数据量较大时可考虑拆分为独立 JS 文件，但第一版先放在同一文件中（仍远低于 500 行单文件限制的... 哦，单文件 3000+ 行是可接受的 SPA 规模）

### 风险 3：与现有素材库的关系
- **设计原则**：知识库是「参考/学习」，素材库是「我的练习」
- 用户可将知识库内容「加入素材库」转化为自己的练习条目
- 两者数据分离，知识库只读，素材库可编辑

### 风险 4：B站视频封面/标题获取
- **措施**：第一版使用用户提供的手动填写的标题和简介
- 封面使用 B 站通用封面 URL 格式：`https://i0.hdslb.com/bfs/archive/{bvid}.jpg`（不一定准确，留空则用渐变占位）
- 后续可通过 CORS 代理自动获取视频信息

## 九、验证清单

- [ ] 底部导航有 5 个 tab，「知识库」可正常切换
- [ ] 乐器筛选（电吉他/木吉他/尤克里里/全部）正常工作
- [ ] 分类 tabs（基础/基本功/视频/乐理）正常切换
- [ ] 知识点卡片正确渲染（标题、难度、标签、简介）
- [ ] 点击卡片弹出详情 Sheet，内容正确显示
- [ ] 收藏功能正常（点击星标切换，刷新后保持）
- [ ] 「加入练习素材」功能：点击后在素材库中出现对应条目
- [ ] 视频类卡片：点击后进入视频播放页，B站播放器正常加载
- [ ] 数据导出/导入包含知识库数据
- [ ] 响应式布局在移动端正常
