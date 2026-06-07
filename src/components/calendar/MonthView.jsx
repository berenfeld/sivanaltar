import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfDay, isToday, getDay } from "date-fns";
import { he } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SlotButton from "./SlotButton";
import { useTranslation } from "react-i18next";

export default function MonthView({ currentDate, onMonthChange, getSlots, onSlotClick, isAdmin, user, appointments, dateLocale }) {
  const { t } = useTranslation();
  const locale = dateLocale || he;
  const [selectedDay, setSelectedDay] = useState(null);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Get all days in month grid (including prev/next month days)
  const startDate = new Date(monthStart);
  startDate.setDate(1);
  const dayOfWeek = getDay(startDate);
  startDate.setDate(startDate.getDate() - dayOfWeek); // Start from Sunday

  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - getDay(endDate))); // End on Saturday

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const dayNames = t("cal_settings_days", { returnObjects: true }) || ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const countAvailableSlots = (day) => {
    const slots = getSlots(day);
    return slots.filter(s => !s.isBooked).length;
  };

  const isCurrentMonth = (day) => {
    return day.getMonth() === currentDate.getMonth();
  };

  const handleDayClick = (day) => {
    if (isCurrentMonth(day) && countAvailableSlots(day) > 0) {
      setSelectedDay(day);
    }
  };

  const selectedDaySlots = selectedDay ? getSlots(selectedDay) : [];
  const userApptOnSelectedDay = user && selectedDay
    ? appointments.find(a => a.user_email === user.email && isSameDay(new Date(a.start_time), selectedDay))
    : null;

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#e8e0d4]">
        <button
          onClick={() => onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          className="p-1.5 hover:bg-[#f8f5f0] rounded-lg"
        >
          <ChevronRight size={20} />
        </button>
        <h2 className="text-lg font-bold text-[#3a3a4a]">
          {format(currentDate, "MMMM yyyy", { locale })}
        </h2>
        <button
          onClick={() => onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          className="p-1.5 hover:bg-[#f8f5f0] rounded-lg"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 p-2 bg-[#f8f5f0]">
        {dayNames.map((name) => (
          <div key={name} className="text-center text-xs font-semibold text-[#4a8fa0] py-2">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="p-2 space-y-1">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const availableCount = countAvailableSlots(day);
              const isCurrent = isCurrentMonth(day);
              const isToday_ = isToday(day);

              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  disabled={!isCurrent || availableCount === 0}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 text-xs transition-colors ${
                    !isCurrent
                      ? "bg-[#f0f0f0] text-[#999]"
                      : availableCount === 0
                      ? "bg-[#f5f5f5] text-[#999] cursor-not-allowed"
                      : isToday_
                      ? "bg-[#4a8fa0] text-white font-bold"
                      : "bg-[#e8f4f5] text-[#4a8fa0] hover:bg-[#d0e8ed] font-medium"
                  }`}
                >
                  <div className="font-semibold">{format(day, "d")}</div>
                  {isCurrent && availableCount > 0 && (
                    <div className="text-[10px] opacity-80">{availableCount}</div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected day slots section */}
      {selectedDay && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-[#e8e0d4]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#3a3a4a]">
              {format(selectedDay, "EEEE, d MMMM", { locale })}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1.5 hover:bg-[#f8f5f0] rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

            {userApptOnSelectedDay && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
                <p className="text-blue-900 font-medium">{t("cal_month_your_appt")}</p>
                <p className="text-blue-800">{format(new Date(userApptOnSelectedDay.start_time), "HH:mm")}</p>
              </div>
            )}

            <div className="space-y-2">
              {selectedDaySlots.length === 0 ? (
                <p className="text-[#999] text-center py-4">{t("cal_month_no_slots")}</p>
              ) : (
                selectedDaySlots.map((slot, idx) => {
                  const isUserAppt = userApptOnSelectedDay && slot.appointment?.id === userApptOnSelectedDay.id;
                  return (
                    <SlotButton
                      key={idx}
                      slot={slot}
                      onClick={() => {
                        onSlotClick(slot);
                        setSelectedDay(null);
                      }}
                      isAdmin={isAdmin}
                      isUserAppt={isUserAppt}
                      timeLabel={format(slot.start, "HH:mm")}
                      fullWidth
                    />
                  );
                })
              )}
            </div>
        </div>
      )}
    </div>
  );
}