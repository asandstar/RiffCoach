#!/usr/bin/env bash
set -euo pipefail

REPORT="riffcoach-health-report.md"

echo "# RiffCoach 项目体检报告" > "$REPORT"
echo "" >> "$REPORT"
echo "生成时间: $(date)" >> "$REPORT"
echo "" >> "$REPORT"

echo "## 1. 基础环境" >> "$REPORT"
{
  echo '```'
  echo "Node: $(node -v 2>/dev/null || echo '未安装')"
  echo "npm: $(npm -v 2>/dev/null || echo '未安装')"
  echo "当前目录: $(pwd)"
  echo '```'
} >> "$REPORT"

echo "" >> "$REPORT"
echo "## 2. 项目结构检查" >> "$REPORT"
{
  echo '```'
  find src -maxdepth 3 -type f 2>/dev/null | sort || echo "没有找到 src 目录"
  echo '```'
} >> "$REPORT"

echo "" >> "$REPORT"
echo "## 3. 关键文件是否存在" >> "$REPORT"
for f in \
  package.json \
  vite.config.ts \
  tsconfig.json \
  src/main.tsx \
  src/App.tsx \
  src/store/useAppStore.ts \
  src/types/index.ts \
  src/utils/aiMock.ts \
  src/utils/bilibili.ts \
  src/pages/TodayPage.tsx \
  src/pages/ResourcePage.tsx \
  src/pages/KnowledgePage.tsx \
  src/pages/VideoStudyPage.tsx \
  src/pages/PracticePage.tsx \
  src/pages/AIFeedbackPage.tsx
do
  if [ -f "$f" ]; then
    echo "- ✅ $f" >> "$REPORT"
  else
    echo "- ❌ $f 缺失" >> "$REPORT"
  fi
done

echo "" >> "$REPORT"
echo "## 4. 依赖安装检查" >> "$REPORT"
if [ ! -d "node_modules" ]; then
  echo "node_modules 不存在，开始 npm install..." | tee -a "$REPORT"
  npm install 2>&1 | tee -a "$REPORT"
else
  echo "node_modules 已存在。" >> "$REPORT"
fi

echo "" >> "$REPORT"
echo "## 5. TypeScript 类型检查" >> "$REPORT"
{
  echo '```'
  if npx tsc --noEmit; then
    echo "TypeScript 检查通过"
  else
    echo "TypeScript 检查失败"
  fi
  echo '```'
} >> "$REPORT" 2>&1 || true

echo "" >> "$REPORT"
echo "## 6. 构建检查" >> "$REPORT"
{
  echo '```'
  if npm run build; then
    echo "构建通过"
  else
    echo "构建失败"
  fi
  echo '```'
} >> "$REPORT" 2>&1 || true

echo "" >> "$REPORT"
echo "## 7. 常见代码风险扫描" >> "$REPORT"
{
  echo "### any / ts-ignore / console / TODO / alert / confirm"
  echo '```'
  grep -RInE "any|@ts-ignore|console\.|TODO|FIXME|alert\(|confirm\(" src || true
  echo '```'
} >> "$REPORT"

echo "" >> "$REPORT"
echo "## 8. localStorage / demoData / B站工具相关扫描" >> "$REPORT"
{
  echo '```'
  grep -RInE "localStorage|generateDemoData|fetchBiliEpisodes|bvid|page=|iframe|currentEfficientPlan|materialInbox|coverProjects" src || true
  echo '```'
} >> "$REPORT"

echo "" >> "$REPORT"
echo "## 9. 页面入口和核心组件扫描" >> "$REPORT"
{
  echo '```'
  grep -RInE "TodayPage|ResourcePage|KnowledgePage|VideoStudyPage|PracticePage|AIFeedbackPage|BottomNav|QuickAddMaterialSheet|VideoEpisodePicker" src || true
  echo '```'
} >> "$REPORT"

echo "" >> "$REPORT"
echo "## 10. 建议人工重点检查的问题" >> "$REPORT"
cat >> "$REPORT" <<'MARKDOWN'
请重点手动检查：

1. 资料页是否比以前更方便：能不能快速粘贴教程链接、加入素材篮、AI 整理成练习任务。
2. 知识库是否真的变成目录式查阅，而不是普通卡片列表。
3. 视频学习页是否能稳定切换 B站选集；接口失败时是否能手动输入 P 数。
4. 今日页是否能直接进入“高效练习计划”，而不是被 Hero 或其他模块干扰。
5. Cover 目标是否能和资料、练习任务、练习记录、周复盘串起来。
6. 练习完成后是否真的进入 AI 反馈页，并保存 session.aiFeedback。
7. 刷新页面后 localStorage 数据是否还在。
8. 断网时核心演示是否还能跑通。
9. 移动端底部导航是否遮挡按钮。
10. 构建产物 dist 是否能正常部署到 GitHub Pages。
MARKDOWN

echo ""
echo "✅ 体检完成：$REPORT"
echo "请把 $REPORT 的内容发给 TRAE，让它按报告修复。"
