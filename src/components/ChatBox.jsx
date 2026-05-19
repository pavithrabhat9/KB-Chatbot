import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { sendMessage, subscribeToMessages, subscribeToArticles, subscribeToSessionStatus, doc, updateDoc, db } from '../utils/firebase';
import Toast from './Toast';

const ChatBox = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);
  const prevSessionIdRef = useRef(null);
  const [kbArticles, setKbArticles] = useState([]);
  const titleUpdatedRef = useRef(false);

  // Subscribe to KB articles
  useEffect(() => {
    const unsub = subscribeToArticles((articles) => {
      setKbArticles(articles);
    });
    return () => unsub();
  }, []);

  // Subscribe to session status for real-time isActive updates
  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToSessionStatus(sessionId, (sessionData) => {
      if (sessionData) {
        setIsActive(sessionData.isActive !== false);
      }
    });
    return () => unsub();
  }, [sessionId]);

  // Subscribe to messages for this session
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      setIsActive(true);
      return;
    }

    if (sessionId === prevSessionIdRef.current) return;
    prevSessionIdRef.current = sessionId;

    setMessages([]);
    titleUpdatedRef.current = false;

    const unsub = subscribeToMessages(sessionId, (data) => {
      if (data && data.length > 0) {
        setMessages(data.slice());
      }
    });

    return () => {
      unsub();
    };
  }, [sessionId]);

  // Auto-title: Update session title based on first user message
  useEffect(() => {
    if (!sessionId || titleUpdatedRef.current) return;
    const firstUserMsg = messages.find((m) => m.senderType === 'user');
    if (firstUserMsg && firstUserMsg.content) {
      const title = firstUserMsg.content.length > 40
        ? firstUserMsg.content.substring(0, 40) + '...'
        : firstUserMsg.content;
      const sessionDoc = doc(db, 'chat_sessions', sessionId);
      updateDoc(sessionDoc, { title }).catch(() => {});
      titleUpdatedRef.current = true;
    }
  }, [messages, sessionId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return '';
    return timestamp.toDate().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const simulateTyping = async (text) => {
    setIsStreaming(true);
    let displayed = '';
    const chars = text.split('');
    for (let i = 0; i < chars.length; i += 2) {
      displayed += chars.slice(i, i + 2).join('');
      setStreamingMessage(displayed);
      await new Promise((r) => setTimeout(r, 30));
    }
    setIsStreaming(false);
    setStreamingMessage('');
  };

  const callGroqApi = async (message) => {
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    if (!GROQ_API_KEY) return { response: null, error: 'AI service not configured.' };

    const kbContent = kbArticles
      .map((a, i) => `Article ${i + 1}: ${a.title}\nContent: ${a.content}`)
      .join('\n\n');

    const systemPrompt = `You are a helpful assistant. Answer questions ONLY using the provided knowledge base articles below.
If the question cannot be answered using the information in these articles, respond with EXACTLY: 'I don't have that information.'
Do NOT make up information or use your own knowledge. ONLY use the articles provided.
Keep responses concise and helpful.

KNOWLEDGE BASE ARTICLES:
${kbContent || 'No articles available.'}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (response.status === 429) return { response: null, error: 'Rate limit exceeded. Try again later.' };
    if (!response.ok) return { response: null, error: 'AI service error. Please try again.' };

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content;
    if (!responseText) return { response: null, error: 'AI service error. Please try again.' };

    return { response: responseText, error: null };
  };

  const handleSend = async () => {
    if (!input.trim()) {
      setToast({ message: 'Please enter a message', type: 'error', key: Date.now() });
      return;
    }
    if (!isActive) {
      setToast({ message: 'Chat ended by admin. No new messages allowed.', type: 'error', key: Date.now() });
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    // Save user message
    await sendMessage(sessionId, 'user', userMessage);

    // Call AI
    const result = await callGroqApi(userMessage);
    if (result.error) {
      setToast({ message: result.error, type: 'error', key: Date.now() });
      setSending(false);
      return;
    }

    const botResponse = result.response || "I don't have that information.";

    // Show typing effect FIRST
    await simulateTyping(botResponse);

    // Then save bot message
    await sendMessage(sessionId, 'bot', botResponse);
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F1E9E9] dark:bg-[#15173D]">
        <div className="text-center text-gray-400 dark:text-[#E491C9]/50">
          <MessageSquare className="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-[#E491C9]/30" />
          <p className="text-lg font-medium">No chat selected</p>
          <p className="text-sm mt-1">Create new chat or select existing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F1E9E9] dark:bg-[#15173D]">
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="px-4 py-3 bg-white dark:bg-[#15173D] border-b border-[#7a1e7a]/15 dark:border-[#982598]/25">
        <div>
          <p className="font-medium text-gray-800 dark:text-[#F1E9E9]">KB ASSISTANT</p>
          {!isActive && <p className="text-xs text-red-500 mt-0.5">Chat ended by admin. No new messages allowed.</p>}
          {isActive && <p className="text-xs text-green-500 mt-0.5">Active</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 dark:bg-[#15173D]">
        {messages.length === 0 && !isStreaming && (
          <div className="text-center py-20 text-gray-400 dark:text-[#E491C9]/50">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-[#E491C9]/30" />
            <p className="text-sm">How can I assist you today? Type your question below.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.senderType === 'user'
                  ? 'bg-[#7a1e7a] text-[#F1E9E9] rounded-br-md'
                  : msg.senderType === 'admin'
                  ? 'bg-[#d07db8]/25 dark:bg-[#E491C9]/12 text-gray-800 dark:text-[#F1E9E9] rounded-bl-md'
                  : 'bg-white dark:bg-[#0e0f29] text-gray-800 dark:text-[#F1E9E9] rounded-bl-md border border-[#7a1e7a]/15 dark:border-[#982598]/25'
              }`}
            >
              {(msg.senderType === 'admin' || msg.senderType === 'bot') && (
                <p className="text-xs font-medium mb-0.5">
                  {msg.senderType === 'admin' ? (
                    <span className="text-[#7a1e7a] dark:text-[#d07db8]">Admin</span>
                  ) : (
                    <span className="text-gray-500 dark:text-[#E491C9]/60">Bot</span>
                  )}
                </p>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.senderType === 'user' ? 'text-[#d07db8]/80' : 'text-gray-400 dark:text-[#E491C9]/50'}`}>
                {formatDate(msg.createdAt) || ''}
              </p>
            </div>
          </div>
        ))}

        {isStreaming && streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[75%] bg-white dark:bg-[#0e0f29] text-gray-800 dark:text-[#F1E9E9] rounded-2xl rounded-bl-md px-4 py-2.5 border border-[#7a1e7a]/15 dark:border-[#982598]/25">
              <p className="text-xs font-medium text-gray-500 dark:text-[#E491C9]/60 mb-0.5">Bot</p>
              <p className="text-sm whitespace-pre-wrap">
                {streamingMessage}
                <span className="inline-block w-2 h-4 bg-gray-500 dark:bg-[#E491C9]/60 ml-1 animate-pulse" />
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-[#15173D] border-t border-[#7a1e7a]/15 dark:border-[#982598]/25">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your question..."
            disabled={!isActive || sending || isStreaming}
            className="flex-1 px-4 py-2.5 border border-[#7a1e7a]/25 dark:border-[#982598]/40 rounded-xl focus:ring-2 focus:ring-[#7a1e7a] focus:border-transparent outline-none disabled:bg-gray-50 dark:disabled:bg-[#0e0f29] disabled:cursor-not-allowed bg-white dark:bg-[#0e0f29] text-gray-800 dark:text-[#F1E9E9] placeholder-gray-400 dark:placeholder-[#d265b0]/60"
          />
          <button
            onClick={handleSend}
            disabled={!isActive || sending || isStreaming || !input.trim()}
            className="px-4 py-2.5 bg-[#7a1e7a] hover:bg-[#5c165c] disabled:bg-[#7a1e7a]/60 text-white rounded-xl transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
          >
            {sending || isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;