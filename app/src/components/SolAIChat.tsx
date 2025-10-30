import * as React from 'react';
import { Button } from './ui';
import { Send, Loader2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { SolAIApiClient } from '@solai/sdk/api';
import { getSolAIRuntimeConfig } from '@solai/config';
import { useWallet } from '@solana/wallet-adapter-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface WorkflowStep {
  node: string;
  status: string;
  intent?: string;
  confidence?: number;
  reasoning?: string;
  response_preview?: string;
  sources_count?: number;
  url?: string;
  success?: boolean;
  final?: boolean;
  error?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workflowSteps?: WorkflowStep[];
}

interface SolAIChatProps {
  initialPrompt?: string | null;
  className?: string;
}

export const SolAIChat: React.FC<SolAIChatProps> = ({ initialPrompt, className = '' }) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [devWallet, setDevWallet] = React.useState<string | null>(null);
  const runtime = React.useMemo(() => getSolAIRuntimeConfig(), []);
  const apiBaseUrl = React.useMemo(() => runtime.apiBaseUrl.replace(/\/$/, ''), [runtime.apiBaseUrl]);
  const apiClient = React.useMemo(() => new SolAIApiClient(apiBaseUrl), [apiBaseUrl]);
  const { publicKey, connected } = useWallet();
  const connectedWallet = React.useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);
  
  // Use dev wallet if connected wallet is not available
  const walletAddress = connectedWallet || devWallet;

  // Fetch dev wallet on mount
  React.useEffect(() => {
    fetch(`${apiBaseUrl}/dev/wallet`)
      .then((res) => res.json())
      .then((data) => {
        if (data.available && data.wallet) {
          setDevWallet(data.wallet);
          console.log('🔧 Dev wallet loaded:', data.wallet);
        }
      })
      .catch((err) => console.warn('Failed to load dev wallet:', err));
  }, [apiBaseUrl]);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    const chatContainer = document.getElementById('chat-messages-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // Handle initial prompt
  React.useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const prompt = input.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!walletAddress) {
        const connectWalletMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Bạn cần kết nối ví Solana để tôi có thể truy xuất danh mục và đưa ra phân tích chi tiết. Vui lòng nhấn Connect Wallet ở góc trên bên phải.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, connectWalletMessage]);
        return;
      }

      // Use LangGraph endpoint
      const response = await fetch(`${apiBaseUrl}/chat/langgraph`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: prompt,
          wallet: walletAddress,
          demo: true, // Demo mode for now
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Show dev wallet indicator if using dev wallet
      const devWalletIndicator = devWallet && !connectedWallet 
        ? '\n\n🔧 Đang dùng dev wallet từ config' 
        : '';
      
      const metaSummary = data.demo
        ? '\n\nℹ️ Phiên làm việc đang ở chế độ demo – chưa ghi log on-chain.'
        : '';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          data.response_text && data.response_text.length > 0
            ? `${data.response_text}${devWalletIndicator}${metaSummary}`
            : 'Tôi chưa nhận được phản hồi từ hệ thống. Vui lòng thử lại sau ít phút.',
        timestamp: new Date(),
        workflowSteps: data.workflow_steps || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper function to get step icon
  const getStepIcon = (step: WorkflowStep) => {
    if (step.status === 'failed') {
      return '❌';
    }
    switch (step.node) {
      case 'intent_detection':
        return '🔍';
      case 'chat':
        return '💬';
      case 'retrieval':
        return '📚';
      case 'crawl_web':
        return '🌐';
      case 'final_synthesis':
        return '✨';
      case 'error':
        return '⚠️';
      default:
        return '📋';
    }
  };

  // Helper function to get step label
  const getStepLabel = (step: WorkflowStep) => {
    switch (step.node) {
      case 'intent_detection':
        return 'Phát hiện ý định';
      case 'chat':
        return 'Trò chuyện trực tiếp';
      case 'retrieval':
        return 'Tìm kiếm tài liệu';
      case 'crawl_web':
        return 'Thu thập thông tin web';
      case 'final_synthesis':
        return 'Tổng hợp phản hồi';
      case 'error':
        return 'Lỗi';
      default:
        return step.node;
    }
  };

  // Helper function to render step details
  const renderStepDetails = (step: WorkflowStep) => {
    const details: string[] = [];
    
    if (step.intent) {
      details.push(`Ý định: ${step.intent}`);
    }
    if (step.confidence !== undefined) {
      details.push(`Độ tin cậy: ${(step.confidence * 100).toFixed(1)}%`);
    }
    if (step.sources_count !== undefined) {
      details.push(`Số nguồn: ${step.sources_count}`);
    }
    if (step.url) {
      details.push(`URL: ${step.url}`);
    }
    if (step.success !== undefined) {
      details.push(`Thành công: ${step.success ? 'Có' : 'Không'}`);
    }
    if (step.error) {
      details.push(`Lỗi: ${step.error}`);
    }

    return details.length > 0 ? details.join(' • ') : null;
  };

  return (
    <div className={`flex flex-col h-[500px] ${className}`}>
      {/* Messages Area */}
      <div id="chat-messages-container" className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              <div className="text-4xl">💬</div>
              <p className="text-[var(--text-secondary)]">
                Bắt đầu cuộc trò chuyện với Agent Sol AI
              </p>
              <p className="text-sm text-[var(--text-tertiary)]">
                Hoặc chọn một Quick Action ở trên
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] rounded-lg p-4
                  ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#6366f1] to-[#a78bfa] text-white'
                      : 'bg-[#1e293b] border border-[#334155] text-[var(--text-primary)]'
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  {message.role === 'assistant' && (
                    <span className="text-xl flex-shrink-0">🤖</span>
                  )}
                  <div className="flex-1">
                    {message.role === 'assistant' ? (
                      <>
                        {/* Workflow Steps */}
                        {message.workflowSteps && message.workflowSteps.length > 0 && (
                          <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                              Quy trình xử lý
                            </div>
                            <div className="space-y-2">
                              {message.workflowSteps.map((step, idx) => {
                                const details = renderStepDetails(step);
                                return (
                                  <div key={idx} className="flex items-start gap-2">
                                    <span className="text-base flex-shrink-0 mt-0.5">
                                      {getStepIcon(step)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-200">
                                          {getStepLabel(step)}
                                        </span>
                                        {step.status === 'completed' && (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        )}
                                        {step.status === 'failed' && (
                                          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                        )}
                                      </div>
                                      {details && (
                                        <div className="text-xs text-slate-400 mt-0.5">
                                          {details}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Main Response */}
                        <div className="prose prose-invert prose-sm max-w-none markdown-content">
                          <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-xl font-bold mb-3 mt-4 text-white border-b border-slate-700 pb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-bold mb-2 mt-3 text-white">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-semibold mb-2 mt-2 text-slate-100">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-3 text-slate-200 leading-relaxed">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc ml-5 mb-3 space-y-1.5">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal ml-5 mb-3 space-y-1.5">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-slate-200 leading-relaxed">
                                {children}
                              </li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold text-white">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic text-slate-300">
                                {children}
                              </em>
                            ),
                            code: ({ inline, children }: any) => 
                              inline ? (
                                <code className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 text-sm font-mono border border-slate-700">
                                  {children}
                                </code>
                              ) : (
                                <code className="block text-slate-200 font-mono text-sm">
                                  {children}
                                </code>
                              ),
                            pre: ({ children }) => (
                              <pre className="p-4 rounded-lg bg-slate-800 overflow-x-auto mb-3 border border-slate-700">
                                {children}
                              </pre>
                            ),
                            a: ({ href, children }) => (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline decoration-blue-500/50 hover:decoration-blue-400"
                              >
                                {children}
                              </a>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 italic text-slate-300 bg-slate-800/50">
                                {children}
                              </blockquote>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-3">
                                <table className="min-w-full border border-slate-700 rounded-lg">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-slate-800">
                                {children}
                              </thead>
                            ),
                            tbody: ({ children }) => (
                              <tbody className="divide-y divide-slate-700">
                                {children}
                              </tbody>
                            ),
                            tr: ({ children }) => (
                              <tr className="hover:bg-slate-800/50">
                                {children}
                              </tr>
                            ),
                            th: ({ children }) => (
                              <th className="px-4 py-2 text-left text-sm font-semibold text-white border-b border-slate-700">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-4 py-2 text-sm text-slate-200">
                                {children}
                              </td>
                            ),
                            hr: () => (
                              <hr className="my-4 border-slate-700" />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        </div>
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                    <p
                      className={`
                        text-xs mt-2 opacity-60
                        ${message.role === 'user' ? 'text-white' : 'text-[var(--text-tertiary)]'}
                      `}
                    >
                      {message.timestamp.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[var(--text-secondary)]">SolAI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <textarea
            value={input}
            onChange={(e: any) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Nhập câu hỏi của bạn... (Enter để gửi, Shift+Enter xuống dòng)"
            disabled={isLoading}
            rows={3}
            className="w-full min-h-[80px] max-h-[240px] px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-[#f1f5f9] placeholder:text-[#94a3b8] transition-all duration-200 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[rgba(99,102,241,0.2)] disabled:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-y-auto"
            style={{
              height: 'auto',
              minHeight: '80px',
            }}
            onInput={(e: any) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 240) + 'px';
            }}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          aria-label="Send message"
          className="h-[80px]"
        >
          Gửi
        </Button>
      </div>
    </div>
  );
};
