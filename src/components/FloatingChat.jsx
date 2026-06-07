import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, Mail, Trash2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import ConfirmModal from "@/components/ConfirmModal";
import { useTranslation } from "react-i18next";
import { useLang } from "@/lib/LanguageContext";

const PENDING_MSG_KEY = "chat_pending_message";

export default function FloatingChat() {
  const { t } = useTranslation();
  const { lang, dir } = useLang();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const messagesContainerRef = useRef(null);

  const greeting = () => t("chat_greeting");

  useEffect(() => {
    const loadSession = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          if (user?.role === 'admin') setIsAdmin(true);
          const sessions = await base44.entities.UserGuidanceSession.filter({ user_email: user.email, status: 'active' });
          if (sessions.length > 0) {
            const session = sessions[0];
            const history = session.qa_history || [];
            if (history.length > 0) {
              const loaded = [{ role: "assistant", content: greeting() }];
              for (const qa of history) {
                if (!qa || !qa.question || !qa.answer) continue;
                loaded.push({ role: "user", content: qa.question });
                loaded.push({ role: "assistant", content: qa.answer });
              }
              setMessages(loaded);
              setQuestionCount(history.length);
            }
          }
        }
      } catch (_) {}
      setSessionLoaded(true);

      const pending = localStorage.getItem(PENDING_MSG_KEY);
      if (pending) {
        localStorage.removeItem(PENDING_MSG_KEY);
        setIsOpen(true);
        setTimeout(() => sendMessage(pending), 400);
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    if (isOpen && sessionLoaded && messages.length === 0) {
      setMessages([{ role: "assistant", content: greeting() }]);
    }
  }, [isOpen, sessionLoaded]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      setTimeout(() => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }, 0);
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const userMessage = text.trim();
    if (!userMessage) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    try {
      const response = await base44.functions.invoke("invokeAiGuidance", { question: userMessage, lang });
      setMessages(prev => [...prev, { role: "assistant", content: response.answer }]);
      setQuestionCount(prev => prev + 1);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: t("chat_error") }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || questionCount >= 3) return;
    const msg = input.trim();
    localStorage.setItem(PENDING_MSG_KEY, msg);
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) { setShowLoginModal(true); return; }
    localStorage.removeItem(PENDING_MSG_KEY);
    await sendMessage(msg);
  };

  const clearHistory = async () => {
    try {
      const user = await base44.auth.me();
      const sessions = await base44.entities.UserGuidanceSession.filter({ user_email: user.email, status: 'active' });
      for (const s of sessions) {
        await base44.entities.UserGuidanceSession.update(s.id, { qa_history: [] });
      }
      setMessages([]);
      setQuestionCount(0);
    } catch (_) {}
  };

  const chatBody = (
    <>
      {/* Header */}
      <div className="bg-[#4a8fa0] text-white p-4 rounded-t-lg flex items-center justify-between flex-shrink-0">
        <h3 className="text-base font-semibold">{t("chat_title")}</h3>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <button onClick={() => setShowClearConfirm(true)} title={t("chat_clear_title")} className="hover:bg-[#2d6b7a] p-1 rounded transition-colors">
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={() => setIsOpen(false)} className="hover:bg-[#2d6b7a] p-1 rounded transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafaf8]" dir={dir}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? (dir === "rtl" ? "justify-start" : "justify-end") : (dir === "rtl" ? "justify-end" : "justify-start")}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-[#4a8fa0] text-white"
                : "bg-[#f0ebe3] text-[#3a3a4a] border border-[#e8e0d4]"
            }`} dir="auto">
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className={`flex ${dir === "rtl" ? "justify-end" : "justify-start"}`}>
            <div className="bg-[#f0ebe3] px-3 py-2 rounded-lg border border-[#e8e0d4]">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#4a8fa0] rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-[#4a8fa0] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <span className="w-2 h-2 bg-[#4a8fa0] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[#e8e0d4] p-3 flex-shrink-0" dir={dir}>
        {questionCount >= 3 ? (
          <a href={createPageUrl("Contact")}
            className="flex items-center justify-center gap-2 bg-[#4a8fa0] text-white px-4 py-2 rounded-lg hover:bg-[#2d6b7a] transition-colors text-sm font-medium">
            <Mail size={16} />
            {t("chat_contact_btn")}
          </a>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleSendMessage()}
              placeholder={t("chat_placeholder")}
              disabled={loading}
              className="flex-1 px-3 py-2 border border-[#e8e0d4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a8fa0] disabled:bg-gray-100"
              dir={dir}
            />
            <button onClick={handleSendMessage} disabled={loading || !input.trim()}
              className="bg-[#4a8fa0] text-white p-2 rounded-lg hover:bg-[#2d6b7a] disabled:opacity-50 transition-colors">
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="font-sans" dir={dir}>
      <ConfirmModal
        isOpen={showClearConfirm}
        title={t("chat_clear_title")}
        message={t("chat_clear_message")}
        onConfirm={() => { setShowClearConfirm(false); clearHistory(); }}
        onCancel={() => setShowClearConfirm(false)}
        confirmLabel={t("chat_clear_confirm")}
        confirmClassName="bg-red-500 hover:bg-red-600 text-white"
      />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center space-y-4" dir={dir}>
            <h3 className="text-lg font-semibold text-[#3a3a4a]">{t("chat_login_title")}</h3>
            <p className="text-sm text-[#666]">{t("chat_login_desc")}</p>
            <button
              onClick={() => base44.auth.redirectToLogin(window.location.origin + "/Home")}
              className="w-full bg-[#4a8fa0] text-white px-4 py-2 rounded-lg hover:bg-[#2d6b7a] transition-colors text-sm font-medium"
            >
              {t("chat_login_btn")}
            </button>
            <button
              onClick={() => { setShowLoginModal(false); localStorage.removeItem(PENDING_MSG_KEY); }}
              className="text-xs text-[#999] hover:text-[#666] underline block w-full"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Mobile: full-screen with gap */}
      {isOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 bottom-20 z-50 flex items-end justify-center p-3">
          <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-2xl border border-[#e8e0d4] overflow-hidden">
            {chatBody}
          </div>
        </div>
      )}

      {/* Desktop: floating window */}
      {isOpen && (
        <div className="hidden md:flex fixed bottom-20 right-6 z-40 flex-col bg-white rounded-lg shadow-2xl w-80 h-96 border border-[#e8e0d4] mb-4">
          {chatBody}
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed right-4 bottom-20 lg:bottom-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            style={{ backgroundColor: "#4a8fa0", color: "white", borderRadius: "9999px", padding: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.25)", fontWeight: "600", whiteSpace: "nowrap", border: "none", cursor: "pointer", fontSize: "14px" }}
          >
            {t("chat_fab_text")}
          </button>
        </div>
      )}
    </div>
  );
}
