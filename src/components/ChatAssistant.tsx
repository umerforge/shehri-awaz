import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareQuote, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  HelpCircle, 
  PhoneCall, 
  RefreshCw,
  MapPin
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatAssistantProps {
  currentCity: string;
  currentArea: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  currentCity,
  currentArea,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Assalam-o-Alaikum! I am your **ShehriAwaz Civic Assistant**. I can guide you on which Pakistani public department handles specific civic issues, expected resolution timelines, and standard complaint procedures in **${currentCity} • ${currentArea}**.\n\nHow can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Who do I complain to about a water outage?',
    'How long should garbage collection normally take?',
    'Who is responsible for damaged roads and potholes?',
    'What should I do if my area has repeated power failures?',
    'What is the difference between ShehriAwaz and official complaint portals?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          userCity: currentCity,
          userArea: currentArea,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        role: 'assistant',
        content: data.reply || 'I am currently unable to retrieve civic information. Please check back shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong while processing your request. For urgent matters, please contact the municipal emergency helpline (1122 or 15).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4" id="chat-assistant-container">
      
      {/* Header card */}
      <div className="bg-white rounded-t-2xl border border-stone-300 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-b-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0F3D2A] text-white flex items-center justify-center shadow-xs">
            <MessageSquareQuote className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
                Ask ShehriAwaz
              </h1>
              <span className="text-xs font-urdu text-emerald-800 font-bold">
                معاون شہری آواز
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Guidance on public departments, resolution processes, and municipal responsibilities.
            </p>
          </div>
        </div>

        {/* Location Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F3D2A] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-center">
          <MapPin className="w-3.5 h-3.5" />
          <span>Local Context: {currentCity} • {currentArea}</span>
        </div>
      </div>

      {/* Main Chat messages panel */}
      <div className="bg-[#F8FAF7] border-x border-stone-300 p-4 sm:p-6 min-h-[440px] max-h-[550px] overflow-y-auto space-y-4">
        
        {messages.map((msg, idx) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={idx}
              className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-full bg-[#0F3D2A] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4 text-emerald-200" />
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4 text-sm shadow-xs ${
                isAssistant
                  ? 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs leading-relaxed'
                  : 'bg-[#0F3D2A] text-white rounded-tr-xs font-medium'
              }`}>
                {/* Message text with basic markdown formatting */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.content.split('\n\n').map((para, pIdx) => {
                    // Quick bold parser
                    const formatted = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    return (
                      <p 
                        key={pIdx} 
                        dangerouslySetInnerHTML={{ __html: formatted }}
                      />
                    );
                  })}
                </div>

                <div className={`text-[10px] mt-2 text-right ${isAssistant ? 'text-stone-400' : 'text-emerald-200'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading state */}
        {loading && (
          <div className="flex gap-3 justify-start items-center text-xs text-stone-500">
            <div className="w-8 h-8 rounded-full bg-[#0F3D2A] text-white flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
            </div>
            <div className="bg-white border border-stone-200 px-4 py-2.5 rounded-xl rounded-tl-xs shadow-xs text-stone-600 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Consulting civic knowledgebase for {currentCity}…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="bg-white border-x border-stone-300 p-3 sm:px-6 py-3 border-t border-stone-200">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
          Suggested Questions for Older Citizens & First-Time Users:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(q)}
              className="text-left text-xs bg-stone-100 hover:bg-emerald-50 hover:text-[#0F3D2A] text-stone-700 font-semibold px-3 py-1.5 rounded-lg border border-stone-200 transition disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="bg-white rounded-b-2xl border border-stone-300 p-4 sm:p-5 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type your civic question (e.g., who repairs broken streetlights?)..."
            className="flex-1 px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F3D2A] bg-[#FDFEFC]"
            id="input-chat-query"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-[#0F3D2A] hover:bg-emerald-900 text-white font-bold text-sm flex items-center gap-2 shadow-xs transition disabled:opacity-40 cursor-pointer"
            id="btn-send-chat"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
        
        <p className="text-[11px] text-stone-500 text-center mt-2.5">
          ShehriAwaz Guide is an educational assistant and is not an official government representative.
        </p>
      </div>

    </div>
  );
};
