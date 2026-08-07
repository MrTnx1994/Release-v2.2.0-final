import React from "react";
import { Search, Filter, EyeOff } from "lucide-react";

interface ForecastFilterBarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  hiddenProductIds: string[];
  showHiddenManager: boolean;
  setShowHiddenManager: (v: boolean) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  totalNeedingPurchase: number;
  criticalCount: number;
}

// Search box + hidden-products toggle + category dropdown + status quick-filters,
// shown above the forecast table.
export const ForecastFilterBar: React.FC<ForecastFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  hiddenProductIds,
  showHiddenManager,
  setShowHiddenManager,
  categories,
  selectedCategory,
  setSelectedCategory,
  statusFilter,
  setStatusFilter,
  totalNeedingPurchase,
  criticalCount,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
      <div className="relative flex-1">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="جستجو در نام طعم یا دسته‌بندی کالا..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition placeholder-slate-400 font-semibold text-slate-700"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Hidden Products Manager Toggle Button */}
        {hiddenProductIds.length > 0 && (
          <button
            onClick={() => setShowHiddenManager(!showHiddenManager)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer ${
              showHiddenManager
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <EyeOff className="w-3.5 h-3.5 text-rose-600" />
            <span>کالاهای پنهان‌شده ({hiddenProductIds.length.toLocaleString("fa-IR")})</span>
          </button>
        )}

        {/* Category Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">همه دسته‌ب بندی‌ها</option>
            {categories.filter(c => c !== "all").map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Status Select Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
              statusFilter === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            همه کالاها
          </button>
          <button
            onClick={() => setStatusFilter("needs_purchase")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
              statusFilter === "needs_purchase" ? "bg-white text-amber-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            نیاز به تولید ({totalNeedingPurchase})
          </button>
          <button
            onClick={() => setStatusFilter("critical")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
              statusFilter === "critical" ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            بحرانی ({criticalCount})
          </button>
          <button
            onClick={() => setStatusFilter("sufficient")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
              statusFilter === "sufficient" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            کافی
          </button>
        </div>
      </div>
    </div>
  );
};
