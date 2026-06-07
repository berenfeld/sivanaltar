import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ChevronLeft, ChevronRight, Plus, X, Settings, Calendar as CalendarIcon } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, startOfDay, endOfDay, setHours, setMinutes, differenceInDays, startOfToday, isSameDay } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { useLang } from "@/lib/LanguageContext";
import ConfirmModal from "../components/ConfirmModal";
import NotifyModal from "../components/NotifyModal";
import BookingModal from "../components/calendar/BookingModal";
import AdminSettingsModal from "../components/calendar/AdminSettingsModal";
import AppointmentDetailModal from "../components/calendar/AppointmentDetailModal";
import AdminAppointmentModal from "../components/calendar/AdminAppointmentModal";
import { generateAppointmentEmail, generateCancellationEmail, generateICS } from "../components/calendar/EmailTemplate";
import DatePickerWithRanges from "../components/calendar/DatePickerWithRanges";
import MonthView from "../components/calendar/MonthView";
import SlotButton from "../components/calendar/SlotButton";

const ADMIN_EMAILS = ["berenfeldran@gmail.com", "sivanaltar@gmail.com"];
const DEFAULT_WORKING_HOURS = {
  1: { start_time: "17:00", end_time: "21:00", is_available: true } // Monday
};

export default function Calendar() {
  const { t } = useTranslation();
  const { lang, dir } = useLang();
  const dateLocale = lang === 'en' ? enUS : he;
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [workingHours, setWorkingHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [bookingModal, setBookingModal] = useState({ open: false, slot: null });
  const [settingsModal, setSettingsModal] = useState(false);
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null });
  const [detailModal, setDetailModal] = useState({ open: false, appointment: null });
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [weeklyLimitModal, setWeeklyLimitModal] = useState(false);
  const [bookingSuccessModal, setBookingSuccessModal] = useState(false);
  const [cancelSuccessModal, setCancelSuccessModal] = useState(false);
  const [adminAppointmentModal, setAdminAppointmentModal] = useState({ open: false, slot: null });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allAppointments, hours] = await Promise.all([
          base44.entities.Appointment.list(),
          base44.entities.WorkingHours.list()
        ]);

        setAppointments(allAppointments.filter(a => a.status === "booked"));
        setWorkingHours(hours.length > 0 ? hours : initializeDefaultHours());
      } catch (error) {
        console.error("Error loading calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const initializeDefaultHours = async () => {
    const defaults = Object.entries(DEFAULT_WORKING_HOURS).map(([day, hours]) => ({
      day_of_week: parseInt(day),
      ...hours
    }));
    await Promise.all(defaults.map(h => base44.entities.WorkingHours.create(h)));
    return defaults;
  };

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const DAY_NAMES = lang === 'en'
    ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    : ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const welcomeText = useMemo(() => {
    const available = workingHours.filter(h => h.is_available);
    if (available.length === 0) return t("calendar_welcome_default");

    const seen = new Set();
    const unique = available.filter(h => {
      if (seen.has(h.day_of_week)) return false;
      seen.add(h.day_of_week);
      return true;
    });

    const parts = lang === 'en'
      ? unique.map(h => `${DAY_NAMES[h.day_of_week]} ${h.start_time}–${h.end_time}`)
      : unique.map(h => `ימי ${DAY_NAMES[h.day_of_week]} בשעות ${h.start_time}–${h.end_time}`);
    const daysText = lang === 'en'
      ? (parts.length === 1 ? parts[0] : parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1])
      : (parts.length === 1 ? parts[0] : parts.slice(0, -1).join(", ") + " ו" + parts[parts.length - 1]);
    return t("calendar_welcome_hours").replace("{days}", daysText);
  }, [workingHours, lang]);

  const getSlots = (date) => {
    const dayOfWeek = date.getDay();
    const hours = workingHours.find(h => h.day_of_week === dayOfWeek);

    if (!hours || !hours.is_available || !hours.start_time || !hours.end_time) return [];

    const [startHour, startMin] = hours.start_time.split(":").map(Number);
    const [endHour, endMin] = hours.end_time.split(":").map(Number);

    const slots = [];
    let currentStart = new Date(date);
    currentStart.setHours(startHour, startMin, 0, 0);

    const rangeEnd = new Date(date);
    rangeEnd.setHours(endHour, endMin, 0, 0);

    while (currentStart < rangeEnd) {
      const slotStart = new Date(currentStart);
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(slotStart.getHours() + 1, slotStart.getMinutes(), 0, 0);

      // Only add slot if it fits within the range
      if (slotEnd > rangeEnd) break;

      const isBooked = appointments.some(
        a => new Date(a.start_time) <= slotStart && new Date(a.end_time) > slotStart
      );

      slots.push({
        start: slotStart,
        end: slotEnd,
        isBooked,
        appointment: appointments.find(
          a => new Date(a.start_time) <= slotStart && new Date(a.end_time) > slotStart
        )
      });

      currentStart = new Date(slotEnd);
    }

    return slots;
  };

  const userHasAnyAppointment = () => {
    if (!user) return null;
    return appointments.find(a => a.user_email === user.email);
  };

  const handleSlotClick = (slot) => {
    if (!user) {
      setLoginPrompt(true);
      return;
    }

    // If appointment exists, show details
    if (slot.appointment) {
      setDetailModal({ open: true, appointment: slot.appointment });
      return;
    }

    // Empty slot - admin creates, regular users book
    if (isAdmin) {
      setAdminAppointmentModal({ open: true, slot });
    } else {
      // Can only book one meeting ever (for non-admin)
      if (userHasAnyAppointment()) {
        setWeeklyLimitModal(true);
        return;
      }
      setBookingModal({ open: true, slot });
    }
  };

  const handleBooking = async (data) => {
    if (!user) return;

    const appointment = {
      user_email: user.email,
      user_name: data.name,
      user_phone: data.phone,
      appointment_location: data.location,
      start_time: bookingModal.slot.start.toISOString(),
      end_time: bookingModal.slot.end.toISOString(),
      notes: data.purpose,
      price_nis: 150
    };

    const created = await base44.entities.Appointment.create(appointment);
    setAppointments([...appointments, created]);

    // Send email to admins with HTML template and ICS data
    const emailBody = generateAppointmentEmail(created, user);
    const icsData = generateICS(created);
    
    await Promise.all([
      base44.integrations.Core.SendEmail({ to: "berenfeldran@gmail.com", subject: `פגישה חדשה - ${created.user_name}`, body: emailBody }),
      base44.integrations.Core.SendEmail({ to: "sivanaltar@gmail.com", subject: `פגישה חדשה - ${created.user_name}`, body: emailBody }),
    ]);

    setBookingModal({ open: false, slot: null });
    setBookingSuccessModal(true);
  };

  const handleAdminBooking = async (data) => {
    if (!user) return;

    const appointment = {
      user_email: data.email,
      user_name: data.name,
      user_phone: data.phone,
      appointment_location: data.location,
      start_time: adminAppointmentModal.slot.start.toISOString(),
      end_time: adminAppointmentModal.slot.end.toISOString(),
      notes: data.notes,
      price_nis: 150
    };

    const created = await base44.entities.Appointment.create(appointment);
    setAppointments([...appointments, created]);

    setAdminAppointmentModal({ open: false, slot: null });
  };



  const handleCancelAppointment = async (id) => {
    const appointment = appointments.find(a => a.id === id);
    await base44.entities.Appointment.update(id, { status: "cancelled" });
    setAppointments(appointments.filter(a => a.id !== id));
    setCancelModal({ open: false, appointmentId: null });
    setDetailModal({ open: false, appointment: null });
    setCancelSuccessModal(true);

    // Send cancellation emails to admins and the user
    if (appointment) {
      const cancelEmailBody = generateCancellationEmail(appointment);
      await Promise.all([
        base44.integrations.Core.SendEmail({ to: "berenfeldran@gmail.com", subject: `פגישה בוטלה - ${appointment.user_name}`, body: cancelEmailBody }),
        base44.integrations.Core.SendEmail({ to: "sivanaltar@gmail.com", subject: `פגישה בוטלה - ${appointment.user_name}`, body: cancelEmailBody }),
        base44.integrations.Core.SendEmail({ to: appointment.user_email, subject: `הפגישה שלך בוטלה`, body: cancelEmailBody }),
      ]);
    }
  };

  const handleEditAppointment = async (updatedData) => {
    const { id } = detailModal.appointment;
    await base44.entities.Appointment.update(id, {
      user_name: updatedData.user_name,
      user_phone: updatedData.user_phone,
      appointment_type: updatedData.appointment_type,
      notes: updatedData.notes
    });

    // Update local state
    const { appointment_type, ...cleanData } = updatedData;
    const updatedAppointments = appointments.map(a =>
      a.id === id ? { ...a, ...cleanData } : a
    );
    setAppointments(updatedAppointments);
    setDetailModal({ open: false, appointment: null });

    // Send updated email to admins with HTML template
    const updated = updatedAppointments.find(a => a.id === id);
    const emailBody = generateAppointmentEmail(updated, user);
    
    await Promise.all([
      base44.integrations.Core.SendEmail({ to: "berenfeldran@gmail.com", subject: `פגישה עודכנה - ${updated.user_name}`, body: emailBody }),
      base44.integrations.Core.SendEmail({ to: "sivanaltar@gmail.com", subject: `פגישה עודכנה - ${updated.user_name}`, body: emailBody }),
    ]);
  };

  if (loading) return <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">{t("calendar_loading")}</div>;

  return (
    <div dir={dir} className="min-h-screen bg-[#f8f5f0]">
      <PageHeader
        icon={CalendarIcon}
        title={t("calendar_title")}
        subtitle={t("calendar_subtitle")}
      />

      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Admin Settings Button */}
           {isAdmin && (
             <div className="flex justify-start mb-6">
               <button
                 onClick={() => setSettingsModal(true)}
                 className="bg-[#4a8fa0] text-white px-4 py-2 rounded-lg flex items-center gap-2"
               >
                 <Settings size={18} />
                 {t("calendar_settings")}
               </button>
             </div>
           )}

          <div className="bg-white rounded-lg p-4 mb-6 border border-[#e8e0d4]">
            <p className="text-[#3a3a4a] leading-relaxed">{welcomeText}</p>
          </div>

        {/* Legend */}
        <div className="bg-white rounded-lg p-4 mb-6 flex gap-6 justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#e8f4f5] border border-[#4a8fa0] rounded" />
            <span className="text-sm text-[#555]">{t("calendar_legend_free")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#f0ebe3] rounded" />
            <span className="text-sm text-[#555]">{t("calendar_legend_booked")}</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-blue-100 rounded" />
             <span className="text-sm text-[#555]">{t("calendar_legend_mine")}</span>
           </div>
        </div>

        {/* Navigation & Date Picker */}
         <div className="hidden md:flex items-center justify-center gap-4 mb-6" dir="ltr">
           <button
             onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
             className="p-2 hover:bg-white rounded-lg"
           >
             <ChevronLeft size={24} />
           </button>

           <DatePickerWithRanges currentDate={currentDate} onDateChange={setCurrentDate} isMobile={isMobile} />

           <button
             onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
             className="p-2 hover:bg-white rounded-lg"
           >
             <ChevronRight size={24} />
           </button>
         </div>

         {/* Calendar View */}
         {isMobile ? (
           <MonthView
             currentDate={currentDate}
             onMonthChange={setCurrentDate}
             getSlots={getSlots}
             onSlotClick={handleSlotClick}
             isAdmin={isAdmin}
             user={user}
             appointments={appointments}
             dateLocale={dateLocale}
           />
         ) : (
           <WeekView weekStart={startOfWeek(currentDate)} getSlots={getSlots} onSlotClick={handleSlotClick} isAdmin={isAdmin} user={user} appointments={appointments} workingHours={workingHours} dateLocale={dateLocale} />
         )}
         </div>
         </div>

      <BookingModal
        isOpen={bookingModal.open}
        slot={bookingModal.slot}
        onBook={handleBooking}
        onCancel={() => setBookingModal({ open: false, slot: null })}
        user={user}
      />

      <AdminAppointmentModal
        isOpen={adminAppointmentModal.open}
        slot={adminAppointmentModal.slot}
        onBook={handleAdminBooking}
        onCancel={() => setAdminAppointmentModal({ open: false, slot: null })}
      />

      {settingsModal && (
        <AdminSettingsModal
          workingHours={workingHours}
          onUpdate={(hours) => {
            setWorkingHours(hours);
            setSettingsModal(false);
          }}
          onClose={() => setSettingsModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={cancelModal.open}
        title={t("calendar_cancel_title")}
        message={t("calendar_cancel_message")}
        onConfirm={() => handleCancelAppointment(cancelModal.appointmentId)}
        onCancel={() => setCancelModal({ open: false, appointmentId: null })}
        confirmLabel={t("calendar_cancel_confirm")}
        confirmClassName="bg-red-500 hover:bg-red-600 text-white"
      />

      {loginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-sm text-center" dir={dir}>
            <h3 className="text-lg font-bold mb-2">{t("calendar_login_title")}</h3>
            <p className="text-[#777] mb-4">{t("calendar_login_desc")}</p>
            <div className="flex gap-3">
              <button onClick={() => setLoginPrompt(false)} className="flex-1 py-2 px-4 border border-[#e8e0d4] rounded-lg hover:bg-[#f8f5f0]">
                {t("cancel")}
              </button>
              <button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="flex-1 py-2 px-4 bg-[#4a8fa0] text-white rounded-lg hover:bg-[#2d6b7a]">
                {t("calendar_login_btn")}
              </button>
            </div>
          </div>
        </div>
      )}

      <NotifyModal
        isOpen={weeklyLimitModal}
        title={t("calendar_limit_title")}
        message={t("calendar_limit_message")}
        onConfirm={() => setWeeklyLimitModal(false)}
        confirmLabel={t("calendar_close")}
      />

      <NotifyModal
        isOpen={bookingSuccessModal}
        title={t("calendar_success_title")}
        message={t("calendar_success_message")}
        onConfirm={() => setBookingSuccessModal(false)}
        confirmLabel={t("calendar_close")}
      />

      <NotifyModal
        isOpen={cancelSuccessModal}
        title={t("calendar_cancelled_title")}
        message={t("calendar_cancelled_message")}
        onConfirm={() => setCancelSuccessModal(false)}
        confirmLabel={t("calendar_close")}
      />

      <AppointmentDetailModal
        isOpen={detailModal.open}
        appointment={detailModal.appointment}
        onEdit={handleEditAppointment}
        onCancel={() => setDetailModal({ open: false, appointment: null })}
        onDelete={() => setCancelModal({ open: true, appointmentId: detailModal.appointment.id })}
        user={user}
      />
    </div>
  );
}


function DayView({ date, slots, onSlotClick, isAdmin, user, appointments }) {
  const userAppt = user ? appointments.find(a => a.user_email === user.email && isSameDay(new Date(a.start_time), date)) : null;

  return (
    <div className="bg-white rounded-xl p-4">
      <h2 className="text-xl font-semibold mb-4">{format(date, "EEEE, d MMMM yyyy", { locale: he })}</h2>
      <div className="space-y-2">
        {slots.length === 0 ? (
          <p className="text-[#999]">אין שעות פתוחות ביום זה</p>
        ) : (
          slots.map((slot, idx) => (
            <SlotButton
              key={idx}
              slot={slot}
              onClick={() => onSlotClick(slot)}
              isAdmin={isAdmin}
              isUserAppt={userAppt && slot.appointment && userAppt.id === slot.appointment.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

function WeekView({ weekStart, getSlots, onSlotClick, isAdmin, user, appointments, workingHours, dateLocale }) {
  const { t } = useTranslation();
  const locale = dateLocale || he;
  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart) });
  const today = startOfToday();

  const availableHours = workingHours.filter(h => h.is_available);
  if (availableHours.length === 0) {
    return <div className="bg-white rounded-xl p-6 text-center text-[#999]">{t("calendar_no_hours")}</div>;
  }

  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };
  const minStart = Math.min(...availableHours.map(h => toMinutes(h.start_time)));
  const maxEnd = Math.max(...availableHours.map(h => toMinutes(h.end_time)));

  // Build 30-min time rows
  const timeRows = [];
  for (let m = minStart; m < maxEnd; m += 30) {
    timeRows.push(m); // minutes from midnight
  }

  const formatMinutes = (m) => {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // Build slot map per day: key = start minutes -> slot
  const getDaySlotMap = (day) => {
    const slots = getSlots(day);
    const map = {};
    slots.forEach(slot => {
      const startMin = slot.start.getHours() * 60 + slot.start.getMinutes();
      const endMin = slot.end.getHours() * 60 + slot.end.getMinutes();
      const durationRows = Math.round((endMin - startMin) / 30); // how many 30-min rows this slot spans
      map[startMin] = { slot, durationRows };
      // Mark continuation rows so we skip them
      for (let r = 1; r < durationRows; r++) {
        map[startMin + r * 30] = { continuation: true };
      }
    });
    return map;
  };

  // For each day, figure out which minute ranges are within working hours
  const dayInRange = (day, rowMinutes) => {
    const dayOfWeek = day.getDay();
    const wh = workingHours.find(h => h.day_of_week === dayOfWeek && h.is_available);
    if (!wh) return false;
    const start = toMinutes(wh.start_time);
    const end = toMinutes(wh.end_time);
    return rowMinutes >= start && rowMinutes < end;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* Day headers */}
      <div className="grid border-b border-[#e8e0d4]" style={{ gridTemplateColumns: "3rem repeat(7, 1fr)" }}>
        <div className="border-r border-[#e8e0d4]" />
        {days.map(day => (
          <div key={day.toString()} className="p-3 text-center border-r border-[#e8e0d4] last:border-r-0">
            <div className="font-semibold text-sm">{format(day, "EEE", { locale })}</div>
            <div className={`text-lg ${isSameDay(day, today) ? "text-[#4a8fa0] font-bold" : "text-[#3a3a4a]"}`}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid - CSS grid with explicit rows */}
      <div className="md:overflow-y-visible md:max-h-none overflow-y-auto max-h-[70vh]">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3rem repeat(7, 1fr)",
          gridTemplateRows: `repeat(${timeRows.length}, 2.5rem)`,
        }}
      >
        {timeRows.map((rowMin, rowIdx) => {
          const rowStart = rowIdx + 1;
          return (
            <React.Fragment key={rowMin}>
              {/* Time label column */}
              <div
                className="border-r border-b border-[#e8e0d4] text-xs text-[#999] flex items-start justify-center pt-1 select-none"
                style={{ gridColumn: 1, gridRow: rowStart }}
              >
                {rowMin % 60 === 0 ? formatMinutes(rowMin) : ""}
              </div>

              {days.map((day, dayIdx) => {
                const slotMap = getDaySlotMap(day);
                const inRange = dayInRange(day, rowMin);
                const entry = slotMap[rowMin];
                const col = dayIdx + 2;
                const userAppt = user ? appointments.find(a => a.user_email === user.email && isSameDay(new Date(a.start_time), day)) : null;

                if (entry?.continuation) return null; // hidden behind spanning slot

                if (!inRange) {
                  return (
                    <div
                      key={day.toString()}
                      className="border-r border-b border-[#e8e0d4] last:border-r-0 bg-[#fafaf9]"
                      style={{ gridColumn: col, gridRow: rowStart }}
                    />
                  );
                }

                if (entry?.slot) {
                  const { slot, durationRows } = entry;
                  const isUserAppt = userAppt && slot.appointment && userAppt.id === slot.appointment.id;
                  return (
                    <div
                      key={day.toString()}
                      className="border-r border-b border-[#e8e0d4] last:border-r-0 p-0.5"
                      style={{ gridColumn: col, gridRow: `${rowStart} / span ${durationRows}` }}
                    >
                      <SlotButton
                        slot={slot}
                        onClick={() => onSlotClick(slot)}
                        isAdmin={isAdmin}
                        isUserAppt={isUserAppt}
                      />
                    </div>
                  );
                }

                // In range, no slot
                return (
                  <div
                    key={day.toString()}
                    className="border-r border-b border-[#e8e0d4] last:border-r-0 bg-[#f8f5f0]"
                    style={{ gridColumn: col, gridRow: rowStart }}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
      </div>
    </div>
  );
}