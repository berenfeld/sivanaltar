import React, { useState } from "react";
import { format, isSameDay, startOfToday } from "date-fns";
import { X } from "lucide-react";

export default function BookingModal({ isOpen, slot, onBook, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "introduction",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

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
      setFormData({ name: "", phone: "", type: "introduction", notes: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#3a3a4a]">הזמנת תור</h2>
          <button onClick={onCancel} className="p-1 hover:bg-[#f8f5f0] rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="bg-[#e8f4f5] rounded-lg p-4 mb-4">
          <p className="text-sm text-[#4a8fa0]">
            <strong>{format(slot.start, "EEEE, d MMMM")}</strong> בשעה <strong>{format(slot.start, "HH:mm")}</strong>
          </p>
          <p className="text-sm text-[#999] mt-1">150 ₪</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3a3a4a] mb-1">שם מלא</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]"
              placeholder="הזן את מספר הטלפון שלך"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3a3a4a] mb-1">סוג הפגישה</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]"
            >
              <option value="introduction">פגישת היכרות</option>
              <option value="session">קורס</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3a3a4a] mb-1">הערות (אופציונלי)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0] resize-none h-20"
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
              {loading ? "שומר..." : "הזמן תור"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}