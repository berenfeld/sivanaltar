import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { X, Edit2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/lib/LanguageContext";

const ADMIN_EMAILS = ["berenfeldran@gmail.com", "sivanaltar@gmail.com"];

export default function AppointmentDetailModal({ isOpen, appointment, onEdit, onCancel, onDelete, user }) {
  const { t } = useTranslation();
  const { lang, dir } = useLang();
  const locale = lang === 'en' ? enUS : he;
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(appointment || {});

  useEffect(() => {
    if (isOpen && appointment) setFormData(appointment);
  }, [isOpen, appointment]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onCancel(); };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onCancel]);

  if (!isOpen || !appointment) return null;

  const handleSaveEdit = async () => {
    const { appointment_type, ...dataToSave } = formData;
    await onEdit(dataToSave);
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir={dir}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#3a3a4a]">
            {user?.email === appointment?.user_email ? t("cal_detail_mine") : `${t("cal_detail_of")} ${appointment?.user_name}`}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-[#f8f5f0] rounded-lg"><X size={20} /></button>
        </div>

        {!editing ? (
          <div className="space-y-4">
            <div className="bg-[#e8f4f5] rounded-lg p-4">
              <p className="text-sm text-[#4a8fa0]">
                <strong>{format(new Date(appointment.start_time), "EEEE, d MMMM HH:mm", { locale })}</strong>
              </p>
              {user?.email === appointment?.user_email && (
                <p className="text-sm text-[#999] mt-1">{t("cal_detail_price")}</p>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#999] mb-0.5">{t("cal_detail_name")}</p>
                <p className="text-sm font-medium text-[#3a3a4a]">{appointment.user_name}</p>
              </div>
              <div>
                <p className="text-xs text-[#999] mb-0.5">{t("cal_detail_phone")}</p>
                <p className="text-sm font-medium text-[#3a3a4a]">{appointment.user_phone}</p>
              </div>
              {isAdmin && (
                <div>
                  <p className="text-xs text-[#999] mb-0.5">{t("cal_detail_email")}</p>
                  <p className="text-sm font-medium text-[#3a3a4a]">{appointment.user_email}</p>
                </div>
              )}
              {appointment.notes && (
                <div>
                  <p className="text-xs text-[#999] mb-0.5">{t("cal_detail_notes")}</p>
                  <p className="text-sm text-[#3a3a4a]">{appointment.notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(true)} className="flex-1 py-2 px-4 border border-[#4a8fa0] text-[#4a8fa0] rounded-lg font-medium hover:bg-[#e8f4f5] flex items-center justify-center gap-2">
                <Edit2 size={16} /> {t("cal_detail_edit")}
              </button>
              <button onClick={() => onDelete(appointment.id)} className="flex-1 py-2 px-4 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 flex items-center justify-center gap-2">
                <Trash2 size={16} /> {t("cal_detail_cancel_appt")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#e8f4f5] rounded-lg p-4">
              <p className="text-sm text-[#4a8fa0]">
                <strong>{format(new Date(formData.start_time), "EEEE, d MMMM HH:mm", { locale })}</strong>
              </p>
              {user?.email === appointment?.user_email && (
                <p className="text-sm text-[#999] mt-1">{t("cal_detail_price")}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">{t("cal_detail_name_label")}</label>
              <input type="text" value={formData.user_name} onChange={e => setFormData({ ...formData, user_name: e.target.value })} className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">{t("cal_detail_phone")}</label>
              <input type="tel" value={formData.user_phone} onChange={e => setFormData({ ...formData, user_phone: e.target.value })} className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">{t("cal_detail_notes")}</label>
              <textarea value={formData.notes || ""} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder={t("cal_detail_notes_ph")} className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0] resize-none h-20" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="flex-1 py-2 px-4 border border-[#e8e0d4] rounded-lg text-[#555] font-medium hover:bg-[#f8f5f0]">
                {t("cancel")}
              </button>
              <button onClick={handleSaveEdit} className="flex-1 py-2 px-4 bg-[#4a8fa0] text-white rounded-lg font-medium hover:bg-[#2d6b7a]">
                {t("cal_detail_save")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
