# RiffCoach · AI 高效练习教练

> 把喜欢的歌，拆成每天能练的任务。每天只有 20 分钟，也能离你的 cover 目标更近一步。

<p align="center">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=A%20modern%20music%20practice%20app%20interface%20with%20guitar%20elements%2C%20glassmorphism%20design%2C%20purple%20and%20mint%20color%20scheme%2C%20showing%20practice%20timer%20and%20BPM%20knob%2C%20clean%20UI%20design&image_size=landscape_16_9" alt="RiffCoach" width="800" />
</p>

## 🏆 项目简介

RiffCoach 是一款面向业余吉他学习者的 **AI 高效练习教练**。通过 AI 驱动的练习计划生成、Cover 目标管理、资料中心、视频学习、知识库和周复盘，帮助用户系统化地追踪练习进度，克服自学瓶颈。

**核心价值：**

| 维度 | 说明 |
|------|------|
| 🎯 **目标导向** | 从喜欢的歌出发，拆成可追踪的段落进度 |
| ⏱️ **时间高效** | 每天 20 分钟也能产生有效练习成果 |
| 🤖 **智能计划** | AI 根据时间、状态、卡点生成最小有效练习计划 |
| 📊 **数据驱动** | 记录 BPM、自评、卡点，量化进步过程 |

## ✨ 核心功能

### 🤖 AI 高效练习计划
根据今日可用时间、精力状态、Cover 目标和最近卡点，智能生成最小有效练习计划。支持少于 15 分钟专项练习、20-30 分钟完整练习、超过 40 分钟深度训练等多种模式。

### 🎸 Cover 目标管理
把喜欢的歌拆成可追踪的段落进度，记录每个段落的练习数据（进度百分比、Target BPM、Clean BPM、卡点标签）。AI 自动分析并生成练习路径。

### 📚 资料中心
视频教程、素材篮、已整理练习一站式管理。四大标签页：最近使用、素材篮、视频教程（B站视频聚合）、已整理练习。支持粘贴 B站/YouTube 链接自动解析。

### 🎬 视频学习页
深度集成 B站视频，提供沉浸式学习体验。核心功能：B站播放器嵌入、AI 摘要、关键技能标签、选集切换（支持自动获取和手动输入）、建议练习方式、**练习模式（保留视频+完整练习工具）**。

### 📖 目录式知识库
专业的乐器知识体系，支持多乐器分类浏览（电吉他、木吉他、尤克里里）。左侧可折叠导航栏，导航状态记忆到 localStorage。

### ⏱️ 练习工具
完整的练习辅助工具面板：计时器（播放/暂停、前进/后退、时间点选择）、节拍器（Web Audio API）、BPM 旋钮（270° 旋转）、自评（1-5星）、卡点标签、备注。

### 🤖 AI 练后反馈
练习完成后 AI 智能分析，给出今日总结、尝试 BPM、最高干净 BPM、下次练习计划、Cover 进度更新。

### 📅 周复盘
每周练习数据汇总分析：总练习分钟、练习天数、平均 BPM、Cover 进度变化、反复卡点分析。

## 🎸 支持乐器

| 乐器 | 主题色 | 特色功能 |
|------|--------|----------|
| ⚡ 电吉他 | 琥珀色 | 推弦、揉弦等电吉他专属技巧 |
| 🎸 木吉他 | 薄荷绿 | 大横按、开放式和弦等木吉他技巧 |
| 🌺 尤克里里 | 薰衣草 | 小四和弦、夏威夷风格练习 |

## 🚀 快速开始

### 在线体验
- **主应用**: https://asandstar.github.io/RiffCoach/
- **创意展示**: https://asandstar.github.io/RiffCoach/riff-coach-showcase.html

### 本地开发
```bash
git clone https://github.com/asandstar/RiffCoach.git
cd RiffCoach
npm install
npm run dev
npm run build
npm run preview
```

### 部署说明
项目使用 **GitHub Pages** 部署，构建产物输出到 `docs/` 目录。在 GitHub 仓库设置中配置 Pages 从 `main` 分支的 `/docs` 目录部署。

## 🛠️ 技术架构

### 技术栈

| 分类 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Vite | 5.x | 极速开发服务器 |
| UI | React | 18.x | 函数组件 + Hooks |
| 语言 | TypeScript | 5.x | 类型安全开发 |
| 状态管理 | Zustand | 4.x | 轻量级状态管理 |
| 持久化 | LocalStorage | - | 本地数据持久化 |
| 样式 | Tailwind CSS | 3.x | 原子化 CSS，玻璃拟态设计 |
| 音频 | Web Audio API | - | OscillatorNode 生成节拍器声音 |
| 图标 | Lucide React | 0.x | SVG 图标库 |
| B站集成 | Bilibili API | - | BVID 解析、选集获取 |

### 设计系统
- **色彩**: 主色浅紫色系（#B89CD4），辅色薄荷绿、琥珀色、薰衣草
- **背景**: 淡紫色基调（#F0EEF5），玻璃拟态效果
- **字体**: Nunito（主字体）、JetBrains Mono（等宽字体）

## 📁 项目结构

```
RiffCoach/
├── src/
│   ├── components/          # UI 组件
│   │   ├── GlassCard.tsx    # 玻璃拟态卡片
│   │   ├── BpmKnob.tsx      # BPM 旋转旋钮
│   │   ├── VideoPlayerCard.tsx        # 视频播放器卡片
│   │   └── QuickAddMaterialSheet.tsx  # 快速添加资料弹窗
│   ├── pages/               # 页面组件（9个核心页面）
│   │   ├── TodayPage.tsx    # 今日页
│   │   ├── CoverPage.tsx    # Cover 目标管理
│   │   ├── ResourcePage.tsx # 资料中心
│   │   ├── VideoStudyPage.tsx # 视频学习页（练习模式）
│   │   ├── KnowledgePage.tsx # 知识库
│   │   ├── PracticePage.tsx # 练习页
│   │   ├── AIFeedbackPage.tsx # AI 反馈
│   │   ├── ReviewPage.tsx   # 周复盘
│   │   └── MePage.tsx       # 我的页（概览/日历/数据）
│   ├── store/useAppStore.ts # Zustand 状态管理
│   ├── data/defaultData.ts  # 默认数据
│   ├── utils/               # 工具函数
│   │   ├── bilibili.ts      # B站工具
│   │   ├── date.ts          # 日期工具
│   │   └── aiMock.ts        # AI Mock 逻辑
│   └── types/index.ts       # TypeScript 类型定义
├── riff-coach-showcase.html # 创意展示页
├── docs/                    # 构建产物（GitHub Pages）
├── vite.config.ts           # Vite 配置
├── tailwind.config.js       # Tailwind 配置
└── tsconfig.json            # TypeScript 配置
```

## 🔄 数据管理

- **持久化**: 所有数据存储在浏览器 LocalStorage（键名：`riffcoach_data_v2`）
- **导入导出**: 一键导出/导入 JSON 文件，支持自动数据迁移和格式校验

## 📋 功能路线图

| 状态 | 功能 |
|------|------|
| ✓ | AI 高效练习计划 |
| ✓ | Cover 目标管理 |
| ✓ | 资料中心 + 视频学习页（含练习模式） |
| ✓ | 目录式知识库 |
| ✓ | BPM 旋转旋钮 + 节拍器 + 计时器 |
| ✓ | AI 练后反馈 + 周复盘 |
| ⏳ | 练习录音、波形可视化 |
| ⏳ | 真实 AI API 接入 |
| ⏳ | PWA 支持（离线使用） |

## 📄 License

MIT License

## 📧 联系方式

欢迎提交 Issue 和 Pull Request！如有问题或建议，欢迎交流。

**⭐ 如果这个项目对你有帮助，请给个 Star！**
