import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/lib/LanguageContext";

const TIME_OPTIONS = [];
for (let h = 6; h <= 23; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 23) TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:30`);
}

const getMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

// Returns an i18n key instead of a raw string
const validateHours = (start, end) => {
  if (!start || !end) return null;
  const startMin = getMinutes(start);
  const endMin = getMinutes(end);
  if (endMin <= startMin) return "cal_settings_err_order";
  if ((startMin % 60) !== (endMin % 60)) return "cal_settings_err_minutes";
  return null;
};

export default function AdminSettingsModal({ workingHours, onUpdate, onClose }) {
  const { t } = useTranslation();
  const { dir } = useLang();
  const days = t("cal_settings_days", { returnObjects: true });

  const DAYS = Array.isArray(days)
    ? days.map((label, num) => ({ num, label }))
    : ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"].map((label, num) => ({ num, label }));

  const [hours, setHours] = useState(workingHours || []);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const getDayHours = (dayNum) =>
    hours.find(h => h.day_of_week === dayNum) || { day_of_week: dayNum, start_time: "", end_time: "", is_available: false };

  const updateHour = (dayNum, field, value) => {
    const existing = getDayHours(dayNum);
    const updated = { ...existing, [field]: value };
    setHours(prev => [...prev.filter(h => h.day_of_week !== dayNum), updated]);
    const newStart = field === "start_time" ? value : existing.start_time;
    const newEnd = field === "end_time" ? value : existing.end_time;
    setErrors(prev => ({ ...prev, [dayNum]: validateHours(newStart, newEnd) }));
  };

  const handleSave = async () => {
    const activeHours = hours.filter(h => h.is_available);
    const newErrors = {};
    activeHours.forEach(h => {
      const err = validateHours(h.start_time, h.end_time);
      if (err) newErrors[h.day_of_week] = err;
    });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await Promise.all(hours.map(h => h.id ? base44.entities.WorkingHours.update(h.id, h) : base44.entities.WorkingHours.create(h)));
      onUpdate(hours);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir={dir}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#3a3a4a]">{t("cal_settings_title")}</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#f8f5f0] rounded-lg"><X size={20} /></button>
        </div>

        <p className="text-sm text-[#999] mb-4">{t("cal_settings_note")}</p>

        <div className="space-y-4">
          {DAYS.map(({ num, label }) => {
            const dayHours = getDayHours(num);
            return (
              <div key={num} className="border border-[#e8e0d4] rounded-lg p-4">
                <label className="flex items-center gap-3 mb-3">
                  <input type="checkbox" checked={dayHours.is_available} onChange={e => updateHour(num, "is_available", e.target.checked)} className="w-4 h-4" />
                  <span className="font-medium text-[#3a3a4a]">{label}</span>
                </label>
                {dayHours.is_available && (
                  <div>
                    <div className="flex gap-2 items-center">
                      <select value={dayHours.start_time || ""} onChange={e => updateHour(num, "start_time", e.target.value)} className="flex-1 px-3 py-2 border border-[#e8e0d4] rounded-lg text-sm bg-white">
                        <option value="">{t("cal_settings_select")}</option>
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="text-[#999]">{t("cal_settings_to")}</span>
                      <select value={dayHours.end_time || ""} onChange={e => updateHour(num, "end_time", e.target.value)} className="flex-1 px-3 py-2 border border-[#e8e0d4] rounded-lg text-sm bg-white">
                        <option value="">{t("cal_settings_select")}</option>
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    {errors[num] && <p className="text-red-500 text-xs mt-1">{t(errors[num])}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 px-4 border border-[#e8e0d4] rounded-lg text-[#555] font-medium hover:bg-[#f8f5f0]">
            {t("cancel")}
          </button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2 px-4 bg-[#4a8fa0] text-white rounded-lg font-medium hover:bg-[#2d6b7a] disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={16} />
            {loading ? t("cal_settings_saving") : t("cal_settings_save")}
          </button>
        </div>
      </div>
    </div>
  );
}
