import React from "react";
import { EyeOff } from "lucide-react";
import { Product } from "../types";

interface HiddenProductsManagerPanelProps {
  hiddenProducts: Product[];
  setHiddenProductIds: (ids: string[]) => void;
  setShowHiddenManager: (v: boolean) => void;
  toggleHideProduct: (productId: string) => void;
}

// Panel listing products hidden from the forecast table, with a per-item
// "unhide" action and a "show all again" shortcut. Only rendered when the
// user has opened it via the filter bar and there's at least one hidden item.
export const HiddenProductsManagerPanel: React.FC<HiddenProductsManagerPanelProps> = ({
  hiddenProducts,
  setHiddenProductIds,
  setShowHiddenManager,
  toggleHideProduct,
}) => {
  return (
    <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 no-print-element">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
        <div className="flex items-center gap-2 text-rose-800">
          <EyeOff className="w-4 h-4 animate-pulse" />
          <h3 className="text-xs font-black">مدیریت کالاهای پنهان‌شده از لیست پیش‌بینی</h3>
        </div>
        <button
          onClick={() => {
            setHiddenProductIds([]);
            setShowHiddenManager(false);
          }}
          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black transition shadow-sm cursor-pointer shrink-0"
        >
          نمایش مجدد همه کالاها
        </button>
      </div>
      <p className="text-[10px] text-rose-600/85 mb-3 leading-relaxed">
        کالاهای زیر از جدول پیش‌بینی نیاز به تولید پنهان شده‌اند. برای بازگرداندن هر کدام به جدول اصلی، دکمه «نمایش مجدد» را کلیک کنید.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {hiddenProducts.map(prod => (
          <div
            key={prod.id}
            className="bg-white p-2.5 rounded-xl border border-rose-100/60 shadow-sm flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <span className="text-[8px] font-bold text-slate-400 block">{prod.category}</span>
              <span className="text-[10px] font-extrabold text-slate-800 truncate block mt-0.5">{prod.flavor}</span>
            </div>
            <button
              onClick={() => toggleHideProduct(prod.id)}
              className="px-2 py-1 bg-slate-50 hover:bg-rose-50 border border-slate-150 hover:border-rose-200 text-slate-600 hover:text-rose-700 rounded-md text-[9px] font-bold transition shrink-0 cursor-pointer"
            >
              نمایش مجدد
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
