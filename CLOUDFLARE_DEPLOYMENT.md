# Cloudflare Pages 部署指南

> 通用部署文档，适用于 React + Vite 前端项目的 Cloudflare Pages 部署，包含 Pages Functions 后端能力配置。

---

## 为什么选择 Cloudflare Pages

| 特性 | GitHub Pages | Cloudflare Pages |
|------|-------------|-----------------|
| 静态托管 | ✅ | ✅ |
| 自定义域名 | ✅ | ✅ |
| 服务端函数 | ❌ | ✅ Pages Functions |
| 数据库 | ❌ | ✅ D1（SQLite） |
| AI 推理 | ❌ | ✅ Workers AI |
| 免费带宽 | 100GB/月 | 无限 |
| 免费 Functions 调用 | - | 10万次/天 |
| 构建时长 | - | 500次/月免费 |

---

## 项目配置模板

### 1. 目录结构

```
your-project/
├── functions/               # Pages Functions（后端 API）
│   └── api/
│       └── example.ts       # /api/example 接口
├── public/
│   └── _redirects           # SPA 路由重定向（/*  /index.html  200）
├── src/                     # 前端源码
├── wrangler.toml            # Cloudflare 配置
├── vite.config.ts           # 支持环境变量配置 base 和 outDir
└── package.json             # 构建脚本
```

### 2. wrangler.toml 配置

```toml
name = "your-project-name"
compatibility_date = "2024-09-23"
pages_build_output_dir = "./dist"
```

**注意事项**：
- ❌ 不要加 `[site]` 节（Workers 项目才用）
- ❌ 不要加 `[build]` 节（Pages 不支持）
- ❌ `pages_build_output_dir` 不要放在 `[build]` 里面
- ✅ 放在顶层即可

### 3. vite.config.ts 配置

支持通过环境变量切换构建目标（GitHub Pages / Cloudflare Pages）：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const basePath = process.env.VITE_BASE || '/'
const outDir = process.env.VITE_OUT_DIR || 'dist'

export default defineConfig({
  base: basePath,
  plugins: [react()],
  build: {
    outDir,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 4. package.json 脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:cloudflare": "VITE_BASE=/ VITE_OUT_DIR=dist tsc && VITE_BASE=/ VITE_OUT_DIR=dist vite build",
    "pages:dev": "npx wrangler pages dev dist --compatibility-date=2024-09-23",
    "pages:deploy": "npm run build:cloudflare && npx wrangler pages deploy dist"
  }
}
```

### 5. SPA 路由重定向（_redirects）

在 `public/_redirects` 中添加：

```
/* /index.html 200
```

Vite 构建时会自动复制到输出目录。

### 6. Pages Functions 示例

`functions/api/feedback.ts`：

```typescript
interface Env {
  AI: any
  DB: any
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  try {
    const body = await request.json()

    // TODO: 替换为真实逻辑
    // const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', { ... })
    // await env.DB.prepare('INSERT INTO ...').bind(...).run()

    return Response.json({
      success: true,
      data: body,
    })
  } catch (error) {
    return Response.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}
```

---

## 部署方式

### 方式一：Git 集成自动部署（推荐）

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择 GitHub 仓库，授权访问
4. 配置构建设置：

| 配置项 | 值 |
|--------|-----|
| Project name | `your-project-name` |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npm run build:cloudflare` |
| Build output directory | `dist` |

5. **Save and Deploy**
6. 部署成功后访问 `https://your-project-name.pages.dev`

后续每次 `git push` 自动构建部署。

---

### 方式二：Wrangler CLI 直接部署

适用于 Git 集成不稳定、国内网络环境、或需要手动部署的场景。

#### 前置准备

**1. 创建 API Token**

- 进入 [My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- 点 **Create Token**
- 选择 **Edit Cloudflare Workers** 模板 → **Use template**
- 一路下一步，创建后复制 token（只显示一次，妥善保存）

**2. 获取 Account ID**

- Cloudflare 首页 → **Workers & Pages** → 右侧查看 **Account ID**

#### 部署命令

```bash
# 1. 构建
npm run build:cloudflare

# 2. 设置环境变量
export CLOUDFLARE_API_TOKEN=你的API_TOKEN
export CLOUDFLARE_ACCOUNT_ID=你的ACCOUNT_ID

# 3. 部署
npx wrangler pages deploy dist
```

---

## 国内网络环境特殊处理

### 问题：Wrangler CLI 连接失败

**现象**：`fetch failed` 或 `certificate mismatch` 警告，但 `curl` 能正常访问。

**原因**：
- 代理会拦截 HTTPS 流量并替换证书
- Node.js 有独立的证书链，不信任代理的自签名证书
- curl 使用系统证书，所以正常

**解决方案**：

```bash
# 1. 开启系统代理（确保能访问 Cloudflare）
# 2. 让 Node.js 跳过 TLS 证书验证
export NODE_TLS_REJECT_UNAUTHORIZED=0

# 3. 正常执行部署命令
export CLOUDFLARE_API_TOKEN=你的API_TOKEN
export CLOUDFLARE_ACCOUNT_ID=你的ACCOUNT_ID

npm run build:cloudflare
npx wrangler pages deploy dist
```

> ⚠️ 安全提示：`NODE_TLS_REJECT_UNAUTHORIZED=0` 会降低 TLS 安全性，仅在受信任的代理环境下使用。

### 为什么不用 OAuth 登录？

`wrangler login` 使用 OAuth 流程，需要浏览器回调到 localhost，在代理环境下容易失败。API Token 方式更直接稳定。

---

## 常见问题排查

### Q1：Git 集成显示断开连接 / 部署失败

**现象**：Deployments 页面红色警告，点 Details 报错。

**排查**：
1. **Settings → Builds & deployments → Git Repository → Manage**
2. 重新连接 GitHub 账户
3. 确认构建配置（Build command / output directory）正确
4. 如仍失败，改用 Wrangler CLI 直接部署（方式二）

### Q2：Wrangler OAuth 登录失败

**现象**：`npx wrangler login` 弹出浏览器但报 `fetch failed`。

**解决方案**：用 API Token 方式，参考"方式二"。

### Q3：Wrangler 报 fetch failed 但 curl 正常

**原因**：Node.js 证书链问题，参见"国内网络环境特殊处理"。

**解决**：`export NODE_TLS_REJECT_UNAUTHORIZED=0`

### Q4：wrangler.toml 配置验证失败

**错误信息**：
- `Configuration file for Pages projects does not support "build"`
- `missing "pages_build_output_dir" field`

**正确配置**：
```toml
name = "project-name"
compatibility_date = "2024-09-23"
pages_build_output_dir = "./dist"
```

**常见错误**：
- ❌ 使用 `[site]` 节
- ❌ 使用 `[build]` 节
- ❌ `pages_build_output_dir` 放在 `[build]` 内

### Q5：SPA 路由刷新后 404

**现象**：直接访问子路径返回 404。

**解决**：在 `public/_redirects` 添加 `/* /index.html 200`。

### Q6：构建失败 - npm ci 报错

**现象**：Cloudflare Pages 构建时执行 `npm ci` 失败，报 lockfile 不一致。

**原因**：改了 `package.json` 但没同步更新 `package-lock.json`。

**解决**：本地执行 `npm install` 重新生成 lockfile，提交后再部署。

---

## 后端能力扩展

### D1 数据库

在 `wrangler.toml` 中添加：

```toml
[[d1_databases]]
binding = "DB"
database_name = "your-db-name"
database_id = "你的数据库ID"
```

在 Function 中使用：

```typescript
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const result = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(1)
    .all()
  return Response.json(result)
}
```

### Workers AI

在 `wrangler.toml` 中添加：

```toml
[ai]
binding = "AI"
```

在 Function 中使用：

```typescript
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { prompt } = await request.json()
  const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt }
    ]
  })
  return Response.json(response)
}
```

### KV 存储

```toml
[[kv_namespaces]]
binding = "MY_KV"
id = "你的KV命名空间ID"
```

---

## 环境变量 / Secrets

在 Cloudflare 控制台设置：
- 项目 → **Settings** → **Environment variables**
- 可分别设置 Production 和 Preview 环境变量
- 敏感信息选择 **Encrypt** 加密存储

在 Function 中通过 `env.VAR_NAME` 访问。

---

## 自定义域名

1. 项目 → **Custom domains** → **Set up a custom domain**
2. 输入域名，点 **Continue**
3. 如果域名的 DNS 已在 Cloudflare，会自动配置
4. 如果不在 Cloudflare，按提示添加 CNAME 记录

---

## 参考链接

- [Cloudflare Pages 官方文档](https://developers.cloudflare.com/pages/)
- [Pages Functions 官方文档](https://developers.cloudflare.com/pages/functions/)
- [D1 Database 官方文档](https://developers.cloudflare.com/d1/)
- [Workers AI 官方文档](https://developers.cloudflare.com/workers-ai/)
- [Wrangler CLI 官方文档](https://developers.cloudflare.com/workers/wrangler/)
