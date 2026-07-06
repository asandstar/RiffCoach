# 练习功能 & 视频教程 Bug 修复计划

## 问题清单

### 1. B站 API 代理请求失败（控制台报错）
- **现象**: 多个 CORS 代理（allorigins.win, codetabs.com 等）请求失败，控制台输出 `net::ERR_ABORTED`
- **根因**: 公共 CORS 代理服务不稳定或已下线
- **影响**: 虽然有 customEpisodes 作为 fallback，但控制台报错不友好
- **修复方案**:
  - 优化错误处理，避免在控制台输出未捕获的错误
  - 优先使用 customEpisodes（预置的分集数据），API 获取失败时静默降级
  - 添加请求失败的优雅处理，减少代理尝试次数和超时时间

### 2. 切换选集时标题不更新
- **现象**: 视频学习页顶部标题始终显示视频总标题，切换分集后不显示当前分集标题
- **根因**: VideoStudyPage 的 h1 标题只使用 `video.title`，没有根据 currentPage 动态更新
- **修复方案**:
  - 在 VideoStudyPage 中根据 currentPage 查找对应分集标题
  - 标题区域显示：视频总标题 + 当前分集标题（如果有）
  - VideoPlayerCard 的选集列表已支持显示标题，无需修改

### 3. 练习页计时器和节拍器功能异常
- **现象 1**: 开始按钮点击后可能无反应
- **现象 2**: 节拍器没有声音
- **根因分析**:
  - 节拍器 AudioContext 创建时机不对：浏览器自动播放策略要求必须在用户交互事件中创建/恢复 AudioContext
  - 目前代码在 setInterval 回调中创建 AudioContext，不符合浏览器策略
- **修复方案**:
  - 在用户点击节拍器按钮的事件处理函数中创建/恢复 AudioContext
  - 使用 `audioContext.resume()` 确保上下文处于运行状态
  - 检查并修复 PracticePage 和 VideoStudyPage 中的相同问题
  - 添加首次点击时的 AudioContext 初始化

### 4. 练习页保留视频播放器（核心需求）
- **现象**: 点击"开始练习"跳转到独立的练习页，视频就看不到了
- **用户需求**: 练习时也能看到视频，包括选集切换，把下面的课程介绍换成计时器、BPM、节拍器、练习反馈记录
- **修复方案**:
  - **方案 A（推荐）**: 在 VideoStudyPage 中添加"练习模式" tab/切换
    - 保留视频播放器在顶部
    - 下方可切换："视频信息" / "练习工具"
    - 练习工具包含：计时器、节拍器、BPM 旋钮、重复次数、自评、卡点标签、备注、完成按钮
    - 无需跳转页面，体验更流畅
  - **方案 B**: 在 PracticePage 顶部嵌入视频播放器
    - 从 store 获取当前视频上下文
    - 顶部显示视频，下面是练习内容
    - 需要额外的状态管理
  
  选择方案 A，因为更符合用户"把下面的换成计时器"的描述，且实现更简单。

### 5. 全面检查项目中类似的错误
- 检查所有页面的 AudioContext 使用是否正确
- 检查所有计时器/setInterval 的清理是否正确
- 检查所有 fetch 请求的错误处理

## 涉及文件

1. `src/utils/bilibili.ts` - 优化 API 错误处理
2. `src/components/VideoPlayerCard.tsx` - 确保选集标题正确传递
3. `src/pages/VideoStudyPage.tsx` - 添加当前分集标题、练习模式、修复节拍器
4. `src/pages/PracticePage.tsx` - 修复节拍器 AudioContext 问题
5. `src/store/useAppStore.ts` - 可能需要添加当前视频/练习上下文状态

## 实施步骤

### 步骤 1: 修复节拍器 AudioContext 问题（高优先级）
- 修改 PracticePage.tsx 中的 toggleMetronome 函数
- 在用户点击时创建/恢复 AudioContext
- 同样修改 VideoStudyPage.tsx 中的节拍器
- 测试节拍器声音是否正常

### 步骤 2: 优化 B站 API 错误处理（中优先级）
- 修改 bilibili.ts 中的 fetchBiliEpisodes 函数
- 减少代理尝试次数，缩短超时
- 失败时静默返回 null，由上层处理
- 优先使用 customEpisodes

### 步骤 3: 视频学习页显示当前分集标题（低优先级）
- 在 VideoStudyPage 中添加 currentEpisode 计算
- 标题区域显示：主标题 + 分集标题（P几：标题）
- 切换分集时实时更新

### 步骤 4: 视频学习页添加练习模式（核心功能）
- 在 VideoStudyPage 中添加 practiceMode 状态
- 添加 "视频信息" / "开始练习" 切换按钮
- 练习模式下显示：计时器、节拍器、BPM 旋钮、重复次数、自评、卡点标签、备注
- 完成练习后跳转到 AI 反馈页
- 底部保留视频播放器

### 步骤 5: 全面检查和测试
- 检查所有页面的 AudioContext 使用
- 检查所有计时器清理
- 检查所有错误处理
- 构建并测试

## 风险和注意事项

1. **AudioContext 浏览器兼容性**: 不同浏览器前缀不同，已考虑 webkitAudioContext
2. **用户交互要求**: 音频必须在用户点击后才能播放，确保所有音频播放都由用户交互触发
3. **状态持久化**: 练习模式切换时保持 BPM、计时器等状态
4. **页面跳转清理**: 离开页面时确保计时器和节拍器都已停止
