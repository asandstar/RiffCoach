# RiffCoach · 弦乐练习指南针

> 让每一次按弦都有方向，让每一分钟练习都有痕迹。

![RiffCoach](https://asandstar.github.io/RiffCoach/about.html)

## 🏆 项目简介

RiffCoach 是一款专为自学弦乐器（吉他、Ukulele）爱好者设计的练习追踪工具。通过集成 B站视频教程、练习计时器、节拍器、练琴日历和知识库，帮助用户系统化地追踪练习进度，克服自学瓶颈。

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| 🎬 **B站视频集成** | 粘贴链接自动解析 BV 号，支持选集切换，内嵌播放器边看边练 |
| ⏱️ **练习计时器** | 设定目标时长，开始/暂停/重置，完成后自动记录历史 |
| 🎵 **内置节拍器** | Web Audio API 驱动，BPM 可调，与计时器同步 |
| 📅 **练琴日历** | 月视图展示每日练习时长，连续打卡激励持续练习 |
| 📚 **知识库** | 24 条乐理知识 + 13 个 B站视频教程，分类筛选 |
| 💾 **数据备份** | 一键导出/导入 JSON，深合并迁移确保数据安全 |

## 🎸 支持乐器

- ⚡ **电吉他** — 专属琥珀色调主题
- 🎸 **木吉他** — 专属薄荷色调主题  
- 🌺 **Ukulele** — 专属薰衣草色调主题

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/asandstar/RiffCoach.git
cd RiffCoach

# 直接打开即可使用（无需安装依赖）
open index.html
```

**在线体验**: https://asandstar.github.io/RiffCoach/

**创意介绍**: https://asandstar.github.io/RiffCoach/about.html

## 🛠️ 技术架构

- **SPA 架构**: 客户端路由 `navigateTo()`，无后端依赖
- **存储**: LocalStorage + 深合并数据迁移
- **音频**: Web Audio API (OscillatorNode)
- **UI**: Glassmorphism 设计系统 + Tailwind CDN + Lucide Icons
- **CORS**: 多代理轮换 (corsproxy.io → allorigins.win → codetabs.com)

## 📁 项目结构

```
RiffCoach/
├── index.html          # 主应用（单页应用）
├── about.html          # 创意介绍页
├── DEV_HANDOFF.md      # 开发交接文档
├── colors_and_type.css # 设计系统样式
├── pages/              # 页面原型参考
├── partials/           # 组件片段
└── .trae/documents/    # 开发计划文档
```

## 📋 开发计划

- [✓] B站视频集成 + 选集切换
- [✓] 练琴日历 + 数据备份
- [✓] 内置知识库 + 节拍器
- [ ] 外部免费乐理 API 接入
- [ ] 练习数据分析 + 可视化趋势
- [ ] PWA 离线支持 + 移动端适配

## 📄 License

MIT License

## 📧 联系方式

欢迎提交 Issue 和 Pull Request！
