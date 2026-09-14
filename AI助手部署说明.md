# 学习路线 AI 助手

当前网页已切换为纯在线 AI 模式，使用 Puter.js 的在线 `puter.ai.chat()`，不调用本机模型，也不把 API Key 写入网页。

## 使用方式

打开网站后，点击右下角“问问 AI 助手”。首次使用时，Puter 可能要求用户登录或授权；具体免费额度、模型和限额以 Puter 当前平台规则为准。

网页依赖：

```html
<script src="https://js.puter.com/v2/"></script>
```

在线调用：

```js
const result = await puter.ai.chat(messages, {
  normalize: true,
  temperature: 0.45,
  max_tokens: 800
});
```

如果 Puter 在线 SDK 不可用，页面只提示在线服务暂不可用，不会退回本机模型或本地知识库。
