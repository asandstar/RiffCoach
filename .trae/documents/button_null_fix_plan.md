# 按钮点击无响应修复计划

## 问题摘要

用户点击"30分钟"按钮和"生成今日计划"按钮均无反应。控制台报错：
```
TypeError: Cannot read properties of null (reading 'addEventListener')
    at index.html:5059
```

## 根因分析

在叙事重构中，导入导出功能从今日页移到了"我的"页，HTML 元素 ID 已更新为 `btn-profile-export` / `btn-profile-import` / `profile-import-file`。

但 DOMContentLoaded 事件绑定代码中仍使用旧的 ID（`btn-export` / `btn-import` / `import-file`），导致：
1. `getElementById('btn-export')` 返回 null
2. `null.addEventListener(...)` 抛出 TypeError
3. 异常在 DOMContentLoaded 回调中未被捕获，打断整个初始化流程
4. 后续所有按钮事件绑定（包括 `btn-generate-plan`）均未执行

## 具体修复

### 文件：`index.html`（第 5059-5064 行）

将旧的事件绑定代码从：
```javascript
document.getElementById('btn-export').addEventListener('click', exportData);
document.getElementById('btn-import').addEventListener('click', () => {
    document.getElementById('import-file').click();
});
document.getElementById('import-file').addEventListener('change', (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = '';
});
```

改为新的 ID：
```javascript
document.getElementById('btn-profile-export').addEventListener('click', exportData);
document.getElementById('btn-profile-import').addEventListener('click', () => {
    document.getElementById('profile-import-file').click();
});
document.getElementById('profile-import-file').addEventListener('change', (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = '';
});
```

## 验证步骤

1. 启动本地服务器
2. 打开页面，确认控制台无 `Cannot read properties of null` 错误
3. 点击"30分钟"按钮，确认选中态切换正常
4. 点击"生成今日计划"，确认计划卡片显示
5. 完整走一遍演示路径
6. 提交到 GitHub
