const DEFAULT_ORIGIN = 'https://3312546026-cell.github.io';
const DEFAULT_MODEL = 'gemini-2.5-flash';
const SYSTEM_PROMPT = `你是“学习路线 AI 助手”，只围绕网站的学习路线、资源库、AI 工具和项目实践回答。回答要简洁、清楚、适合初学者；不知道时明确说不知道，不要编造链接。网站路线：下位机为 C 语言 → 电工与电子技术 → 烙铁焊接 → 51 单片机 → PCB 设计 → STM32；上位机为 Python + OpenCV → 计算机视觉实战 → YOLO → Java + Android Studio → Linux。`;

function getOrigin(request, env) {
  const requestOrigin = request.headers.get('Origin') || '';
  const allowedOrigin = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  if (requestOrigin === 'http://127.0.0.1:8765' || requestOrigin === 'http://localhost:8765') return requestOrigin;
  return requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin;
}

function response(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin'
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = getOrigin(request, env);
    if (request.method === 'OPTIONS') return response({}, 204, origin);
    if (request.method !== 'POST') return response({ error: 'Method Not Allowed' }, 405, origin);
    if (!env.GEMINI_API_KEY) return response({ error: 'GEMINI_API_KEY is not configured' }, 503, origin);

    try {
      const body = await request.json();
      const incoming = Array.isArray(body.messages) ? body.messages : [];
      const messages = incoming
        .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
        .slice(-10)
        .map((item) => ({ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: item.content.slice(0, 2000) }] }));
      if (!messages.length || messages[messages.length - 1].role !== 'user') return response({ error: 'A user message is required' }, 400, origin);

      const knowledge = typeof body.knowledge === 'string' ? body.knowledge.slice(0, 6000) : '';
      const model = env.GEMINI_MODEL || DEFAULT_MODEL;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\n本站实时知识库：\n${knowledge}` }] },
          contents: messages,
          generationConfig: { temperature: 0.55, maxOutputTokens: 800 }
        })
      });
      const data = await upstream.json();
      if (!upstream.ok) return response({ error: 'Upstream AI request failed' }, 502, origin);
      const reply = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
      if (!reply) return response({ error: 'The AI returned an empty response' }, 502, origin);
      return response({ reply }, 200, origin);
    } catch (error) {
      return response({ error: 'Invalid request' }, 400, origin);
    }
  }
};
