import { Router } from 'express';
import axios from 'axios';
import { buildSystemPrompt } from '../services/chatbot.js';
import { getCorpusStats } from '../services/rag.js';

const router = Router();
const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'moonshotai/kimi-k2.6';

// GET /api/chatbot/health — debug endpoint to inspect RAG corpus
router.get('/health', (_req, res) => {
  res.json({ ok: true, rag: getCorpusStats() });
});

router.post('/', async (req, res) => {
  const { messages, lat, lng, role } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  if (!process.env.NVIDIA_API_KEY) {
    return res.status(503).json({ error: 'AI chatbot not configured. Add NVIDIA_API_KEY to backend .env.' });
  }

  // Extract the latest user query for RAG retrieval
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
  const systemPrompt = buildSystemPrompt(lastUserMsg, lat, lng, role || 'citizen');

  // SSE response headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.flushHeaders();

  const emit = (obj) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
    // Force flush on every chunk so the browser sees them immediately
    if (res.flush) res.flush();
  };

  let nvidiaStream;
  try {
    const response = await axios.post(
      NVIDIA_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 8192,
        temperature: 0.7,
        top_p: 0.9,
        stream: true,
        chat_template_kwargs: { thinking: true },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          Accept: 'text/event-stream',
        },
        responseType: 'stream',
        timeout: 120_000,
      }
    );

    nvidiaStream = response.data;
    let buffer = '';

    nvidiaStream.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') {
          emit({ type: 'done' });
          continue;
        }

        let parsed;
        try { parsed = JSON.parse(payload); } catch { continue; }

        const delta = parsed?.choices?.[0]?.delta;
        if (!delta) continue;

        // Kimi K2.6: thinking is in reasoning_content, response is in content
        if (delta.reasoning_content) emit({ type: 'thinking', content: delta.reasoning_content });
        if (delta.content)           emit({ type: 'content',  content: delta.content });
      }
    });

    nvidiaStream.on('end', () => {
      emit({ type: 'done' });
      res.end();
    });

    nvidiaStream.on('error', (err) => {
      console.error('[chatbot] NVIDIA stream error:', err.message);
      emit({ type: 'error', content: 'Stream interrupted. Please try again.' });
      res.end();
    });

    req.on('close', () => nvidiaStream?.destroy());

  } catch (err) {
    const detail = err.response?.data?.detail || err.response?.data?.message || err.message;
    console.error('[chatbot] Error:', detail);
    if (!res.headersSent) {
      res.status(502).json({ error: detail || 'AI service unavailable.' });
    } else {
      emit({ type: 'error', content: detail || 'AI service unavailable.' });
      res.end();
    }
  }
});

export default router;
