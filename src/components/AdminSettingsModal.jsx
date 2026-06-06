import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Save } from "lucide-react";

const DAYS = [
  { num: 0, label: "ראשון" },
  { num: 1, label: "שני" },
  { num: 2, label: "שלישי" },
  { num: 3, label: "רביעי" },
  { num: 4, label: "חמישי" },
  { num: 5, label: "שישי" },
  { num: 6, label: "שבת" }
];

export default function AdminSettingsModal({ workingHours, onUpdate, onClose }) {
  const [hours, setHours] = useState(workingHours || []);
  const [loading, setLoading] = useState(false);

  const getDayHours = (dayNum) => {
    return hours.find(h => h.day_of_week === dayNum) || { day_of_week: dayNum, start_time: "", end_time: "", is_available: false };
  };

  const updateHour = async (dayNum, field, value) => {
    const existing = getDayHours(dayNum);
    const updated = { ...existing, [field]: value };

    setHours(prev => {
      const filtered = prev.filter(h => h.day_of_week !== dayNum);
      return [...filtered, updated];
    });

    // Save to database
    if (existing.id) {
      await base44.entities.WorkingHours.update(existing.id, { [field]: value });
    } else if (updated.start_time && updated.end_time && updated.is_available) {
      await base44.entities.WorkingHours.create(updated);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update all hours in database
      await Promise.all(
        hours.map(h => {
          if (h.id) {
            return base44.entities.WorkingHours.update(h.id, h);
          } else {
            return base44.entities.WorkingHours.create(h);
          }
        })
      );
      onUpdate(hours);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#3a3a4a]">הגדרות שעות עבודה</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#f8f5f0] rounded-lg">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-[#999] mb-4">שינויים זה לא יחזרו הזמנות קיימות, רק הזמנות חדשות</p>

        <div className="space-y-4">
          {DAYS.map(({ num, label }) => {
            const dayHours = getDayHours(num);
            return (
              <div key={num} className="border border-[#e8e0d4] rounded-lg p-4">
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={dayHours.is_available}
                    onChange={(e) => updateHour(num, "is_available", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-[#3a3a4a]">{label}</span>
                </label>

                {dayHours.is_available && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="time"
                      value={dayHours.start_time || ""}
                      onChange={(e) => updateHour(num, "start_time", e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#e8e0d4] rounded-lg text-sm"
                    />
                    <span className="text-[#999]">עד</span>
                    <input
                      type="time"
                      value={dayHours.end_time || ""}
                      onChange={(e) => updateHour(num, "end_time", e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#e8e0d4] rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-[#e8e0d4] rounded-lg text-[#555] font-medium hover:bg-[#f8f5f0]"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2 px-4 bg-[#4a8fa0] text-white rounded-lg font-medium hover:bg-[#2d6b7a] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {loading ? "שומר..." : "שמור"}
          </button>
        </div>
      </div>
    </div>
  );
}