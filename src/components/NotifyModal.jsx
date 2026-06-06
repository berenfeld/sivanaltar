import { useEffect } from "react";
import { Info } from "lucide-react";

export default function NotifyModal({ isOpen, title, message, onConfirm, confirmLabel = "הבנתי", confirmClassName = "bg-[#4a8fa0] hover:bg-[#2d6b7a] text-white" }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onConfirm();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onConfirm} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#e8f4f5] flex items-center justify-center">
            <Info size={26} className="text-[#4a8fa0]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#3a3a4a] mb-1">{title}</h3>
            {message && <p className="text-sm text-[#777]">{message}</p>}
          </div>
          <button
            onClick={onConfirm}
            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}