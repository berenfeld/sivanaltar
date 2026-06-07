import React, { useState } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Calendar } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

export default function DatePickerWithRanges({ currentDate, onDateChange, isMobile }) {
  const { lang, dir } = useLang();
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  let sundayDate = new Date(currentDate);
  while (sundayDate.getDay() !== 0) {
    sundayDate = new Date(sundayDate.getTime() - 86400000);
  }

  const weekStart = startOfWeek(sundayDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(sundayDate, { weekStartsOn: 0 });

  const handleDateChange = (type, e) => {
    const selectedDate = new Date(e.target.value);
    let selectedSunday = selectedDate;
    while (selectedSunday.getDay() !== 0) {
      selectedSunday = new Date(selectedSunday.getTime() - 86400000);
    }
    onDateChange(selectedSunday);
    if (type === "from") setShowFromPicker(false);
    if (type === "to") setShowToPicker(false);
  };

  if (isMobile) {
    return (
      <div dir={dir} className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
        <button
          onClick={() => setShowFromPicker(!showFromPicker)}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#e8e0d4] rounded-lg hover:border-[#4a8fa0] transition-colors text-[#3a3a4a] text-sm"
        >
          <Calendar size={16} className="text-[#4a8fa0]" />
        </button>
        {showFromPicker && (
          <input
            type="date"
            value={format(sundayDate, "yyyy-MM-dd")}
            onChange={(e) => handleDateChange("from", e)}
            className="px-2 py-1 border-2 border-[#4a8fa0] rounded text-xs"
            autoFocus
            onBlur={() => setShowFromPicker(false)}
          />
        )}
      </div>
    );
  }

  // In LTR: show start — end. In RTL: show end — start (right-to-left reading order).
  const startBtn = (
    <div className="relative">
      <button
        onClick={() => setShowFromPicker(!showFromPicker)}
        className="text-sm font-medium text-[#3a3a4a] hover:text-[#4a8fa0] transition-colors"
      >
        {format(weekStart, "dd/MM/yyyy")}
      </button>
      {showFromPicker && (
        <div className="absolute top-full mt-2 right-0 z-50">
          <input
            type="date"
            value={format(sundayDate, "yyyy-MM-dd")}
            onChange={(e) => handleDateChange("from", e)}
            className="px-3 py-2 border-2 border-[#4a8fa0] rounded-lg text-[#3a3a4a] bg-white shadow-lg"
            autoFocus
            onBlur={() => setTimeout(() => setShowFromPicker(false), 200)}
          />
        </div>
      )}
    </div>
  );

  const endBtn = (
    <div className="relative">
      <button
        onClick={() => setShowToPicker(!showToPicker)}
        className="text-sm font-medium text-[#3a3a4a] hover:text-[#4a8fa0] transition-colors"
      >
        {format(weekEnd, "dd/MM/yyyy")}
      </button>
      {showToPicker && (
        <div className="absolute top-full mt-2 right-0 z-50">
          <input
            type="date"
            value={format(weekEnd, "yyyy-MM-dd")}
            onChange={(e) => handleDateChange("to", e)}
            className="px-3 py-2 border-2 border-[#4a8fa0] rounded-lg text-[#3a3a4a] bg-white shadow-lg"
            autoFocus
            onBlur={() => setTimeout(() => setShowToPicker(false), 200)}
          />
        </div>
      )}
    </div>
  );

  return (
    <div dir={dir} className="flex items-center gap-6 px-6 py-4">
      <div className="flex items-center gap-4">
        {dir === "rtl" ? (
          <>{endBtn}<span className="text-[#999] font-medium">-</span>{startBtn}</>
        ) : (
          <>{startBtn}<span className="text-[#999] font-medium">-</span>{endBtn}</>
        )}
      </div>
    </div>
  );
}
