import React from "react";
import {
  Truck,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  Calculator,
  Settings,
  FileText,
  Users,
  Archive,
  KeyRound,
  FastForward,
  Rewind
} from "lucide-react";
import { getShamsiWeekday } from "../utils/shamsi";

interface AppHeaderProps {
  user: any;
  role: string | null;
  logout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  todayShamsi: { year: number; month: number; day: number; monthName: string };
  shamsiYear: number;
  shamsiMonth: number;
  shamsiDay: number;
  formattedDate: string;
  currentDateHolidayInfo?: {
    isFriday: boolean;
    isHoliday: boolean;
    holidayTitle: string | null;
    isNonWorking: boolean;
    badgeLabel: string | null;
  };
  handlePrevDay: () => void;
  handleNextDay: () => void;
  handleJumpNextWorkingDay?: () => void;
  handleJumpPrevWorkingDay?: () => void;
  handleJumpToday?: () => void;
  setShowDatePicker: (val: boolean) => void;
  setTempYear: (val: number) => void;
  setTempMonth: (val: number) => void;
  setTempDay: (val: number) => void;
  setManualDateInput: (val: string) => void;
  activeTab: "dashboard" | "planning" | "drivers" | "warehouse" | "waybill" | "config" | "logs" | "users" | "forecast" | "backup";
  setActiveTab: (tab: any) => void;
  onOpenChangePassword?: () => void;
  onOpenVersionHistory?: () => void;
}

export function AppHeader({
  user,
  role,
  logout,
  isDarkMode,
  setIsDarkMode,
  todayShamsi,
  shamsiYear,
  shamsiMonth,
  shamsiDay,
  formattedDate,
  currentDateHolidayInfo,
  handlePrevDay,
  handleNextDay,
  handleJumpNextWorkingDay,
  handleJumpPrevWorkingDay,
  handleJumpToday,
  setShowDatePicker,
  setTempYear,
  setTempMonth,
  setTempDay,
  setManualDateInput,
  activeTab,
  setActiveTab,
  onOpenChangePassword,
  onOpenVersionHistory
}: AppHeaderProps) {
  const isSelectedDateNonWorking = currentDateHolidayInfo?.isNonWorking;

  return (
    <>
      <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 py-2.5 px-3 sm:py-3.5 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 no-print shrink-0 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-gradient-to-tr from-cyan-600 to-blue-700 p-2 sm:p-2.5 rounded-2xl shadow-md text-white shrink-0">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              سامانه یکپارچه توزیع و برنامه‌ریزی پخش برنا تجارت باور
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              مدیریت هوشمند توزیع و برنامه‌ریزی یکپارچه
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-200 shadow-xs flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
            title={isDarkMode ? "حالت روز (روشن)" : "حالت شب (تیره)"}
          >
            {isDarkMode ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-slate-700" />
            )}
          </button>

          {/* User badge */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-xs" dir="rtl">
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-wide font-mono select-none">
                {user?.email}
              </span>
              <span className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 select-none text-right">
                {role === 'admin' ? 'مدیر کل' : role === 'sales' ? 'مدیر فروش' : role === 'visitor' ? 'ویزیتور' : role === 'production_manager' ? 'مدیر تولید' : user?.driverName ? `راننده (${user.driverName})` : 'راننده'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenChangePassword}
                className="p-1 bg-slate-200/60 dark:bg-slate-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-slate-600 dark:text-slate-300 hover:text-cyan-700 rounded-lg transition border border-slate-300 dark:border-slate-600 flex items-center text-xs font-bold cursor-pointer"
                title="تغییر رمز عبور"
              >
                <KeyRound className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              </button>
              <button
                onClick={logout}
                className="p-1 bg-slate-200/60 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 rounded-lg transition border border-slate-300 dark:border-slate-600 flex items-center text-xs font-bold cursor-pointer"
                title="خروج از حساب"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Today Indicator */}
          {handleJumpToday && (
            <button
              onClick={handleJumpToday}
              className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3 py-1.5 shadow-xs text-amber-900 dark:text-amber-300 transition cursor-pointer"
              title="پرش به تاریخ امروز"
              dir="rtl"
            >
              <span className="text-[10px] font-bold opacity-75">امروز:</span>
              <span className="text-xs font-black tracking-wide">
                {getShamsiWeekday(todayShamsi.year, todayShamsi.month, todayShamsi.day)} {todayShamsi.day} {todayShamsi.monthName}
              </span>
            </button>
          )}

          {/* Date Navigator Bar with Working Day Jump */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-xs">
            {handleJumpPrevWorkingDay && (
              <button
                onClick={handleJumpPrevWorkingDay}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition flex items-center justify-center cursor-pointer"
                title="پرش به روز کاری قبل (رد کردن تعطیلات)"
              >
                <Rewind className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </button>
            )}

            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="روز قبل"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={() => {
                setTempYear(shamsiYear);
                setTempMonth(shamsiMonth);
                setTempDay(shamsiDay);
                setManualDateInput(`${shamsiYear}/${String(shamsiMonth).padStart(2, '0')}/${String(shamsiDay).padStart(2, '0')}`);
                setShowDatePicker(true);
              }}
              className={`px-3 py-1 flex items-center gap-2 rounded-lg transition font-extrabold cursor-pointer ${
                isSelectedDateNonWorking
                  ? "bg-rose-100/90 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800"
                  : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100"
              }`}
              title="انتخاب سریع یا وارد کردن دستی تاریخ"
            >
              <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <div className="flex flex-col items-center">
                <span className="font-sans text-xs sm:text-sm font-black">
                  {getShamsiWeekday(shamsiYear, shamsiMonth, shamsiDay)}، {formattedDate}
                </span>
                {currentDateHolidayInfo?.badgeLabel && (
                  <span className="text-[9px] font-black text-rose-700 dark:text-rose-300 bg-white/70 dark:bg-slate-900/70 px-1.5 rounded mt-0.5">
                    {currentDateHolidayInfo.badgeLabel}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="روز بعد"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>

            {handleJumpNextWorkingDay && (
              <button
                onClick={handleJumpNextWorkingDay}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition flex items-center justify-center cursor-pointer"
                title="پرش به روز کاری بعد (رد کردن تعطیلات)"
              >
                <FastForward className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 overflow-x-auto flex justify-start items-center gap-1.5 no-print shrink-0 py-2 sm:py-2.5">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          داشبورد نظارت
        </button>

        {role !== 'driver' && role !== 'visitor' && role !== 'production_manager' && (
          <button
            onClick={() => setActiveTab("planning")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
              activeTab === "planning"
                ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            برنامه‌ریزی و فروش
          </button>
        )}

        {role !== 'visitor' && role !== 'production_manager' && (
          <button
            onClick={() => setActiveTab("drivers")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
              activeTab === "drivers"
                ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <Truck className="w-4 h-4" />
            عملکرد و مسیر رانندگان
          </button>
        )}

        {role !== 'driver' && (
          <button
            onClick={() => setActiveTab("warehouse")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
              activeTab === "warehouse"
                ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-4 h-4" />
            گزارش کلی انبار
          </button>
        )}

        {role !== 'driver' && role !== 'visitor' && (
          <button
            onClick={() => setActiveTab("forecast")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
              activeTab === "forecast"
                ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <Calculator className="w-4 h-4" />
            پیش‌بینی نیاز انبار
          </button>
        )}

        {role === 'admin' && (
          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
              activeTab === "config"
                ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <Settings className="w-4 h-4" />
            پیکربندی پایه و کالاها
          </button>
        )}

        {role === 'admin' && (
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
              activeTab === "logs"
                ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            لاگ تغییرات
          </button>
        )}

        {role === 'admin' && (
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
              activeTab === "users"
                ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-4 h-4" />
            کاربران
          </button>
        )}

        {role === 'admin' && (
          <button
            onClick={() => setActiveTab("backup")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer ${
              activeTab === "backup"
                ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <Archive className="w-4 h-4" />
            پشتیبان‌گیری
          </button>
        )}
      </nav>
    </>
  );
}
