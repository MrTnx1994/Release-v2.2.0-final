import React from "react";
import { ShoppingCart, AlertCircle, PackageOpen, ArrowUpRight } from "lucide-react";

interface ForecastKpiStatsProps {
  summaryStats: {
    totalNeedingPurchase: number;
    criticalCount: number;
    warningCount: number;
    totalSuggestedWeight: number;
    totalRemainingWeight: number;
  };
}

// The 4 top-line KPI cards: items needing production, critical count,
// total current stock, total suggested production.
export const ForecastKpiStats: React.FC<ForecastKpiStatsProps> = ({ summaryStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 block">کالاهای نیازمند تولید</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono mt-1 block">
            {summaryStats.totalNeedingPurchase} <span className="text-xs font-sans font-bold text-slate-400">کالا</span>
          </span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="bg-rose-50 p-3 rounded-lg text-rose-600">
          <AlertCircle className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 block">وضعیت بحرانی (اتمام زودرس)</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono mt-1 block">
            {summaryStats.criticalCount} <span className="text-xs font-sans font-bold text-slate-400">مورد</span>
          </span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="bg-cyan-50 p-3 rounded-lg text-cyan-600">
          <PackageOpen className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 block">کل موجودی فعلی انبار</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono mt-1 block">
            {summaryStats.totalRemainingWeight.toLocaleString()} <span className="text-xs font-sans font-bold text-slate-400">کیلوگرم</span>
          </span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
          <ArrowUpRight className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 block">کل برنامه تولید پیشنهادی</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono mt-1 block">
            {summaryStats.totalSuggestedWeight.toLocaleString()} <span className="text-xs font-sans font-bold text-slate-400">کیلوگرم</span>
          </span>
        </div>
      </div>
    </div>
  );
};
