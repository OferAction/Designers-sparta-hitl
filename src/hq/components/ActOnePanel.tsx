import { useState, useRef, useEffect } from 'react';
import { XIcon as X, PaperPlaneTiltIcon as Send } from '@phosphor-icons/react';
import ActOneIcon from './ActOneIcon';
import ActOneGradientIcon from '@/hq/components/ActOneGradientIcon';
import { useHQActOne } from '@/hq/context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm ActOne, your AI assistant. Ask me anything about your workflows, reviews, or data.",
};

const MOCK_REPLIES: { pattern: RegExp; reply: string }[] = [
  {
    pattern: /pending|awaiting|queue/i,
    reply: "You currently have 7 pending review requests assigned to you. The oldest has been waiting 5 days — would you like me to prioritize it?",
  },
  {
    pattern: /approv/i,
    reply: "Your approval rate is 75% across reviewed cases this month. The team average is 68%, so you're above baseline.",
  },
  {
    pattern: /escalat/i,
    reply: "Escalation routes unresolved requests to a Level 2 reviewer. You can escalate from the case detail panel by adding a comment and clicking Escalate.",
  },
  {
    pattern: /workflow/i,
    reply: "You have active review requests across Workflow 1, Workflow 2, and Workflow 3. Workflow 1 has the highest volume right now with 4 pending items.",
  },
  {
    pattern: /vendor|invoice/i,
    reply: "The top vendors by review volume this month are Venito, InfraCore Systems, and SupplyChain Partners. Would you like a breakdown by status?",
  },
  {
    pattern: /time|slow|late|overdue|sla/i,
    reply: "Your average time-to-decision is 3.2 days. Two requests are approaching their SLA window — REQ2918 and REQ5503.",
  },
  {
    pattern: /hello|hi|hey/i,
    reply: "Hey! I'm here to help. You can ask me about pending reviews, approval rates, vendor data, or workflow activity.",
  },
];

function getMockReply(input: string): string {
  for (const { pattern, reply } of MOCK_REPLIES) {
    if (pattern.test(input)) return reply;
  }
  return "I don't have specific data on that yet, but I can help you navigate your review queue, check approval rates, or surface overdue items. What would you like to focus on?";
}

/** Animated typing indicator */
function TypingIndicator() {
  return (
    <div className="flex flex-row gap-2.5">
      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'hsl(var(--popover))' }}>
        <ActOneGradientIcon size={13} />
      </div>
      <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1" style={{ background: 'hsl(var(--popover))' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: 'hsl(var(--muted-foreground))',
              display: 'inline-block',
              animation: 'actone-bounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ActOnePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { registerActOneBlur } = useHQActOne();

  useEffect(() => {
    registerActOneBlur(() => inputRef.current?.blur());
  }, [registerActOneBlur]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 310);
    return () => clearTimeout(t);
  }, [open]);

  function handleSend() {
    const text = input.trim();
    if (!text || typing) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: getMockReply(text) }]);
    }, 800 + Math.random() * 600);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full w-screen md:w-[320px] flex-shrink-0" style={{ background: 'hsl(var(--card))', borderRight: '1px solid hsl(var(--border))' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 md:h-12 flex-shrink-0" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-3 md:gap-2">
          <ActOneGradientIcon size={28} className="md:!w-5 md:!h-5 flex-shrink-0" />
          <span className="text-xl md:text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>ActOne</span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-muted"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'hsl(var(--popover))' }}>
                <ActOneIcon size={11} className="text-purple-accent" />
              </div>
            )}
            <div
              className={`max-w-[220px] px-3 py-2.5 text-sm leading-snug ${
                msg.role === 'user' ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'
              }`}
              style={{
                background: msg.role === 'user' ? 'hsl(var(--purple-accent))' : 'hsl(var(--popover))',
                color: msg.role === 'user' ? 'hsl(var(--purple-accent-foreground))' : 'hsl(var(--foreground))',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2.5 ring-2 ring-transparent focus-within:ring-[hsl(var(--purple-accent))] transition-all"
          style={{ background: 'hsl(var(--popover))' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask ActOne…"
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none leading-snug max-h-32"
            style={{ color: 'hsl(var(--foreground))' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || typing}
            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-30 mb-0.5"
            style={{ background: 'hsl(var(--purple-accent))', color: 'hsl(var(--purple-accent-foreground))' }}
          >
            <Send size={13} />
          </button>
        </div>
        <p className="text-[10px] text-center mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
          ActOne can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
}
