# 冗余 HTML 文件清理计划

## 一、项目调研结论

### 当前项目状态
- 项目是 **React 18 + TypeScript + Vite** 的现代前端应用
- 主入口文件：`index.html`（Vite 项目标准入口）
- 所有页面组件都在 `src/pages/` 目录下（TSX 文件）
- 构建输出目录：`docs/`

### 发现的冗余 HTML 文件
这些文件都是**早期静态原型/设计稿**，与当前 React 应用功能重复且容易造成混淆：

| 文件 | 类型 | 是否冗余 | 原因 |
|------|------|----------|------|
| `index.html` | 入口 | ❌ 保留 | Vite 项目主入口，必须保留 |
| `riff-coach-showcase.html` | 展示页 | ⚠️ 待确认 | 项目展示页，build 脚本会复制到 docs |
| `creative-product.html` | 设计稿 | ✅ 可删除 | 创意产品设计稿，与功能无关 |
| `technical-docs.html` | 技术文档 | ✅ 可删除 | 技术文档设计稿，与功能无关 |
| `pages/dashboard.html` | 原型 | ✅ 可删除 | 早期静态原型，功能已在 React 中实现 |
| `pages/dashboard-empty.html` | 原型 | ✅ 可删除 | 空状态原型 |
| `pages/source-library.html` | 原型 | ✅ 可删除 | 资料库原型 |
| `pages/source-library-empty.html` | 原型 | ✅ 可删除 | 资料库空状态原型 |
| `pages/practice-session.html` | 原型 | ✅ 可删除 | 练习页原型 |
| `pages/weekly-review.html` | 原型 | ✅ 可删除 | 周回顾原型 |
| `pages/weekly-review-empty.html` | 原型 | ✅ 可删除 | 周回顾空状态原型 |
| `partials/project-shell.html` | 原型片段 | ✅ 可删除 | 原型外壳片段 |
| `docs/` 目录 | 构建输出 | ❌ 保留 | GitHub Pages 部署目录 |

### 引用检查结果
- `src/` 目录下的 React 代码**没有引用**任何这些静态 HTML 文件
- 只有 `riff-coach-showcase.html` 在 `package.json` 的 build 脚本中被复制到 docs

## 二、清理方案

### 2.1 明确删除的文件（10个）
1. `creative-product.html`
2. `technical-docs.html`
3. `pages/dashboard.html`
4. `pages/dashboard-empty.html`
5. `pages/source-library.html`
6. `pages/source-library-empty.html`
7. `pages/practice-session.html`
8. `pages/weekly-review.html`
9. `pages/weekly-review-empty.html`
10. `partials/project-shell.html`

### 2.2 待确认的文件
- `riff-coach-showcase.html` - 展示页面，build 脚本会复制到 docs 用于 GitHub Pages
  - 建议保留（作为项目展示入口）

### 2.3 空目录处理
- 删除 `pages/` 和 `partials/` 目录（删除所有文件后为空目录）

## 三、实施步骤

### 步骤1：备份确认
- 确认 Git 仓库有最新提交，可以回滚

### 步骤2：删除冗余文件
- 删除上述 10 个 HTML 文件
- 删除空的 `pages/` 和 `partials/` 目录

### 步骤3：验证项目可用性
- 运行 `npm run dev` 检查开发服务器是否正常启动
- 运行 `npm run build` 检查构建是否成功
- 检查 `docs/` 目录输出是否正常

### 步骤4：验证关键文件
- 确认 `index.html` 存在且内容正确
- 确认 `src/main.tsx` 存在
- 确认 `vite.config.ts` 配置正确
- 确认 `package.json` 脚本正确

## 四、风险处理

1. **误删风险**：所有删除操作可以通过 Git 回滚
2. **构建失败**：如果删除导致构建失败，立即回滚并分析原因
3. **意外依赖**：虽然检查了 src/ 没有引用，但可能有其他隐藏依赖，构建验证会发现

## 五、完成标准

1. ✅ 10个冗余 HTML 文件已删除
2. ✅ `pages/` 和 `partials/` 空目录已删除
3. ✅ `npm run dev` 正常启动
4. ✅ `npm run build` 构建成功
5. ✅ 关键文件（index.html, src/main.tsx, vite.config.ts）完整
6. ✅ React 应用所有功能正常可用