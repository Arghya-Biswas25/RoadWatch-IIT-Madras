import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, WifiOff, ChevronDown, ChevronUp, Brain, Sparkles, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/app';
import { useAuthStore } from '../store/auth';
import type { ChatMessage } from '../types';

// Call backend DIRECTLY to avoid Vite proxy buffering SSE streams
const BACKEND = import.meta.env.DEV ? 'http://localhost:3001' : '';

const SUGGESTIONS = [
  'Which road has the most complaints?',
  'Who is responsible for the road near Santoshpur?',
  'How much budget was spent on NH-16?',
  'What is the contractor score for ABC Constructions?',
  'How do I report a pothole?',
  'Which roads are in critical condition?',
];

// ── ThinkingBlock ─────────────────────────────────────────────────────────────
function ThinkingBlock({ text, active }: { text: string; active: boolean }) {
  const [open, setOpen] = useState(false);
  if (!text.trim()) return null;
  return (
    <div className="mb-2 rounded-lg border border-purple-200 bg-purple-50 overflow-hidden text-xs">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-purple-700 font-medium hover:bg-purple-100 transition-colors">
        <Brain size={13} />
        <span>Kimi K2.6 reasoning</span>
        {active && (
          <span className="ml-1 flex gap-0.5 items-center">
            {[0, 120, 240].map(d => (
              <span key={d} className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
        )}
        <span className="ml-auto text-purple-400">
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-purple-200 pt-2 max-h-48 overflow-y-auto">
          <pre className="text-[11px] text-purple-800 whitespace-pre-wrap leading-relaxed font-mono">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── MessageBubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg, streaming }: { msg: ChatMessage; streaming: boolean }) {
  const isUser = msg.role === 'user';

  if (isUser) {
    return (
      <div className="flex gap-2.5 flex-row-reverse">
        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-1">
          <User size={15} className="text-brand-700" />
        </div>
        <div className="max-w-[80%] bg-brand-700 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
        </div>
      </div>
    );
  }

  // Assistant bubble
  const showThinking = msg.thinking && msg.thinking.trim().length > 0;
  const showContent  = msg.content || streaming;

  return (
    <div className="flex gap-2.5">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shrink-0 mt-1">
        <Bot size={15} className="text-purple-600" />
      </div>
      <div className="flex flex-col max-w-[82%]">
        {showThinking && (
          <ThinkingBlock text={msg.thinking!} active={streaming && !msg.content} />
        )}
        {showContent && (
          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-800">
            {msg.content
              ? <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              : streaming && showThinking
              ? <p className="text-gray-400 italic text-xs">Composing response…</p>
              : null}
            {streaming && msg.content && (
              <span className="inline-block w-1.5 h-4 bg-purple-400 rounded animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}
        {streaming && !showThinking && !msg.content && (
          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
            <Brain size={13} className="text-purple-400 animate-pulse" />
            <span className="text-xs text-purple-500 italic">Kimi is thinking…</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Chatbot() {
  const { userLat, userLng, isOffline } = useAppStore();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: '👋 Hi! I\'m the RoadWatch Assistant, powered by Kimi K2.6 with extended reasoning.\n\nI can answer questions about roads, budgets, contractors, complaints, and public spending in your area. What would you like to know?',
  }]);
  const [input, setInput]       = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError]        = useState<string | null>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (userMsg: string) => {
    if (!userMsg.trim() || streaming || isOffline) return;
    setError(null);

    const userMessage: ChatMessage = { role: 'user', content: userMsg };
    const historyForApi = [...messages, userMessage];

    setMessages(prev => [...prev, userMessage, { role: 'assistant', content: '', thinking: '' }]);
    setInput('');
    setStreaming(true);

    abortRef.current = new AbortController();
    let thinkingAcc = '';
    let contentAcc  = '';

    try {
      const response = await fetch(`${BACKEND}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForApi,
          lat: userLat,
          lng: userLng,
          role: user?.role || 'citizen',
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Server error ${response.status}`);
      }
      if (!response.body) throw new Error('No response body — streaming not supported?');

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let event: { type: string; content?: string };
          try { event = JSON.parse(raw); } catch { continue; }

          if (event.type === 'done') break;
          if (event.type === 'error') throw new Error(event.content ?? 'Stream error');
          if (event.type === 'thinking' && event.content) thinkingAcc += event.content;
          if (event.type === 'content'  && event.content) contentAcc  += event.content;

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: contentAcc,
              thinking: thinkingAcc,
            };
            return updated;
          });
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      const msg = err.message || 'Something went wrong. Please try again.';
      setError(msg);
      // Put error into the assistant bubble if it's empty
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'assistant' && !last.content) {
          updated[updated.length - 1] = { role: 'assistant', content: `⚠️ ${msg}` };
        }
        return updated;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center shrink-0">
          <Bot size={20} className="text-purple-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">RoadWatch AI Assistant</span>
            <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              <Sparkles size={10} /> Kimi K2.6 + RAG
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate">
            {isOffline ? '⚠ Offline' : 'Extended reasoning · Live road data retrieval'}
          </p>
        </div>
      </div>

      {isOffline && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center gap-2 text-sm text-orange-700">
          <WifiOff size={14} /> Chatbot unavailable while offline.
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={msg}
            streaming={streaming && i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}

        {/* Global error banner */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggestions ── */}
      {messages.length <= 1 && (
        <div className="bg-white border-t border-gray-100 px-4 py-2">
          <p className="text-xs text-gray-400 mb-1.5">Try asking:</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="shrink-0 text-xs bg-brand-50 border border-brand-100 text-brand-700 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors whitespace-nowrap">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 pb-safe md:pb-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder={isOffline ? 'Unavailable offline' : 'Ask about roads, budgets, contractors…'}
            disabled={isOffline}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-100"
          />
          {streaming ? (
            <button onClick={stopStreaming}
              className="bg-red-500 hover:bg-red-400 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors">
              Stop
            </button>
          ) : (
            <button onClick={() => sendMessage(input)}
              disabled={!input.trim() || isOffline}
              className="bg-brand-700 hover:bg-brand-600 disabled:bg-gray-300 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center">
              <Send size={16} />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          Kimi K2.6 · BM25 RAG on live data · No personal data stored
        </p>
      </div>
    </div>
  );
}
