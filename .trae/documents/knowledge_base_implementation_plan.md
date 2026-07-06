# 内置静态知识库功能实现计划

## 项目概述

在现有的 String Practice Compass 单页应用中实现完整的「内置静态知识库」功能，包含知识点浏览、视频课程、收藏、加入素材库等功能。

## 现有结构分析

- **技术栈**: Vanilla JS + Tailwind CSS + 自定义 CSS 变量 + Lucide 图标
- **设计风格**: 玻璃拟态 (Glassmorphism)
- **路由方式**: 单页应用，通过 `navigateTo(page)` 切换页面
- **数据存储**: localStorage，key 为 `spc_data_v1`
- **现有页面**: dashboard（工作台）、source-library（素材库）、weekly-review（周复盘）、calendar（日历）、practice（练习页）
- **现有组件**: bottom-sheet、glass-card、chip-selector、category-tab 等

## 实现步骤

### 步骤一：数据模型（defaultData.knowledgeBase）

在 `defaultData` 对象中新增 `knowledgeBase` 属性，包含：
- `categories`: 4个分类（基础教程、基本功练习、视频课程、乐理知识）
- `items`: 约24条内置知识点（电吉他/木吉他/尤克里里 + 基础/基本功/乐理）
- `videos`: 13个内置视频（电吉他4个、木吉他4个、尤克里里5个）
- `favorites`: 收藏数组（初始为空）

每条 item 包含：id, title, instrument, category, difficulty, tags, summary, content[]
每个 video 包含：id, title, bvid, instrument, summary, tags

### 步骤二：loadData 兼容性修改

修改 `loadData()` 函数，当旧数据没有 `knowledgeBase` 时，合并默认的 knowledgeBase 数据。

### 步骤三：CSS 样式

在 `<style>` 标签末尾新增知识库相关样式：
- `.kb-card`: 玻璃卡片，hover 效果
- `.kb-chip`: 筛选 chip
- `.kb-category-tab`: 分类 tab
- `.kb-difficulty`: 难度星显示
- `.kb-video-cover`: 视频卡片封面（渐变背景 + play 图标）
- `.kb-detail-content`: 详情 sheet 内容样式
- `.kb-paragraph`: 段落样式
- `.kb-list`: 列表样式
- `.kb-tip`: 小贴士卡片样式
- `.kb-empty`: 空状态样式

### 步骤四：底部导航

在 `bottom-nav-inner` 中，在「日历」之后添加第5个导航按钮：
- 图标：book-open
- 文字：知识库
- data-page: "knowledge"

### 步骤五：知识库主页面（page-knowledge）

在 `page-calendar` 之后添加 `page-knowledge` 页面：
- 顶部标题 "知识库" + 副标题 "学习 & 提升"
- 乐器切换 chips：全部 / 电吉他 / 木吉他 / 尤克里里
- 分类 tabs：基础教程 / 基本功练习 / 视频课程 / 乐理知识（带图标）
- 内容列表区 #kb-list
- 空状态（筛选结果为空时显示）

### 步骤六：知识库详情 Bottom Sheet

新增 `#kb-detail-sheet`（复用 bottom-sheet 样式）：
- 顶部拖拽条
- 标题 + 难度星 + 标签
- 内容区（paragraph / list / tip 类型内容块）
- 底部操作栏：收藏按钮 + 加入素材库按钮

### 步骤七：视频播放页（page-kb-video）

新增 `page-kb-video` 页面（no-nav，类似 practice-page）：
- 顶部返回按钮 + 标题
- B站视频播放器（16:9，复用 bili-player iframe 逻辑）
- 视频信息：标题、简介、标签
- 「加入练习素材」按钮

### 步骤八：JavaScript 函数

新增以下函数并挂载到 window：
1. `renderKnowledgeBase()` — 主页面渲染
2. `getFilteredKBItems()` — 筛选逻辑（乐器 + 分类）
3. `renderKBCard(item)` — 单张卡片渲染
4. `openKBDetail(itemId, itemType)` — 打开详情Sheet
5. `closeKBDetail()` — 关闭详情Sheet
6. `toggleKBFavorite(itemId, itemType)` — 切换收藏
7. `addKBToLibrary(itemId, itemType)` — 加入素材库
8. `openKBVideo(videoId)` — 打开视频播放页
9. `renderKBVideoPage(videoId)` — 渲染视频播放页

### 步骤九：navigateTo 修改

在 `navigateTo()` 中添加：
- `if (page === 'knowledge') renderKnowledgeBase();`
- `if (page === 'kb-video') { ... }`
- pageHasNav 排除 'kb-video'

### 步骤十：事件绑定

在 DOMContentLoaded 中添加：
- 乐器筛选 chips 点击事件
- 分类 tabs 点击事件
- 详情 sheet 关闭事件
- 收藏按钮事件
- 加入素材库按钮事件
- 视频播放页返回按钮事件
- 加入练习素材按钮事件
- ESC 键关闭详情 sheet

## 全局状态变量

- `currentKBInstrument`: 当前选中的乐器筛选（'all' | 'electric' | 'acoustic' | 'ukulele'）
- `currentKBCategory`: 当前选中的分类（'basics' | 'practice' | 'video' | 'theory'）
- `currentKBDetailItem`: 当前打开的详情项
- `currentKBVideoId`: 当前播放的视频ID

## 数据结构详细说明

### knowledgeBase.items 示例
```js
{
  id: 'kb_e_01',
  title: '持琴姿势与坐姿',
  instrument: 'electric',
  category: 'basics',
  difficulty: 1,
  tags: ['入门', '姿势'],
  summary: '简述正确的持琴姿势，坐姿站立姿势要点，背带调节，琴体位置',
  content: [
    { type: 'paragraph', text: '...' },
    { type: 'list', items: ['...', '...'] },
    { type: 'tip', text: '...' }
  ]
}
```

### knowledgeBase.videos 示例
```js
{
  id: 'vid_e1',
  title: '电吉他入门系统教程',
  bvid: 'BV1NJVJzEEnn',
  instrument: 'electric',
  summary: '从零开始学习电吉他的系统教程',
  tags: ['入门', '系统教学']
}
```

## addKBToLibrary 逻辑

- **video 类型**: 创建 bilibili 类型 source，source 名用视频标题，lessons 里加一条 lesson
  - 标题 = 视频标题
  - bvid = 视频 bvid
  - page = 1
  - 目标 BPM 默认 80
  - 目标时长 10 分钟
  - 标签从 video.tags 来

- **item 类型（practice 分类）**: 创建 custom/book 类型 source
  - source 名："知识库 - 基本功练习"
  - lesson 用 item 标题
  - tags 从 item.tags 来
  - 目标 BPM 根据难度（难度1=60，难度2=80，难度3=100）
  - 目标时长 10 分钟

保存后跳转到素材库并展开对应来源。

## 注意事项

1. 所有新增代码必须与现有风格一致，使用现有 CSS 变量
2. 使用 lucide 图标（通过 `data-lucide` 属性，调用 `lucide.createIcons()`）
3. 玻璃拟态风格（`--glass-bg`, `--glass-blur`, `--glass-border`）
4. 响应式设计（继承现有 page-content max-width: 480px）
5. 不删除任何现有功能
6. 确保 loadData 兼容旧数据（没有 knowledgeBase 时合并默认数据）
7. 导出/导入自动包含 knowledgeBase（因为它在 state 里）
8. 事件绑定放在 DOMContentLoaded 里
9. 全局函数挂到 window 上供 onclick 调用
