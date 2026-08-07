import React from "react";
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { SHAMSI_MONTHS, getShamsiWeekday, isFridayShamsi, getDateHolidayInfo } from "../utils/shamsi";
import { isOfficialHoliday, getHolidayTitle } from "../utils/holidays";

interface DatePickerModalProps {
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  tempYear: number;
  setTempYear: (year: number) => void;
  tempMonth: number;
  setTempMonth: (month: number) => void;
  tempDay: number;
  setTempDay: (day: number) => void;
  manualDateInput: string;
  setManualDateInput: (input: string) => void;
  todayShamsi: { year: number; month: number; day: number };
  setShamsiYear: (year: number) => void;
  setShamsiMonth: (month: number) => void;
  setShamsiDay: (day: number) => void;
  showNotification: (type: "success" | "error" | "info", message: string) => void;
}

export function DatePickerModal({
  showDatePicker,
  setShowDatePicker,
  tempYear,
  setTempYear,
  tempMonth,
  setTempMonth,
  tempDay,
  setTempDay,
  manualDateInput,
  setManualDateInput,
  todayShamsi,
  setShamsiYear,
  setShamsiMonth,
  setShamsiDay,
  showNotification
}: DatePickerModalProps) {
  if (!showDatePicker) return null;

  const tempStatus = getDateHolidayInfo(tempYear, tempMonth, tempDay);
  const tempWeekday = getShamsiWeekday(tempYear, tempMonth, tempDay);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-xs" id="datepicker-modal">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200" dir="rtl">
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-400 border border-cyan-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">انتخاب و تغییر تاریخ تقویم</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">پشتیبانی از پرش تعطیلات و روزهای کاری</p>
            </div>
          </div>
          <button
            onClick={() => setShowDatePicker(false)}
            className="text-slate-400 hover:text-white transition text-2xl font-bold cursor-pointer leading-none px-2 py-1 rounded-lg hover:bg-slate-800"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active preview badge */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
            tempStatus.isNonWorking
              ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200"
              : "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-900/50 text-cyan-900 dark:text-cyan-200"
          }`}>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold block opacity-70">تاریخ انتخاب شده فعلی:</span>
              <div className="text-sm font-black flex items-center gap-2">
                <span>{tempWeekday}،</span>
                <span className="font-mono">{tempYear}/{String(tempMonth).padStart(2, "0")}/{String(tempDay).padStart(2, "0")}</span>
              </div>
            </div>
            {tempStatus.badgeLabel && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-rose-500 text-white shadow-xs">
                {tempStatus.badgeLabel}
              </span>
            )}
          </div>

          {/* Select dropdowns */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">انتخاب از تقویم شمسی:</span>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">سال</label>
                <select
                  value={tempYear}
                  onChange={(e) => setTempYear(parseInt(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {Array.from({ length: 15 }, (_, i) => 1400 + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">ماه</label>
                <select
                  value={tempMonth}
                  onChange={(e) => {
                    const m = parseInt(e.target.value);
                    setTempMonth(m);
                    const maxDays = SHAMSI_MONTHS.find((mon) => mon.id === m)?.days || 30;
                    if (tempDay > maxDays) {
                      setTempDay(maxDays);
                    }
                  }}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {SHAMSI_MONTHS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">روز</label>
                <select
                  value={tempDay}
                  onChange={(e) => setTempDay(parseInt(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {Array.from(
                    { length: SHAMSI_MONTHS.find((m) => m.id === tempMonth)?.days || 30 },
                    (_, i) => i + 1
                  ).map((d) => {
                    const dayStatus = getDateHolidayInfo(tempYear, tempMonth, d);
                    return (
                      <option key={d} value={d} className={dayStatus.isNonWorking ? "text-rose-600 font-black" : ""}>
                        {d} {dayStatus.isFriday ? "(جمعه)" : dayStatus.isHoliday ? "(تعطیل)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold">یا ورود مستقیم</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Manual input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">وارد کردن دستی تاریخ (مثال: ۱۴۰۵/۰۵/۱۵):</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="1405/05/15"
                value={manualDateInput}
                onChange={(e) => setManualDateInput(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold text-center tracking-widest rounded-xl p-2.5 flex-1 focus:outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900"
              />
              <button
                onClick={() => {
                  let cleaned = manualDateInput.replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1776));
                  const parts = cleaned.split(/[\/\- \s]+/);
                  if (parts.length === 3) {
                    const y = parseInt(parts[0]);
                    const m = parseInt(parts[1]);
                    const d = parseInt(parts[2]);
                    if (y >= 1390 && y <= 1420 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
                      setTempYear(y);
                      setTempMonth(m);
                      const maxDays = SHAMSI_MONTHS.find((mon) => mon.id === m)?.days || 30;
                      setTempDay(d > maxDays ? maxDays : d);
                      showNotification("success", "تاریخ وارد شده با موفقیت قالب‌بندی و تنظیم شد.");
                    } else {
                      showNotification("error", "تاریخ نامعتبر است! لطفا سال را بین ۱۳۹۰ تا ۱۴۲۰ و ماه را بین ۱ تا ۱۲ و روز را بین ۱ تا ۳۱ وارد کنید.");
                    }
                  } else {
                    showNotification("error", "فرمت تاریخ معتبر نیست. نمونه معتبر: 1405/05/15");
                  }
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                بررسی
              </button>
            </div>
          </div>

          {/* Quick jumps */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => {
                setTempYear(todayShamsi.year);
                setTempMonth(todayShamsi.month);
                setTempDay(todayShamsi.day);
                setManualDateInput(`${todayShamsi.year}/${String(todayShamsi.month).padStart(2, '0')}/${String(todayShamsi.day).padStart(2, '0')}`);
              }}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              📅 امروز ({todayShamsi.year}/{String(todayShamsi.month).padStart(2, "0")}/{String(todayShamsi.day).padStart(2, "0")})
            </button>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setShamsiYear(tempYear);
                setShamsiMonth(tempMonth);
                setShamsiDay(tempDay);
                setShowDatePicker(false);
                showNotification("success", `تاریخ برنامه به ${tempYear}/${String(tempMonth).padStart(2, '0')}/${String(tempDay).padStart(2, '0')} تغییر یافت.`);
              }}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold rounded-xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              تایید و نمایش برنامه این تاریخ
            </button>
            <button
              onClick={() => setShowDatePicker(false)}
              className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
