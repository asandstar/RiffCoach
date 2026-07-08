# 知识库优化实施计划

## 一、项目现状分析

### 当前知识库结构
- **文章数量**：25 篇（电吉他 12 篇、木吉他 6 篇、尤克里里 5 篇、通用 2 篇）
- **分类体系**：入门(basics)、基本功(practice)、技巧(technique)、乐理(theory)
- **文章结构**：标题、摘要、标签、难度、关联技能、常见错误、练习建议、详细内容

### 存在的问题
1. **内容不足**：文章数量偏少，缺少进阶乐理、设备知识、演奏心理学等深度内容
2. **缺少资料来源**：没有记录内容的出处和参考文献，用户无法追溯源头
3. **发现困难**：没有搜索功能，用户需要逐个浏览才能找到所需内容
4. **个性化不足**：没有收藏、已读标记、阅读进度等功能
5. **关联性弱**：没有相关推荐，知识点之间缺乏有机连接

---

## 二、优化目标

### P0 - 高优先级（核心体验）
1. **添加搜索功能**：支持标题、摘要、标签的模糊搜索，实时显示匹配结果
2. **添加收藏和已读标记**：记录用户的学习进度和偏好
3. **扩充知识库内容**：增加 30+ 篇高质量文章，涵盖更多主题
4. **添加资料来源字段**：每篇文章标注参考来源，提升可信度

### P1 - 中优先级（增强体验）
5. **相关内容推荐**：在详情页底部推荐相关知识点和视频
6. **学习路径推荐**：根据用户水平和乐器推荐循序渐进的学习路线
7. **阅读时间估算**：显示文章预计阅读时间

### P2 - 低优先级（锦上添花）
8. **标签云可视化**：展示所有标签，点击筛选
9. **目录大纲**：长文章显示章节目录，点击跳转

---

## 三、实施步骤

### 第一阶段：类型定义和状态管理

#### 1.1 修改类型定义 (`src/types/index.ts`)
- 为 `KnowledgeBaseItem` 接口添加新字段：
  - `sources: { type: string; title: string; author?: string; url?: string }[]` - 资料来源
  - `readingTime: number` - 预计阅读时间（分钟）
  - `relatedKnowledgeIds: string[]` - 关联知识文章
  - `relatedVideoIds: string[]` - 关联视频资源

#### 1.2 扩展状态管理 (`src/store/useAppStore.ts`)
- 在 `knowledgeBase` 中添加：
  - `favorites: string[]` - 已收藏的文章ID
  - `readHistory: { id: string; readAt: number; progress: number }[]` - 阅读历史
- 添加操作方法：
  - `toggleKnowledgeFavorite(id)` - 收藏/取消收藏
  - `markKnowledgeRead(id)` - 标记已读
  - `updateReadingProgress(id, progress)` - 更新阅读进度

---

### 第二阶段：内容扩充

#### 2.1 扩充知识库文章 (`src/data/defaultData.ts`)
新增 **30 篇高质量文章**，分类如下：

**电吉他新增（12 篇）**：
| 标题 | 分类 | 难度 | 来源 |
|------|------|------|------|
| 经济拨弦基础 | practice | 2 | Tom Quayle 教程 |
| 扫拨技巧入门 | technique | 3 | Troy Grady 系列 |
| 点弦技巧详解 | technique | 4 | Eddie Van Halen 示范 |
| 琶音与音阶跑动 | practice | 3 | Frank Gambale 教学 |
| 双手协调训练 | practice | 2 | JustinGuitar |
| 音色调节指南 | basics | 2 | Guitar Rig 手册 |
| 失真效果器深度解析 | basics | 2 | Boss DS-1 说明书 |
| 延迟与混响使用 | technique | 2 | TC Electronic 指南 |
| 摇滚 Solo 构造 | technique | 3 | Guthrie Govan |
| 布鲁斯 Solo 风格 | technique | 3 | B.B. King 示范 |
| 节拍器训练法 | practice | 2 | 节拍器训练理论 |
| 视奏能力培养 | practice | 4 | Berklee 方法 |

**木吉他新增（10 篇）**：
| 标题 | 分类 | 难度 | 来源 |
|------|------|------|------|
| Travis 指弹风格 | technique | 4 | Tommy Emmanuel |
| 泛音演奏技巧 | technique | 3 | 押尾コータロー |
| 打板与敲击技巧 | technique | 3 | percussive guitar |
| 滑音与勾弦技巧 | technique | 2 | 古典吉他教材 |
| 琴颈调整与维护 | basics | 2 | Taylor 吉他指南 |
| 木吉他选购指南 | basics | 1 | Martin 选琴手册 |
| 拾音器与放大器 | basics | 2 | L.R. Baggs 指南 |
| 指弹曲目分析 | technique | 3 | Wind Song 解析 |
| 节奏型变化技巧 | practice | 2 | 节奏训练教材 |
| 特殊调弦曲目库 | practice | 3 | Open Tuning 指南 |

**尤克里里新增（6 篇）**：
| 标题 | 分类 | 难度 | 来源 |
|------|------|------|------|
| 夏威夷风格演奏 | technique | 3 | Hawaiian Ukulele |
| 高级切音技巧 | technique | 2 | Jake Shimabukuro |
| 指弹曲目进阶 | technique | 3 | 押尾 Ukulele |
| 四弦乐理应用 | theory | 2 | Ukulele Theory |
| 节奏型大全 | practice | 2 | Ukulele Rhythm |
| 尺寸与木材选择 | basics | 1 | Kamaka 选琴 |

**乐理新增（8 篇）**：
| 标题 | 分类 | 难度 | 来源 |
|------|------|------|------|
| 调式音阶详解 | theory | 3 | Music Theory.net |
| 和声学基础 | theory | 3 | Berklee 和声教材 |
| 音程与和弦构成 | theory | 2 | 乐理入门书籍 |
| 节拍与节奏型 | theory | 2 | 节奏训练理论 |
| 指板逻辑 | theory | 3 | Fretboard Logic |
| 转调技巧 | theory | 4 | Music Theory.net |
| 布鲁斯音阶 | theory | 2 | Blues Theory |
| 爵士乐理入门 | theory | 4 | Jazz Theory |

**演奏心理学（4 篇）**：
| 标题 | 分类 | 难度 | 来源 |
|------|------|------|------|
| 练习心态培养 | basics | 1 | The Practice Mind |
| 克服舞台恐惧 | basics | 2 | Performance Anxiety |
| 演奏专注力训练 | practice | 2 | Music Psychology |
| 目标设定与反馈 | practice | 1 | Deliberate Practice |

#### 2.2 为所有文章添加资料来源
- 每篇文章添加 `sources` 字段，标注参考来源：
  - 经典教材（如 JustinGuitar、Berklee、小林信一等）
  - 专业网站（如 Guitar World、Music Theory.net）
  - 社区教程（如 B站优质UP主教程）
  - 乐器厂商手册（如 Boss、Fender）

---

### 第三阶段：UI 功能开发

#### 3.1 搜索功能 (`src/pages/KnowledgePage.tsx`)
- 在顶部添加搜索输入框
- 实现模糊搜索逻辑（匹配标题、摘要、标签）
- 搜索结果实时显示，匹配关键词高亮
- 搜索历史记录

#### 3.2 收藏和已读标记
- 在文章卡片右上角添加收藏按钮（星标）
- 已读文章显示灰色标记和阅读时间
- 收藏列表页面或筛选功能

#### 3.3 相关内容推荐
- 在详情页底部添加：
  - "相关知识点" 卡片（基于 `relatedKnowledgeIds`）
  - "推荐视频教程" 卡片（基于 `relatedVideoIds`）
- 点击跳转到对应内容

#### 3.4 学习路径推荐
- 在知识库首页添加 "推荐学习路径" 区域
- 根据用户乐器和水平动态推荐
- 显示路径进度（已完成/未完成）

#### 3.5 UI 优化细节
- 搜索框样式：毛玻璃效果、图标、placeholder
- 收藏按钮：悬停动画、点击反馈
- 已读标记：半透明灰色覆盖、时间显示
- 相关推荐卡片：横向滚动布局

---

## 四、涉及文件清单

| 文件 | 修改内容 |
|------|----------|
| `src/types/index.ts` | 扩展 KnowledgeBaseItem 接口，添加 sources、readingTime、relatedIds 字段 |
| `src/store/useAppStore.ts` | 添加收藏、阅读历史状态和方法 |
| `src/data/defaultData.ts` | 扩充 30+ 篇文章，为所有文章添加资料来源 |
| `src/pages/KnowledgePage.tsx` | 添加搜索、收藏、已读、相关推荐功能 |
| `src/utils/knowledgeSearch.ts` | 新建搜索工具函数 |

---

## 五、风险与应对

### 风险 1：内容扩充工作量较大
- **应对**：分批次添加，先完成核心文章（电吉他进阶、乐理），再补充其他

### 风险 2：搜索性能问题
- **应对**：使用前端缓存，搜索结果限制显示数量（最多 20 条）

### 风险 3：资料来源版权问题
- **应对**：只标注来源信息，不直接复制原文内容，知识库内容均为原创整理

---

## 六、验收标准

1. 搜索功能：输入关键词能实时显示匹配结果
2. 收藏功能：点击收藏按钮能收藏/取消，收藏列表正确显示
3. 已读标记：阅读过的文章显示标记和阅读时间
4. 相关推荐：详情页底部显示相关知识点和视频
5. 内容扩充：知识库文章总数达到 55+ 篇
6. 资料来源：每篇文章都有 sources 字段，显示参考来源