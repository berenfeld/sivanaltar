import { useTranslation } from "react-i18next";

export default function SlotButton({ slot, onClick, isAdmin, isUserAppt, timeLabel, fullWidth }) {
  const { t } = useTranslation();
  const canBook = !slot.isBooked || isAdmin || isUserAppt;
  const isBookedByOther = slot.isBooked && !isUserAppt;

  const buttonText = isUserAppt
    ? t("cal_slot_mine")
    : isBookedByOther && isAdmin
    ? slot.appointment?.user_name || t("cal_slot_booked")
    : isBookedByOther
    ? t("cal_slot_booked")
    : isAdmin && !slot.isBooked
    ? t("cal_slot_add")
    : t("cal_slot_book");

  return (
    <button
      onClick={() => canBook && onClick()}
      disabled={isBookedByOther && !isAdmin}
      className={`w-full h-full px-2 py-0.5 text-xs font-medium transition-colors text-right rounded ${
        isUserAppt
          ? "bg-blue-100 text-blue-900"
          : isBookedByOther && !isAdmin
          ? "bg-[#f0ebe3] text-[#999] cursor-not-allowed"
          : isBookedByOther && isAdmin
          ? "bg-[#f0ebe3] text-[#3a3a4a] hover:bg-[#e5dfd5] cursor-pointer"
          : "bg-[#e8f4f5] text-[#4a8fa0] hover:bg-[#d0e8ed]"
      }`}
    >
      {timeLabel && <div className="text-xs opacity-60">{timeLabel}</div>}
      {buttonText}
    </button>
  );
}
