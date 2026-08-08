import React from "react";
import { Truck, Sun, Moon, LogOut, ChevronRight, ChevronLeft, Calendar, TrendingUp, FileSpreadsheet, Layers, Calculator, Settings, FileText, Users, Archive, KeyRound, FastForward, Rewind } from "lucide-react";
import { getShamsiWeekday, getDateHolidayInfo } from "../utils/shamsi";

interface AppHeaderProps {
  user: any; role: string | null; logout: () => void; isDarkMode: boolean; setIsDarkMode: (val: boolean) => void;
  todayShamsi: { year: number; month: number; day: number; monthName: string }; shamsiYear: number; shamsiMonth: number; shamsiDay: number; formattedDate: string;
  currentDateHolidayInfo?: { isFriday: boolean; isHoliday: boolean; holidayTitle: string | null; isNonWorking: boolean; badgeLabel: string | null };
  handlePrevDay: () => void; handleNextDay: () => void; handleJumpNextWorkingDay?: () => void; handleJumpPrevWorkingDay?: () => void; handleJumpToday?: () => void;
  setShowDatePicker: (val: boolean) => void; setTempYear: (val: number) => void; setTempMonth: (val: number) => void; setTempDay: (val: number) => void; setManualDateInput: (val: string) => void;
  activeTab: "dashboard" | "planning" | "drivers" | "warehouse" | "waybill" | "config" | "logs" | "users" | "forecast" | "backup"; setActiveTab: (tab: any) => void;
  onOpenChangePassword?: () => void; onOpenVersionHistory?: () => void;
}

export function AppHeader({ user, role, logout, isDarkMode, setIsDarkMode, todayShamsi, shamsiYear, shamsiMonth, shamsiDay, formattedDate, currentDateHolidayInfo, handlePrevDay, handleNextDay, handleJumpNextWorkingDay, handleJumpPrevWorkingDay, handleJumpToday, setShowDatePicker, setTempYear, setTempMonth, setTempDay, setManualDateInput, activeTab, setActiveTab, onOpenChangePassword }: AppHeaderProps) {
  const fallbackHolidayInfo = getDateHolidayInfo(shamsiYear, shamsiMonth, shamsiDay);
  const selectedHolidayInfo = currentDateHolidayInfo ?? fallbackHolidayInfo;
  const isSelectedDateNonWorking = selectedHolidayInfo.isNonWorking;
  const todayText = `${getShamsiWeekday(todayShamsi.year, todayShamsi.month, todayShamsi.day)} ${todayShamsi.day} ${todayShamsi.monthName}`;
  const selectedDayText = `${getShamsiWeekday(shamsiYear, shamsiMonth, shamsiDay)}، ${formattedDate}`;
  const holidayText = selectedHolidayInfo.holidayTitle || (selectedHolidayInfo.isFriday ? "جمعه — غیرکاری" : null);
  const roleLabel = role === "admin" ? "مدیر کل" : role === "sales" ? "مدیر فروش" : role === "visitor" ? "ویزیتور" : role === "production_manager" ? "مدیر تولید" : user?.driverName ? `راننده (${user.driverName})` : "راننده";

  const navItems = [
    ["dashboard", TrendingUp, "داشبورد نظارت", true], ["planning", FileSpreadsheet, "برنامه‌ریزی و فروش", role !== "driver" && role !== "visitor" && role !== "production_manager"],
    ["drivers", Truck, "عملکرد و مسیر رانندگان", role !== "visitor" && role !== "production_manager"], ["warehouse", Layers, "گزارش کلی انبار", role !== "driver"],
    ["forecast", Calculator, "پیش‌بینی نیاز انبار", role !== "driver" && role !== "visitor"], ["config", Settings, "پیکربندی پایه و کالاها", role === "admin"],
    ["logs", FileText, "لاگ تغییرات", role === "admin"], ["users", Users, "کاربران", role === "admin"], ["backup", Archive, "پشتیبان‌گیری", role === "admin"]
  ] as const;

  return <>
    <header className="bg-white/88 dark:bg-slate-900/88 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/90 py-2.5 px-3 sm:px-5 flex flex-col xl:flex-row-reverse justify-between items-stretch xl:items-center gap-2.5 no-print shrink-0 shadow-sm transition-colors duration-300" dir="rtl">
      <div className="flex items-center gap-3 min-w-0 xl:flex-1">
        <div className="bg-gradient-to-tr from-cyan-600 to-blue-700 p-2 rounded-xl shadow-md text-white shrink-0"><Truck className="w-5 h-5" /></div>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-6 truncate">سامانه یکپارچه توزیع و برنامه‌ریزی پخش برنا تجارت باور</h1>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-5 truncate">مدیریت هوشمند توزیع و برنامه‌ریزی یکپارچه</p>
        </div>
      </div>

      <div className="flex items-center flex-wrap justify-center gap-2 xl:flex-none" dir="rtl">
        <div className="flex items-center gap-2 min-w-[250px] bg-slate-50/95 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-cyan-700 dark:text-cyan-300" /></div>
          <div className="min-w-0 flex-1 text-right">
            <span className="block text-[11px] font-black text-slate-900 dark:text-slate-100 truncate font-mono" title={user?.email}>{user?.email}</span>
            <span className="block text-[9px] font-extrabold text-cyan-700 dark:text-cyan-300 mt-0.5">{roleLabel}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onOpenChangePassword} className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/40 text-slate-600 dark:text-slate-300 transition border border-slate-200 dark:border-slate-600 flex items-center justify-center cursor-pointer" title="تغییر رمز"><KeyRound className="w-3.5 h-3.5 text-cyan-600" /></button>
            <button onClick={logout} className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-600 dark:text-slate-300 transition border border-slate-200 dark:border-slate-600 flex items-center justify-center cursor-pointer" title="خروج"><LogOut className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <button onClick={() => handleJumpToday?.()} className="flex items-center gap-1.5 bg-amber-50/95 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3 py-2 shadow-sm text-amber-900 dark:text-amber-300 transition cursor-pointer" title="پرش به تاریخ امروز">
          <span className="text-[9px] font-bold opacity-70">امروز</span><span className="text-[11px] font-black whitespace-nowrap">{todayText}</span>
        </button>

        <div className="flex items-center bg-slate-100/95 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
          {handleJumpPrevWorkingDay && <button onClick={handleJumpPrevWorkingDay} className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer" title="روز کاری قبل"><Rewind className="w-3.5 h-3.5 text-cyan-600" /></button>}
          <button onClick={handlePrevDay} className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer" title="روز قبل"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => { setTempYear(shamsiYear); setTempMonth(shamsiMonth); setTempDay(shamsiDay); setManualDateInput(`${shamsiYear}/${String(shamsiMonth).padStart(2, "0")}/${String(shamsiDay).padStart(2, "0")}`); setShowDatePicker(true); }} className={`px-3 py-1.5 min-w-[165px] flex items-center justify-center gap-1.5 rounded-lg transition font-extrabold cursor-pointer ${isSelectedDateNonWorking ? "bg-rose-100/95 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800" : "text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700"}`} title="انتخاب تاریخ">
            <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" /><div className="flex flex-col items-center leading-tight"><span className="text-[11px] sm:text-xs font-black">{selectedDayText}</span>{holidayText && <span className="text-[8px] font-black text-rose-700 dark:text-rose-300 mt-0.5 truncate max-w-[140px]">{holidayText}</span>}</div>
          </button>
          <button onClick={handleNextDay} className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer" title="روز بعد"><ChevronLeft className="w-4 h-4" /></button>
          {handleJumpNextWorkingDay && <button onClick={handleJumpNextWorkingDay} className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer" title="روز کاری بعد"><FastForward className="w-3.5 h-3.5 text-cyan-600" /></button>}
        </div>

        <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-9 h-9 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center justify-center cursor-pointer shadow-sm" title={isDarkMode ? "حالت روز" : "حالت شب"}>
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>

    <nav className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 overflow-x-auto flex justify-start items-center gap-1.5 no-print shrink-0 py-2 sm:py-2.5" dir="rtl">
      {navItems.map(([key, Icon, label, visible]) => visible && <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${activeTab === key ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}><Icon className="w-4 h-4" />{label}</button>)}
    </nav>
  </>;
}
