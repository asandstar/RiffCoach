# RiffCoach · AI 高效练习教练

> 把喜欢的歌，拆成每天能练的任务。每天只有 20 分钟，也能离你的 cover 目标更近一步。

![RiffCoach](https://asandstar.github.io/RiffCoach/riff-coach-showcase.html)

## 🏆 项目简介

RiffCoach 是一款面向业余吉他学习者的 **AI 高效练习教练**。通过 AI 驱动的练习计划生成、Cover 目标管理、资料中心、视频学习、知识库和周复盘，帮助用户系统化地追踪练习进度，克服自学瓶颈。

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| ✨ **AI 高效练习计划** | 根据可用时间、精力状态、Cover 目标和最近卡点，生成最小有效练习计划 |
| 🎸 **Cover 目标管理** | 把喜欢的歌拆成可追踪的段落进度，记录 target BPM、干净 BPM、卡点 |
| 📚 **资料中心** | 视频教程、素材篮、已整理练习一站式管理，AI 自动整理成练习任务 |
| 🎬 **视频学习页** | B站嵌入 + AI 摘要 + 关键技能 + 选集切换（自动获取失败可手动输入） |
| 📖 **目录式知识库** | 电吉他/木吉他/尤克里里分类知识，桌面端左侧目录+右侧内容 |
| 🤖 **AI 练后反馈** | 根据 BPM、自评、卡点和练习时长，给出今日总结和下次计划 |
| 📅 **周复盘** | 本周练习统计、Cover 进度变化、反复卡点分析、AI 下周建议 |
| ⏱️ **练习工具** | 计时器 + 节拍器 + BPM 调节 + 自评 + 卡点标签 + 备注 |
| 💾 **数据备份** | 一键导出/导入 JSON，本地存储零依赖，支持旧数据迁移 |

## 🎸 支持乐器

- ⚡ **电吉他** — 专属琥珀色调主题
- 🎸 **木吉他** — 专属薄荷色调主题  
- 🌺 **尤克里里** — 专属薰衣草色调主题

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/asandstar/RiffCoach.git
cd RiffCoach

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

**在线体验**: https://asandstar.github.io/RiffCoach/

**创意介绍**: https://asandstar.github.io/RiffCoach/riff-coach-showcase.html

## 🛠️ 技术架构

- **框架**: Vite + React + TypeScript
- **状态管理**: Zustand + LocalStorage 持久化
- **样式**: Tailwind CSS 3 + Glassmorphism 设计系统
- **音频**: Web Audio API (OscillatorNode)
- **图标**: Lucide React
- **B站集成**: BVID 解析、播放器 URL、选集获取（多代理兜底）

## 📁 项目结构

```
RiffCoach/
├── src/
│   ├── components/          # UI 组件
│   │   ├── GlassCard.tsx    # 玻璃拟态卡片
│   │   ├── BottomNav.tsx    # 底部导航
│   │   ├── PageShell.tsx    # 页面壳组件
│   │   ├── QuickAddMaterialSheet.tsx  # 快速添加资料弹窗
│   │   └── VideoEpisodePicker.tsx     # 视频选集选择器
│   ├── pages/               # 页面组件
│   │   ├── TodayPage.tsx    # 今日页（AI 高效练习计划）
│   │   ├── CoverPage.tsx    # Cover 目标管理
│   │   ├── ResourcePage.tsx # 资料中心
│   │   ├── VideoStudyPage.tsx # 视频学习页
│   │   ├── KnowledgePage.tsx # 目录式知识库
│   │   ├── PracticePage.tsx # 练习页
│   │   ├── AIFeedbackPage.tsx # AI 练后反馈
│   │   ├── ReviewPage.tsx   # 周复盘
│   │   └── MePage.tsx       # 我的页
│   ├── store/
│   │   └── useAppStore.ts   # Zustand 状态管理
│   ├── data/
│   │   ├── defaultData.ts   # 默认数据（乐器、知识库、视频资源）
│   │   └── demoData.ts      # 演示数据生成器
│   ├── utils/
│   │   ├── bilibili.ts      # B站工具函数
│   │   ├── date.ts          # 日期工具
│   │   └── aiMock.ts        # AI Mock 逻辑
│   ├── types/
│   │   └── index.ts         # TypeScript 类型定义
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── riff-coach-showcase.html # 创意展示页（Vite + React 重构版详解）
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── tsconfig.json
```

## 📋 功能路线图

- [✓] AI 高效练习计划
- [✓] Cover 目标管理 + 段落进度追踪
- [✓] 资料中心 + 素材篮 + AI 整理
- [✓] 视频学习页 + 选集切换 + AI 摘要
- [✓] 目录式知识库 + 练习工具
- [✓] AI 练后反馈 + 周复盘
- [ ] 真实 AI API 接入
- [ ] 练习数据分析 + 可视化趋势
- [ ] PWA 离线支持 + 移动端优化

## 📄 License

MIT License

## 📧 联系方式

欢迎提交 Issue 和 Pull Request！
