# 学习路线 AI 助手部署说明

网页已经内置“学习路线 AI 助手”，默认使用本地知识库回答，不配置密钥也能正常使用。

## 接入在线免费文本 AI

本项目提供 `ai-worker.js`，用于部署到 Cloudflare Workers，并通过 Gemini API 转发请求。不要把 Gemini 密钥写进 `index.html`。

1. 在 Google AI Studio 创建 Gemini API Key。
2. 安装并登录 Wrangler：

```bash
npm install -g wrangler
wrangler login
```

3. 在当前目录部署 Worker：

```bash
wrangler deploy ai-worker.js --name learning-path-ai
wrangler secret put GEMINI_API_KEY --name learning-path-ai
```

4. 将 `ai-config.js` 中的地址改成 Worker 地址：

```js
window.AI_ASSISTANT_ENDPOINT = 'https://learning-path-ai.<你的账号>.workers.dev';
```

5. 提交 `ai-config.js` 和网页文件，重新打开网站即可。

`GEMINI_MODEL` 可在 Worker 环境变量中覆盖，默认值为 `gemini-2.5-flash`。免费额度和速率限制以服务商当前规则为准。
