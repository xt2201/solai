import * as React from 'react';
import { MessageCircle, X, ChevronLeft } from 'lucide-react';
import { SolAIChat } from './SolAIChat';

interface ChatWidgetProps {
  initialPrompt?: string | null;
  onOpenChange?: (isOpen: boolean) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ initialPrompt, onOpenChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      setIsOpen(true);
    }
  }, [initialPrompt]);

  React.useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-screen z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          w-full sm:w-[420px] lg:w-[480px]
          bg-slate-900 border-l border-slate-800
          shadow-2xl
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                SolAI Assistant
              </p>
              <h2 className="text-lg font-semibold text-white">
                AI Consultation
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366f1]"
            aria-label="Đóng sidebar chat"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden p-6 bg-slate-950">
          <SolAIChat initialPrompt={initialPrompt} className="h-full" />
        </div>
      </div>

      {/* Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="
            fixed right-0 top-1/2 -translate-y-1/2 z-40
            flex items-center gap-2 px-3 py-4
            rounded-l-xl
            bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]
            shadow-[0_8px_30px_rgba(99,102,241,0.4)]
            text-white
            hover:shadow-[0_12px_40px_rgba(99,102,241,0.5)]
            transition-all duration-300
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366f1]
            group
          "
          aria-label="Mở chat Solai"
        >
          <span className="relative">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" aria-hidden="true" />
          </span>
          <span className="font-medium text-sm hidden sm:block">Hỏi AI</span>
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </button>
      )}
    </>
  );
};
