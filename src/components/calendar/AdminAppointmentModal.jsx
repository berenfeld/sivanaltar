import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/lib/LanguageContext";

export default function AdminAppointmentModal({ isOpen, slot, onBook, onCancel }) {
  const { t } = useTranslation();
  const { lang, dir } = useLang();
  const locale = lang === 'en' ? enUS : he;

  const [formData, setFormData] = useState({ name: "", phone: "", email: "", location: "clinic", notes: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onCancel(); };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onCancel]);

  if (!isOpen || !slot) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      alert(t("cal_book_required"));
      return;
    }
    setLoading(true);
    try {
      await onBook(formData);
      setFormData({ name: "", phone: "", email: "", location: "clinic", notes: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir={dir}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#3a3a4a]">{t("cal_admin_add_title")}</h2>
          <button onClick={onCancel} className="p-1 hover:bg-[#f8f5f0] rounded-lg"><X size={20} /></button>
        </div>

        <div className="bg-[#e8f4f5] rounded-lg p-4 mb-6">
          <p className="text-sm text-[#4a8fa0]">
            <strong>{format(slot.start, "EEEE, d MMMM yyyy", { locale })}</strong>
            {" "}{t("cal_admin_at")}{" "}
            <strong>{format(slot.start, "HH:mm")}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">{t("cal_admin_student_name")}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("cal_book_name_ph")}
                className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">{t("cal_book_phone")}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t("cal_book_phone_ph")}
                className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">{t("cal_book_email")}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t("cal_book_email")}
                dir="ltr"
                className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">{t("cal_book_location")}</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]"
              >
                <option value="clinic">{t("cal_book_clinic")}</option>
                <option value="online">{t("cal_book_online")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3a3a4a] mb-1">{t("cal_admin_notes")}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("cal_admin_notes_ph")}
              className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0] resize-none h-16"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onCancel} className="flex-1 py-2 px-4 border border-[#e8e0d4] rounded-lg text-[#555] font-medium hover:bg-[#f8f5f0]">
              {t("cancel")}
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2 px-4 bg-[#4a8fa0] text-white rounded-lg font-medium hover:bg-[#2d6b7a] disabled:opacity-50">
              {loading ? t("cal_book_saving") : t("cal_admin_add_btn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
