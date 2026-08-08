import React from "react";
import { Truck, Sun, Moon, LogOut, ChevronRight, ChevronLeft, Calendar, TrendingUp, FileSpreadsheet, Layers, Calculator, Settings, FileText, Users, Archive, KeyRound, FastForward, Rewind } from "lucide-react";
import { getShamsiWeekday } from "../utils/shamsi";

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
  const isSelectedDateNonWorking = currentDateHolidayInfo?.isNonWorking;
  const todayText = `${getShamsiWeekday(todayShamsi.year, todayShamsi.month, todayShamsi.day)} ${todayShamsi.day} ${todayShamsi.monthName}`;
  const selectedDayText = `${getShamsiWeekday(shamsiYear, shamsiMonth, shamsiDay)}، ${formattedDate}`;
  const holidayText = currentDateHolidayInfo?.holidayTitle || (currentDateHolidayInfo?.isFriday ? "جمعه" : null);
  const navItems = [
    ["dashboard", TrendingUp, "داشبورد نظارت", true], ["planning", FileSpreadsheet, "برنامه‌ریزی و فروش", role !== "driver" && role !== "visitor" && role !== "production_manager"],
    ["drivers", Truck, "عملکرد و مسیر رانندگان", role !== "visitor" && role !== "production_manager"], ["warehouse", Layers, "گزارش کلی انبار", role !== "driver"],
    ["forecast", Calculator, "پیش‌بینی نیاز انبار", role !== "driver" && role !== "visitor"], ["config", Settings, "پیکربندی پایه و کالاها", role === "admin"],
    ["logs", FileText, "لاگ تغییرات", role === "admin"], ["users", Users, "کاربران", role === "admin"], ["backup", Archive, "پشتیبان‌گیری", role === "admin"]
  ] as const;
  return <>
    <header className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 py-2 px-3 sm:py-2.5 sm:px-5 flex flex-col xl:flex-row justify-between items-center gap-2.5 no-print shrink-0 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0"><div className="bg-gradient-to-tr from-cyan-600 to-blue-700 p-1.5 sm:p-2 rounded-xl shadow-md text-white shrink-0"><Truck className="w-5 h-5" /></div><div className="min-w-0"><h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight truncate">سامانه یکپارچه توزیع و برنامه‌ریزی پخش برنا تجارت باور</h1><p className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">مدیریت هوشمند توزیع و برنامه‌ریزی یکپارچه</p></div></div>
      <div className="flex items-center flex-wrap justify-center gap-1.5 sm:gap-2" dir="rtl">
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-8 h-8 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition flex items-center justify-center cursor-pointer" title={isDarkMode ? "حالت روز" : "حالت شب"}>{isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}</button>
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 shadow-xs"><div className="flex flex-col text-right"><span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 font-mono">{user?.email}</span><span className="text-[8px] font-black text-cyan-600 dark:text-cyan-400">{role === "admin" ? "مدیر کل" : role === "sales" ? "مدیر فروش" : role === "visitor" ? "ویزیتور" : role === "production_manager" ? "مدیر تولید" : user?.driverName ? `راننده (${user.driverName})` : "راننده"}</span></div><div className="flex items-center gap-1"><button onClick={onOpenChangePassword} className="w-6 h-6 rounded-md bg-slate-200/60 dark:bg-slate-700 hover:bg-cyan-50 text-slate-600 dark:text-slate-300 transition border border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer" title="تغییر رمز"><KeyRound className="w-3 h-3 text-cyan-600" /></button><button onClick={logout} className="w-6 h-6 rounded-md bg-slate-200/60 dark:bg-slate-700 hover:bg-rose-50 text-slate-600 dark:text-slate-300 transition border border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer" title="خروج"><LogOut className="w-3 h-3" /></button></div></div>
        {handleJumpToday && <button onClick={handleJumpToday} className="flex items-center gap-1.5 bg-amber-50/90 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 rounded-lg px-2.5 py-1.5 shadow-xs text-amber-900 dark:text-amber-300 transition cursor-pointer" title="پرش به تاریخ امروز"><span className="text-[9px] font-bold opacity-70">امروز</span><span className="text-[11px] font-black">{todayText}</span></button>}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
          {handleJumpPrevWorkingDay && <button onClick={handleJumpPrevWorkingDay} className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer" title="روز کاری قبل"><Rewind className="w-3.5 h-3.5 text-cyan-600" /></button>}
          <button onClick={handlePrevDay} className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer" title="روز قبل"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => { setTempYear(shamsiYear); setTempMonth(shamsiMonth); setTempDay(shamsiDay); setManualDateInput(`${shamsiYear}/${String(shamsiMonth).padStart(2, "0")}/${String(shamsiDay).padStart(2, "0")}`); setShowDatePicker(true); }} className={`px-2.5 py-1 min-w-[150px] flex items-center justify-center gap-1.5 rounded-md transition font-extrabold cursor-pointer ${isSelectedDateNonWorking ? "bg-rose-100/90 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800" : "text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700"}`} title="انتخاب تاریخ"><Calendar className="w-3.5 h-3.5 text-cyan-600 shrink-0" /><div className="flex flex-col items-center leading-tight"><span className="text-[11px] sm:text-xs font-black">{selectedDayText}</span>{holidayText && <span className="text-[8px] font-black text-rose-700 dark:text-rose-300 mt-0.5">{holidayText}</span>}</div></button>
          <button onClick={handleNextDay} className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer" title="روز بعد"><ChevronLeft className="w-4 h-4" /></button>
          {handleJumpNextWorkingDay && <button onClick={handleJumpNextWorkingDay} className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer" title="روز کاری بعد"><FastForward className="w-3.5 h-3.5 text-cyan-600" /></button>}
        </div>
      </div>
    </header>
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 overflow-x-auto flex justify-start items-center gap-1.5 no-print shrink-0 py-2 sm:py-2.5">
      {navItems.map(([key, Icon, label, visible]) => visible && <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${activeTab === key ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}><Icon className="w-4 h-4" />{label}</button>)}
    </nav>
  </>;
}
