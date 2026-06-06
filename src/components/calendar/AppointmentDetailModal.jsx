import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { X, Edit2, Trash2 } from "lucide-react";

const ADMIN_EMAILS = ["berenfeldran@gmail.com", "sivanaltar@gmail.com"];

export default function AppointmentDetailModal({ isOpen, appointment, onEdit, onCancel, onDelete, user }) {
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(appointment || {});

  useEffect(() => {
    if (isOpen && appointment) {
      setFormData(appointment);
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onCancel();
    };
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#3a3a4a]">
            {user?.email === appointment?.user_email ? "הפגישה שלך" : `פגישה של ${appointment?.user_name}`}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-[#f8f5f0] rounded-lg">
            <X size={20} />
          </button>
        </div>

        {!editing ? (
          <div className="space-y-4">
            {/* Date & Time */}
             <div className="bg-[#e8f4f5] rounded-lg p-4">
               <p className="text-sm text-[#4a8fa0]">
                 <strong>{format(new Date(appointment.start_time), "EEEE, d MMMM HH:mm", { locale: he })}</strong>
               </p>
               {user?.email === appointment?.user_email && (
                 <p className="text-sm text-[#999] mt-1">מחיר הפגישה: 150 ₪</p>
               )}
             </div>

            {/* Details */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#999] mb-0.5">שם</p>
                <p className="text-sm font-medium text-[#3a3a4a]">{appointment.user_name}</p>
              </div>
              <div>
                <p className="text-xs text-[#999] mb-0.5">טלפון</p>
                <p className="text-sm font-medium text-[#3a3a4a]">{appointment.user_phone}</p>
              </div>
              {isAdmin && (
                <div>
                  <p className="text-xs text-[#999] mb-0.5">אימייל</p>
                  <p className="text-sm font-medium text-[#3a3a4a]">{appointment.user_email}</p>
                </div>
              )}
              {appointment.notes && (
                <div>
                  <p className="text-xs text-[#999] mb-0.5">הערות</p>
                  <p className="text-sm text-[#3a3a4a]">{appointment.notes}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 py-2 px-4 border border-[#4a8fa0] text-[#4a8fa0] rounded-lg font-medium hover:bg-[#e8f4f5] flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                ערוך
              </button>
              <button
                onClick={() => onDelete(appointment.id)}
                className="flex-1 py-2 px-4 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                  בטל פגישה
                </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Date & Time Display */}
             <div className="bg-[#e8f4f5] rounded-lg p-4">
               <p className="text-sm text-[#4a8fa0]">
                 <strong>{format(new Date(formData.start_time), "EEEE, d MMMM HH:mm", { locale: he })}</strong>
               </p>
               {user?.email === appointment?.user_email && (
                 <p className="text-sm text-[#999] mt-1">מחיר הפגישה: 150 ₪</p>
               )}
             </div>

            {/* Edit Form */}
            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">שם מלא</label>
              <input
                type="text"
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">טלפון</label>
              <input
                type="tel"
                value={formData.user_phone}
                onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a3a4a] mb-1">הערות</label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#4a8fa0] resize-none h-20"
                placeholder="הוסף הערות..."
              />
            </div>

            {/* Edit Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2 px-4 border border-[#e8e0d4] rounded-lg text-[#555] font-medium hover:bg-[#f8f5f0]"
              >
                ביטול
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2 px-4 bg-[#4a8fa0] text-white rounded-lg font-medium hover:bg-[#2d6b7a]"
              >
                שמור שינויים
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}