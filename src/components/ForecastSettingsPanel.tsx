import React from "react";

interface ForecastSettingsPanelProps {
  coverageDays: number;
  setCoverageDays: (days: number) => void;
  safetyDays: number;
  setSafetyDays: (days: number) => void;
  averageDays: number;
  setAverageDays: (days: number) => void;
}

// The three sliders (+ quick-pick buttons) that control the forecast math:
// target coverage window, critical safety margin, and the sales-averaging window.
export const ForecastSettingsPanel: React.FC<ForecastSettingsPanelProps> = ({
  coverageDays,
  setCoverageDays,
  safetyDays,
  setSafetyDays,
  averageDays,
  setAverageDays,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Coverage Days */}
      <div>
        <label className="block text-xs font-black text-slate-700 mb-2.5 flex justify-between">
          <span>دوره پوشش انبار هدف (پیش‌بینی تولید برای چند روز آینده؟)</span>
          <span className="text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded-md font-mono">{coverageDays} روز</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="5"
            max="60"
            step="1"
            value={coverageDays}
            onChange={(e) => setCoverageDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => setCoverageDays(7)}
              className={`px-2 py-1 text-[10px] font-bold rounded ${coverageDays === 7 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              ۷ روزه
            </button>
            <button
              onClick={() => setCoverageDays(15)}
              className={`px-2 py-1 text-[10px] font-bold rounded ${coverageDays === 15 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              ۱۵ روزه
            </button>
            <button
              onClick={() => setCoverageDays(30)}
              className={`px-2 py-1 text-[10px] font-bold rounded ${coverageDays === 30 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              ۳۰ روزه
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">
          * سامانه بررسی می‌کند که موجودی فعلی، پاسخگوی چند روز فروش متوسط خواهد بود و مابه‌التفاوت آن تا هدف فوق را برای تولید پیشنهاد می‌دهد.
        </p>
      </div>

      {/* Safety Days */}
      <div>
        <label className="block text-xs font-black text-slate-700 mb-2.5 flex justify-between">
          <span>حاشیه امنیت بحرانی انبار (هشدار قرمز برای چند روز موجودی؟)</span>
          <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md font-mono">{safetyDays} روز</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={safetyDays}
            onChange={(e) => setSafetyDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => setSafetyDays(2)}
              className={`px-2 py-1 text-[10px] font-bold rounded ${safetyDays === 2 ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              ۲ روزه
            </button>
            <button
              onClick={() => setSafetyDays(3)}
              className={`px-2 py-1 text-[10px] font-bold rounded ${safetyDays === 3 ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              ۳ روزه
            </button>
            <button
              onClick={() => setSafetyDays(5)}
              className={`px-2 py-1 text-[10px] font-bold rounded ${safetyDays === 5 ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              ۵ روزه
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">
          * اگر موجودی باقیمانده محصولی کمتر از فروش متوسط این تعداد روز باشد، برچسب "وضعیت بحرانی" دریافت خواهد کرد.
        </p>
      </div>

      {/* Average Days */}
      <div>
        <label className="block text-xs font-black text-slate-700 mb-2.5 flex justify-between">
          <span>تعداد روزهای میانگین‌گیری فروش (محاسبه میانگین فروش بر اساس چند روز گذشته؟)</span>
          <span className="text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded-md font-mono">{averageDays} روز</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="7"
            max="90"
            step="1"
            value={averageDays}
            onChange={(e) => setAverageDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => setAverageDays(7)}
              className={`px-2 py-1 text-[10px] font-bold rounded ${averageDays === 7 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              ۷ روز
            </button>
            <button
              onClick={() => setAverageDays(15)}
              className={`px-2 py-1 text-[10px] font-bold rounded ${averageDays === 15 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              ۱۵ روز
            </button>
            <button
              onClick={() => setAverageDays(30)}
              className={`px-2 py-1 text-[10px] font-bold rounded ${averageDays === 30 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              ۳۰ روز
            </button>
            <button
              onClick={() => setAverageDays(45)}
              className={`px-2 py-1 text-[10px] font-bold rounded ${averageDays === 45 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              ۴۵ روز
            </button>
            <button
              onClick={() => setAverageDays(60)}
              className={`px-2 py-1 text-[10px] font-bold rounded ${averageDays === 60 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              ۶۰ روز
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">
          * میانگین فروش روزانه بر اساس فروش کل این تعداد روز گذشته محاسبه می‌شود.
        </p>
      </div>
    </div>
  );
};
