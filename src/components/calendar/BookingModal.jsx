import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { X } from "lucide-react";

export default function BookingModal({ isOpen, slot, onBook, onCancel, user }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "clinic",
    purpose: ""
  });

  useEffect(() => {
    if (isOpen && user) {
      setFormData({ name: "", phone: "", location: "clinic", purpose: "" });
    }
  }, [isOpen, user]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onCancel();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onCancel]);

  if (!isOpen || !slot) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("אנא מלא את כל השדות");
      return;
    }

    setLoading(true);
    try {
      await onBook(formData);
      setFormData({ name: "", phone: "", location: "clinic", purpose: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#3a3a4a]">קביעת פגישה</h2>
          <button onClick={onCancel} className="p-1 hover:bg-[#f8f5f0] rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="bg-[#e8f4f5] rounded-lg p-4 mb-6">
          <p className="text-sm text-[#4a8fa0]">
            <strong>{format(slot.start, "EEEE, d MMMM yyyy", { locale: he })}</strong>
            {" "}
            <strong>בשעה {format(slot.start, "HH:mm")}</strong>
          </p>
          <p className="text-sm text-[#999] mt-1">מחיר הפגישה 150 ₪</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">שם מלא</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoComplete="name"
                className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]"
                placeholder="הזן את שמך"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">טלפון</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                autoComplete="tel"
                className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]"
                placeholder="מספר טלפון"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">אימייל</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg bg-[#f8f5f0] text-[#999] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">מיקום הפגישה</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]"
              >
                <option value="clinic">בקליניקה</option>
                <option value="online">אונליין</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3a3a4a] mb-1">מטרת הפגישה (אופציונלי)</label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0] resize-none h-16"
              placeholder="ספר לי קצת על עצמך..."
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-[#e8e0d4] rounded-lg text-[#555] font-medium hover:bg-[#f8f5f0]"
            >
              ביטול
            </button>
            <button
              type="submit"
               disabled={loading}
               className="flex-1 py-2 px-4 bg-[#4a8fa0] text-white rounded-lg font-medium hover:bg-[#2d6b7a] disabled:opacity-50"
              >
               {loading ? "שומר..." : "קבע"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}