import { useEffect } from "react";
import { Trash2 } from "lucide-react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = "מחק", confirmClassName = "bg-red-500 hover:bg-red-600 text-white" }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onCancel();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 size={26} className="text-red-500" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#3a3a4a] mb-1">{title}</h3>
            {message && <p className="text-sm text-[#777]">{message}</p>}
          </div>

          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-[#e8e0d4] text-sm font-medium text-[#555] hover:bg-[#f8f5f0] transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${confirmClassName}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}