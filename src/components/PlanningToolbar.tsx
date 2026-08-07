import React from "react";
import { Calendar, Save, Search, Download, Plus, RotateCcw, Printer } from "lucide-react";
import { InvoiceRun, Product } from "../types";
import { getTomorrowShamsiDate } from "../utils/shamsi";

interface PlanningToolbarProps {
  role: string | null;
  invoices: InvoiceRun[];
  validProducts: Product[];
  allocatedQuantities: { [productId: string]: number };
  getProductStock: (id: string, defaultStock: number) => number;
  shamsiYear: number;
  shamsiMonth: number;
  shamsiDay: number;
  saving: boolean;
  handleMoveInactiveToTomorrow: () => void;
  saveDailyPlan: () => void;
  openCustomerSearchModal: () => void;
  handleExportExcel: () => void;
  handleAddInvoiceRun: () => void;
  handleResetCurrentDayPlan: () => void;
  setShowPrintPreview: (show: boolean) => void;
}

// Page title (+ today's overall stock-shortage indicator) and the row of
// action buttons above the planning grid.
export const PlanningToolbar: React.FC<PlanningToolbarProps> = ({
  role,
  invoices,
  validProducts,
  allocatedQuantities,
  getProductStock,
  shamsiYear,
  shamsiMonth,
  shamsiDay,
  saving,
  handleMoveInactiveToTomorrow,
  saveDailyPlan,
  openCustomerSearchModal,
  handleExportExcel,
  handleAddInvoiceRun,
  handleResetCurrentDayPlan,
  setShowPrintPreview,
}) => {
  const allShortage = validProducts.reduce((acc, p) => {
    const allocated = allocatedQuantities[p.id] || 0;
    const currentStock = getProductStock(p.id, p.defaultStock);
    const remaining = currentStock - allocated;
    return remaining < 0 ? acc + Math.abs(remaining) : acc;
  }, 0);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">برنامه ریزی و فروش (کنترل هوشمند)</h2>
        {allShortage > 0 ? (
          <p className="text-xs text-rose-600 font-extrabold flex items-center gap-1.5 mt-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>⚠️ مجموع کل کسری اقلام امروز:</span>
            <span className="font-mono text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-lg border border-rose-200 font-black">{allShortage.toLocaleString("en-US")} kg</span>
          </p>
        ) : (
          <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>✅ توازن کامل برقرار است (بدون کسری در انبار امروز)</span>
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2" dir="rtl">
        {invoices.some((inv) => inv.isActive === false) && role !== 'visitor' && (
          <button
            onClick={handleMoveInactiveToTomorrow}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-bold transition shadow-sm animate-pulse cursor-pointer"
            title="انتقال فاکتورهای غیرفعال به فردا"
          >
            <Calendar className="w-4 h-4 text-amber-600" />
            انتقال غیرفعال‌ها به فردا ({getTomorrowShamsiDate(shamsiYear, shamsiMonth, shamsiDay)})
          </button>
        )}
        {role !== 'visitor' && (
          <button
            onClick={saveDailyPlan}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-100" />
            {saving ? "در حال ذخیره..." : "ثبت نهایی تغییرات"}
          </button>
        )}
        <button
          onClick={openCustomerSearchModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer"
          title="جستجوی کلی مشتری در تمام تاریخ‌ها"
        >
          <Search className="w-4 h-4 text-indigo-100" />
          جستجوی کلی مشتری
        </button>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer"
          title="دانلود فایل اکسل پیشرفته قالب‌بندی شده"
        >
          <Download className="w-4 h-4 text-cyan-100" />
          خروجی اکسل روزانه
        </button>
        <button
          onClick={handleAddInvoiceRun}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          افزودن سفارش جدید
        </button>
        <button
          onClick={handleResetCurrentDayPlan}
          className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md border-none cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-rose-100" />
          حذف کل سفارشات از لیست
        </button>
        <button
          onClick={() => setShowPrintPreview(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-300" />
          پرینت صورت بار رانندگان
        </button>
      </div>
    </div>
  );
};
