import React from "react";
import { Edit2 } from "lucide-react";
import { Product } from "../types";

interface CategoryFilterBarProps {
  validProducts: Product[];
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  isProductEditMode: boolean;
  setIsProductEditMode: (val: boolean) => void;
}

// Quick category filter chips + the "edit products inline" toggle, shown
// sticky above the planning grid.
export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  validProducts,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  isProductEditMode,
  setIsProductEditMode,
}) => {
  return (
    <div className="sticky top-0 z-50 bg-slate-50/95 backdrop-blur-md py-2 border-b border-slate-200 no-print" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-slate-500 font-bold mr-1 ml-2">فیلتر سریع کالا:</span>
          <button
            onClick={() => setSelectedCategoryFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              selectedCategoryFilter === "all"
                ? "bg-cyan-600 text-white shadow-sm font-extrabold"
                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-850 hover:bg-slate-50"
            }`}
          >
            همه دسته‌بندی‌ها
          </button>
          {Array.from(new Set(validProducts.map((p) => p.category)))
            .filter((cat): cat is string => typeof cat === "string" && cat.trim() !== "")
            .map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? "bg-cyan-600 text-white shadow-sm font-extrabold"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-850 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setIsProductEditMode(!isProductEditMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm ${
              isProductEditMode
                ? "bg-amber-600 text-white font-black hover:bg-amber-500"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400"
            }`}
          >
            <Edit2 className="w-3 h-3" />
            {isProductEditMode ? "قفل کردن نام‌ها" : "ویرایش مستقیم کالاها"}
          </button>
        </div>
      </div>
    </div>
  );
};
