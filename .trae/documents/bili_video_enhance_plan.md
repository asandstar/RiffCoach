# B站视频播放体验优化计划

## 一、问题分析

用户反馈了 5 个问题，结合代码分析结论如下：

### 1. 视频清晰度不够
**根因**：B站嵌入播放器（`player.bilibili.com`）在不登录状态下默认只能播放 360P。当前代码使用 `high_quality=1` 参数，但该参数仅在某些情况下提升到 480P，无法保证 1080P。**这是B站平台限制，纯前端无法绕过**——要 1080P 必须在B站登录。

**当前参数**（[index.html#L3622](file:///Users/azq/Library/Application%20Support/TRAE%20SOLO%20CN/ModularData/ai-agent/work-mode-projects/6a486b37f296dc6b73da3fec/string-practice-compass/index.html#L3622)）：
```
?bvid=${video.bvid}&page=1&high_quality=1&danmaku=0
```

### 2. 不能调选集
**根因**：知识库视频页 `renderKBVideoPage()` 硬编码 `page=1`，video 数据对象没有 episodes 字段。虽然有 `fetchBiliEpisodes()` 函数能通过 CORS 代理获取分P列表，但**只在添加练习表单中使用，视频播放页从未调用**。

### 3. 没有显示当前选集
**根因**：视频播放页只有标题/简介/标签，没有选集信息展示。

### 4. 视频框大小不能调节
**根因**：视频区是固定 16:9 占满宽度（`padding-bottom: 56.25%`），没有尺寸调节或全屏按钮。实际上 iframe 已有 `allowfullscreen="true"`，但用户可能没注意到B站播放器自带的全屏按钮。

### 5. 调清晰度是否必须跳转B站登录？
**结论**：**是的**。B站嵌入播放器要 1080P 必须登录B站账号，这是平台策略。最佳方案是提供"在B站打开"按钮，让用户在新标签页中观看高清版。

---

## 二、改进方案

### 改进 1：优化B站播放器参数
**文件**：`index.html`  
**位置**：`renderKBVideoPage()` 函数（第 3622 行）和练习模式（第 2365 行）

将播放器 URL 参数从：
```
?bvid=${bvid}&page=${page}&high_quality=1&danmaku=0
```
改为：
```
?bvid=${bvid}&page=${page}&high_quality=1&danmaku=1&as_wide=1&autoplay=0
```

- `danmaku=1`：开启弹幕（让用户自己选择开关，B站播放器内置弹幕开关）
- `as_wide=1`：宽屏模式，显示更多内容
- `autoplay=0`：不自动播放（避免多选集切换时自动播放）
- 保留 `high_quality=1`

### 改进 2：知识库视频页添加选集功能
**文件**：`index.html`

#### 2.1 数据层：video 对象添加 episodes 字段
在 `defaultData.knowledgeBase.videos` 中，给每个 video 对象添加空数组：
```js
episodes: []  // 初始为空，进入播放页时动态获取
```

#### 2.2 HTML：视频播放页添加选集列表区
在视频信息区和"加入练习素材"按钮之间，添加选集列表区：
```html
<section id="kb-video-episodes" style="display: none; padding: 0 16px; margin-bottom: 20px;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
        <h3 style="font-size: var(--text-sm); font-weight: var(--weight-bold);">选集</h3>
        <span id="kb-video-current-ep" style="font-size: var(--text-xs); color: var(--text-tertiary);"></span>
    </div>
    <div id="kb-video-ep-list" style="max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;"></div>
</section>
```

#### 2.3 JS：进入视频页时获取选集
修改 `renderKBVideoPage()`：
1. 渲染视频基本信息
2. 调用 `fetchBiliEpisodes(video.bvid)` 获取分P列表
3. 有分P：显示选集列表，每项显示 `P${page} ${title}`，点击切换播放
4. 无分P：隐藏选集区
5. 显示当前选集信息（标题下方）

#### 2.4 JS：选集切换函数
新增 `switchKBVideoEpisode(page, title)` 函数：
- 更新 iframe src 的 `page` 参数
- 更新当前选集高亮
- 更新标题区域显示

### 改进 3：添加"在B站打开高清版"按钮
**文件**：`index.html`

在视频播放页的操作区（"加入练习素材"按钮旁边），添加"在B站打开"按钮：
```html
<div style="display: flex; gap: 10px;">
    <a id="kb-open-bili" href="#" target="_blank" rel="noopener" 
       class="btn-ghost" style="flex: 1; text-align: center; text-decoration: none; padding: 10px;">
        <i data-lucide="external-link" style="width: 16px; height: 16px; margin-right: 4px;"></i>
        B站看高清
    </a>
    <button class="btn-primary" id="kb-add-to-library-btn" style="flex: 1;">
        <i data-lucide="plus" style="width: 18px; height: 18px; margin-right: 6px;"></i>
        加入练习
    </button>
</div>
```

在 `renderKBVideoPage()` 中设置链接：
```js
document.getElementById('kb-open-bili').href = 
    `https://www.bilibili.com/video/${video.bvid}`;
```

### 改进 4：练习模式也添加选集切换
**文件**：`index.html`

在练习模式的视频区下方，添加一个简洁的选集切换栏（横向 chip 滚动），复用 `fetchBiliEpisodes()` 函数。修改 `renderPracticeSession()` 中视频区渲染逻辑。

### 改进 5：视频框添加全屏提示
在视频框右上角添加一个小的全屏按钮覆盖层，点击触发 iframe 内的全屏（利用已有的 `allowfullscreen`）。

---

## 三、涉及修改的位置

| 修改项 | 文件位置 | 行号 |
|--------|---------|------|
| 播放器参数优化（KB视频页） | index.html | ~3622 |
| 播放器参数优化（练习模式） | index.html | ~2365 |
| 视频页 HTML 添加选集区 | index.html | ~1426-1437 |
| 视频页 HTML 添加B站链接按钮 | index.html | ~1432-1437 |
| renderKBVideoPage 添加选集获取 | index.html | ~3609-3633 |
| 新增 switchKBVideoEpisode 函数 | index.html | 新增 |
| 练习模式添加选集切换 | index.html | ~2360-2370 |
| video 数据结构添加 episodes | index.html | ~1743-1757 |

---

## 四、验证步骤

1. 打开知识库 → 视频课程 → 点击视频卡片
2. 检查视频是否加载，参数是否优化
3. 检查是否有选集列表（多P视频应显示列表）
4. 点击不同选集，检查是否切换播放
5. 检查当前选集是否高亮显示
6. 检查"B站看高清"按钮是否跳转到正确的B站页面
7. 在练习模式中检查视频区是否有选集切换
8. 检查全屏功能是否正常
