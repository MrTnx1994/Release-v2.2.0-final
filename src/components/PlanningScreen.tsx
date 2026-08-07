import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { InvoiceRun, Driver, Product } from "../types";
import { EditableProductCell } from "./EditableProductCell";
import { 
  getDriverColorClass, 
  getDriverCellColorClass, 
  isSameDriver 
} from "../utils/driverHelpers";
import { 
  getInvoiceWeight, 
  getInvoiceCartonsVolumetric, 
  getDriverCapacity 
} from "../utils/invoiceCalculations";
import { PlanningToolbar } from "./PlanningToolbar";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { SelectionSumBar } from "./SelectionSumBar";
import { ZoomControls } from "./ZoomControls";

interface PlanningScreenProps {
  role: string | null;
  invoices: InvoiceRun[];
  drivers: Driver[];
  products: Product[];
  allocatedQuantities: { [productId: string]: number };
  getProductStock: (id: string, defaultStock: number) => number;
  manualStockOverrides: { [productId: string]: number };
  driverSearchSlots: string[];
  setDriverSearchSlots: (slots: string[]) => void;
  shamsiYear: number;
  shamsiMonth: number;
  shamsiDay: number;
  formattedDate: string;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  isProductEditMode: boolean;
  setIsProductEditMode: (val: boolean) => void;
  gridSelectionStats: { count: number; sum: number };
  setCellSelection: (val: any) => void;
  selectionAnchorRef: React.MutableRefObject<any>;
  gridZoomWrapperRef: React.RefObject<HTMLDivElement>;
  zoomLabelRef: React.RefObject<HTMLSpanElement>;
  sumBarCountRef: React.RefObject<HTMLSpanElement>;
  sumBarValueRef: React.RefObject<HTMLSpanElement>;
  handleUpdateInvoiceHeader: (runId: string, field: keyof InvoiceRun, value: any) => void;
  handleDeleteInvoice: (runId: string) => void;
  handleUpdateCell: (runId: string, productId: string, value: number) => void;
  handleUpdateStockOverride: (productId: string, value: number | null | undefined) => void;
  handleAddInvoiceRun: () => void;
  handleResetCurrentDayPlan: () => void;
  saveDailyPlan: () => void;
  saving: boolean;
  handleMoveInactiveToTomorrow: () => void;
  openCustomerSearchModal: () => void;
  handleExportExcel: () => void;
  setShowPrintPreview: (show: boolean) => void;
  handleGridCellMouseDown: (r: number, c: number, e: React.MouseEvent) => void;
  handleGridCellMouseEnter: (r: number, c: number) => void;
  handleClearSelectedGridCells: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
  isGridCellSelected: (r: number, c: number) => boolean;
  saveMasterConfig: (drivers: Driver[], products: Product[]) => void;
  setProducts: (products: Product[]) => void;
}

export const PlanningScreen: React.FC<PlanningScreenProps> = ({
  role,
  invoices,
  drivers,
  products,
  allocatedQuantities,
  getProductStock,
  manualStockOverrides,
  driverSearchSlots,
  setDriverSearchSlots,
  shamsiYear,
  shamsiMonth,
  shamsiDay,
  formattedDate,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  isProductEditMode,
  setIsProductEditMode,
  gridSelectionStats,
  setCellSelection,
  selectionAnchorRef,
  gridZoomWrapperRef,
  zoomLabelRef,
  sumBarCountRef,
  sumBarValueRef,
  handleUpdateInvoiceHeader,
  handleDeleteInvoice,
  handleUpdateCell,
  handleUpdateStockOverride,
  handleAddInvoiceRun,
  handleResetCurrentDayPlan,
  saveDailyPlan,
  saving,
  handleMoveInactiveToTomorrow,
  openCustomerSearchModal,
  handleExportExcel,
  setShowPrintPreview,
  handleGridCellMouseDown,
  handleGridCellMouseEnter,
  handleClearSelectedGridCells,
  handleZoomIn,
  handleZoomOut,
  handleZoomReset,
  isGridCellSelected,
  saveMasterConfig,
  setProducts
}) => {
  const validProducts = products.filter(p => p.category && p.category.trim() !== '');

  const [stockInputValues, setStockInputValues] = useState<{ [productId: string]: string }>({});

  const evaluateStockFormula = (raw: string): number | null => {
    const str = raw.trim();
    if (!str) return null;
    if (!str.startsWith('=')) {
      const num = parseFloat(str);
      return isNaN(num) ? null : num;
    }
    const expr = str.substring(1).trim();
    if (!expr) return null;
    if (!/^[\d\.\+\-\*\/\(\)\s]+$/.test(expr)) {
      return null;
    }
    try {
      const result = Function(`'use strict'; return (${expr})`)();
      return typeof result === 'number' && !isNaN(result) ? result : null;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <PlanningToolbar
        role={role}
        invoices={invoices}
        validProducts={validProducts}
        allocatedQuantities={allocatedQuantities}
        getProductStock={getProductStock}
        shamsiYear={shamsiYear}
        shamsiMonth={shamsiMonth}
        shamsiDay={shamsiDay}
        saving={saving}
        handleMoveInactiveToTomorrow={handleMoveInactiveToTomorrow}
        saveDailyPlan={saveDailyPlan}
        openCustomerSearchModal={openCustomerSearchModal}
        handleExportExcel={handleExportExcel}
        handleAddInvoiceRun={handleAddInvoiceRun}
        handleResetCurrentDayPlan={handleResetCurrentDayPlan}
        setShowPrintPreview={setShowPrintPreview}
      />

      <CategoryFilterBar
        validProducts={validProducts}
        selectedCategoryFilter={selectedCategoryFilter}
        setSelectedCategoryFilter={setSelectedCategoryFilter}
        isProductEditMode={isProductEditMode}
        setIsProductEditMode={setIsProductEditMode}
      />

      <div className="w-full pb-6" dir="rtl">
        <div className="flex flex-col gap-6 items-stretch px-1 w-full">
          <SelectionSumBar
            gridSelectionStats={gridSelectionStats}
            sumBarCountRef={sumBarCountRef}
            sumBarValueRef={sumBarValueRef}
            handleClearSelectedGridCells={handleClearSelectedGridCells}
            setCellSelection={setCellSelection}
            selectionAnchorRef={selectionAnchorRef}
          />

          <ZoomControls
            zoomLabelRef={zoomLabelRef}
            handleZoomIn={handleZoomIn}
            handleZoomOut={handleZoomOut}
            handleZoomReset={handleZoomReset}
          />

          <div className="w-full space-y-4 no-print">
            <div id="main-unified-grid" className="bg-white rounded-2xl border border-slate-200 shadow-md max-h-[92vh] overflow-auto scrollbar-thin scrollbar-thumb-slate-300 w-full">
              <div ref={gridZoomWrapperRef} className="relative" style={{ zoom: "80%" } as React.CSSProperties}>
                <table className="text-right text-xs table-fixed" style={{ width: `${1850 + invoices.length * 140}px` }}>
                  <thead className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200">
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th 
                        rowSpan={2}
                        className="sticky right-0 z-50 bg-blue-300 py-2.5 px-1 font-black text-black w-[110px] text-center border-l border-blue-400 shadow-[[-3px_0_6px_rgba(0,0,0,0.06)]]"
                        style={{ right: 0 }}
                      >
                        نوع مغز
                      </th>
                      <th 
                        rowSpan={2}
                        className="sticky z-50 bg-blue-300 py-2.5 px-1 font-black text-black w-[90px] text-center border-l border-blue-400 shadow-[[-3px_0_6px_rgba(0,0,0,0.06)]]"
                        style={{ right: '110px' }}
                      >
                        طعم
                      </th>

                      {invoices.map((inv, index) => {
                        const isActive = inv.isActive !== false;
                        return (
                          <th
                            key={inv.id}
                            className={`p-1.5 border-l border-slate-200 min-w-[135px] w-[140px] transition-all duration-300 align-top ${
                              !isActive 
                                ? "bg-slate-100 opacity-60 saturate-50" 
                                : "bg-gradient-to-b from-blue-50/70 to-white border-t-2 border-t-blue-500"
                            }`}
                          >
                            <div className="space-y-1.5 text-right flex flex-col h-full">
                              <div className={`flex items-center justify-between px-1.5 py-1 border-b rounded transition-all ${
                                !isActive 
                                  ? "border-slate-200 bg-slate-50" 
                                  : "border-blue-150 bg-blue-50"
                              }`}>
                                <label className={`flex items-center gap-1 cursor-pointer text-[10px] font-black ${
                                  !isActive ? "text-slate-500" : "text-blue-900"
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => handleUpdateInvoiceHeader(inv.id, "isActive", e.target.checked)}
                                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <span>فعال</span>
                                </label>
                                <span className={`text-[11px] font-bold py-0.5 px-1.5 rounded-full ${
                                  !isActive ? "bg-slate-200 text-slate-500" : "bg-blue-100 text-blue-800"
                                }`}>
                                  {index + 1}
                                </span>

                                <button
                                  onClick={() => handleDeleteInvoice(inv.id)}
                                  className="p-0.5 rounded transition text-blue-400 hover:text-rose-600 hover:bg-blue-100/50 cursor-pointer"
                                  title="حذف سفر"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="relative">
                                <div className={`rounded-md border p-1 transition-all shadow-sm ${getDriverColorClass(inv.driverName, inv.round, drivers)}`}>
                                  <div className="text-[8px] opacity-75 font-bold mb-0.5 select-none pr-1 text-right">راننده:</div>
                                  <select
                                    value={inv.driverName || ""}
                                    onChange={(e) => handleUpdateInvoiceHeader(inv.id, "driverName", e.target.value)}
                                    className="bg-transparent text-slate-950 w-full font-black focus:outline-none text-center text-[11px] cursor-pointer"
                                  >
                                    <option value="" className="bg-white text-slate-500">-- بدون راننده --</option>
                                    {drivers.map((d) => (
                                      <option key={d.name} value={d.name} className="bg-white text-slate-950">
                                        {d.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1 bg-white/60 p-1 rounded-md border border-slate-150 shadow-sm mt-auto">
                                <div className="relative">
                                  <span className="absolute right-1 top-1.5 text-[8px] text-slate-400 pointer-events-none font-bold">مشتری:</span>
                                  <input
                                    id={`customer-${index}`}
                                    type="text"
                                    value={inv.customerName}
                                    onChange={(e) => handleUpdateInvoiceHeader(inv.id, "customerName", e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        const nextInput = document.getElementById(`destination-${index}`);
                                        if (nextInput) {
                                          nextInput.focus();
                                          (nextInput as HTMLInputElement).select();
                                        }
                                      }
                                    }}
                                    className={`w-full font-black focus:outline-none text-center pl-1 pr-7 text-xs rounded py-1 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 border ${getDriverColorClass(inv.driverName, inv.round, drivers)}`}
                                    placeholder="مشتری..."
                                  />
                                </div>
                                <div className="relative">
                                  <span className="absolute right-1 top-1.5 text-[8px] text-slate-400 pointer-events-none font-bold">مسیر:</span>
                                  <input
                                    id={`destination-${index}`}
                                    type="text"
                                    value={inv.destinationLocation}
                                    onChange={(e) => handleUpdateInvoiceHeader(inv.id, "destinationLocation", e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        const nextInput = document.getElementById(`truck-${index}`);
                                        if (nextInput) {
                                          nextInput.focus();
                                          (nextInput as HTMLInputElement).select();
                                        }
                                      }
                                    }}
                                    className={`w-full font-black focus:outline-none text-center pl-1 pr-7 text-xs rounded py-1 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 border ${getDriverColorClass(inv.driverName, inv.round, drivers)}`}
                                    placeholder="مسیر..."
                                  />
                                </div>
                                <div className="relative">
                                  <span className="absolute right-1 top-1.5 text-[8px] text-slate-400 pointer-events-none font-bold">باربری:</span>
                                  <input
                                    id={`truck-${index}`}
                                    type="text"
                                    value={inv.truckInfo}
                                    onChange={(e) => handleUpdateInvoiceHeader(inv.id, "truckInfo", e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        const nextInput = document.getElementById(`notes-${index}`);
                                        if (nextInput) {
                                          nextInput.focus();
                                          (nextInput as HTMLInputElement).select();
                                        }
                                      }
                                    }}
                                    className={`w-full font-black focus:outline-none text-center pl-1 pr-7 text-xs rounded py-1 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 border ${getDriverColorClass(inv.driverName, inv.round, drivers)}`}
                                    placeholder="باربری..."
                                  />
                                </div>
                                <div className="relative">
                                  <span className="absolute right-1 top-1.5 text-[7px] text-slate-400 pointer-events-none font-bold">توضیحات:</span>
                                  <input
                                    id={`notes-${index}`}
                                    type="text"
                                    value={inv.notes}
                                    onChange={(e) => handleUpdateInvoiceHeader(inv.id, "notes", e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        if (index + 1 < invoices.length) {
                                          const nextInput = document.getElementById(`customer-${index + 1}`);
                                          if (nextInput) {
                                            nextInput.focus();
                                            (nextInput as HTMLInputElement).select();
                                          }
                                        }
                                      }
                                    }}
                                    className={`w-full font-black focus:outline-none text-center pl-1 pr-[36px] text-[10px] rounded py-1 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 border ${getDriverColorClass(inv.driverName, inv.round, drivers)}`}
                                    placeholder="..."
                                  />
                                </div>
                              </div>
                            </div>
                          </th>
                        );
                      })}

                      <th className="bg-emerald-200 py-1 px-1 font-bold text-emerald-950 w-[95px] min-w-[95px] text-center border-l border-slate-200 align-middle">
                        <span className="text-[11px] whitespace-nowrap">جمع</span>
                      </th>
                      
                      <th className="bg-emerald-200 py-1 px-1 font-bold text-emerald-950 w-[95px] min-w-[95px] text-center border-l border-slate-200 align-middle">
                        <span className="text-[11px] whitespace-nowrap">موجودی دستی</span>
                      </th>
                      
                      <th className="bg-emerald-200 py-1 px-1 font-bold text-emerald-950 w-[95px] min-w-[95px] text-center border-l border-slate-200 align-middle">
                        <span className="text-[11px] whitespace-nowrap">موجودی</span>
                      </th>
                      
                      <th className="bg-emerald-200 py-1 px-1 font-bold text-emerald-950 w-[95px] min-w-[95px] text-center border-l border-slate-200 align-middle">
                        <span className="text-[11px] whitespace-nowrap">باقیمانده</span>
                      </th>
                      
                      <th className="bg-rose-200 py-1 px-1 font-bold text-rose-950 w-[95px] min-w-[95px] text-center border-l border-slate-200 align-middle">
                        <span className="text-[11px] whitespace-nowrap">کسری</span>
                      </th>

                      {driverSearchSlots.map((slot, idx) => {
                        const realIdx = 9 - idx;
                        const driver = driverSearchSlots[realIdx];
                        
                        let totalCartons = 0;
                        if (driver) {
                          invoices
                            .filter((inv) => isSameDriver(inv.driverName, driver) && inv.isActive !== false)
                            .forEach((inv) => {
                              validProducts.forEach((p) => {
                                const q = Number(inv.quantities[p.id] || 0);
                                if (q > 0 && p.unitWeight > 0) {
                                  totalCartons += q / p.unitWeight;
                                }
                              });
                            });
                        }
                        
                        return (
                          <th key={idx} className="bg-orange-50/90 py-1 px-1 border-l border-slate-200 text-center w-[110px] min-w-[110px] align-middle">
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <span className="text-[10px] text-orange-700 font-extrabold block">جستجو {10 - idx}</span>
                              {driver && totalCartons > 0 && (
                                <span className="text-[10px] text-red-700 font-bold bg-red-50 px-1 rounded block mt-0.5" dir="rtl">
                                  {totalCartons.toLocaleString("en-US", { maximumFractionDigits: 1 })} کارتن
                                </span>
                              )}
                              <div className="rounded border border-orange-200 bg-white p-0.5 w-full">
                                <select
                                  value={driverSearchSlots[realIdx] || ""}
                                  onChange={(e) => {
                                    const newSlots = [...driverSearchSlots];
                                    newSlots[realIdx] = e.target.value;
                                    setDriverSearchSlots(newSlots);
                                  }}
                                  className="bg-transparent font-extrabold w-full text-center focus:outline-none cursor-pointer text-[11px] text-slate-800"
                                >
                                  <option value="">-</option>
                                  {drivers.map((d) => (
                                    <option key={d.name} value={d.name}>
                                      {d.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </th>
                        );
                      }).reverse()}
                      
                      <th className="bg-orange-100 py-1 px-1 border-l border-slate-200 align-middle w-[115px] min-w-[115px]">
                        <span className="text-[11px] font-bold text-slate-800 text-center whitespace-nowrap block">
                          جمع کل جستجو
                        </span>
                      </th>
                    </tr>

                    <tr className="bg-slate-100/80 border-b-2 border-slate-300 shadow-sm">
                      {invoices.map((inv, index) => {
                        const isActive = inv.isActive !== false;
                        const weight = getInvoiceWeight(inv);
                        const limit = getDriverCapacity(inv.driverName, drivers);
                        const isOverloaded = weight > limit;
                        return (
                          <th
                            key={inv.id}
                            className={`p-1.5 border-l border-slate-200 align-middle ${
                              !isActive 
                                ? "bg-slate-100 opacity-60 saturate-50" 
                                : "bg-gradient-to-b from-slate-50 to-slate-100/80"
                            }`}
                          >
                            <div className={`flex flex-col items-center justify-center py-1 px-1.5 rounded border transition-all shadow-sm ${
                              !isActive 
                                ? "bg-slate-100 border-slate-200 text-slate-400" 
                                : isOverloaded 
                                ? "bg-rose-50 border-rose-300 text-rose-900"
                                : "bg-indigo-50 border-indigo-300 text-indigo-950"
                            }`}>
                              <div className="text-[8px] font-bold opacity-80 leading-tight">جمع کل وزن بار:</div>
                              <div className="text-[12px] font-black tracking-tight leading-none mt-1">
                                {weight.toLocaleString("en-US", { maximumFractionDigits: 1 })} Kg
                              </div>
                            </div>
                          </th>
                        );
                      })}
                      {(() => {
                        const filteredProducts = validProducts.filter((p) => selectedCategoryFilter === "all" || p.category === selectedCategoryFilter);
                        let sumAllocated = 0;
                        let sumStock = 0;
                        let sumShortage = 0;
                        let sumManualStock = 0;

                        filteredProducts.forEach((p) => {
                          const allocated = allocatedQuantities[p.id] || 0;
                          const currentStock = getProductStock(p.id, p.defaultStock);
                          
                          const ms = manualStockOverrides[p.id];
                          if (ms !== undefined && ms !== null) {
                            sumManualStock += Number(ms);
                          }
                          
                          sumAllocated += allocated;
                          sumStock += currentStock;
                          
                          const rem = currentStock - allocated;
                          if (rem < 0) {
                            sumShortage += Math.abs(rem);
                          }
                        });
                        const sumRemaining = sumStock - sumAllocated;
                        
                        let searchGrandTotalWeight = 0;
                        
                        return (
                          <>
                            <th className="bg-emerald-200 p-1.5 font-bold text-emerald-950 w-[95px] min-w-[95px] text-center border-l border-slate-200 align-middle">
                              <div className="rounded p-1 border text-center bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm mx-1">
                                <div className="text-[8px] font-bold opacity-80 leading-tight">کل (Kg):</div>
                                <div className="text-[12px] font-black tracking-tight leading-none mt-1">
                                  {sumAllocated.toLocaleString("en-US", { maximumFractionDigits: 1 })}
                                </div>
                              </div>
                            </th>
                            
                            <th className="bg-emerald-200 p-1.5 font-bold text-emerald-950 w-[95px] min-w-[95px] text-center border-l border-slate-200 align-middle">
                              <div className="rounded p-1 border text-center bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm mx-1">
                                <div className="text-[8px] font-bold opacity-80 leading-tight">کل (Kg):</div>
                                <div className="text-[12px] font-black tracking-tight leading-none mt-1">
                                  {sumManualStock !== 0 ? sumManualStock.toLocaleString("en-US", { maximumFractionDigits: 1 }) : "-"}
                                </div>
                              </div>
                            </th>
                            
                            <th className="bg-emerald-200 p-1.5 font-bold text-emerald-950 w-[95px] min-w-[95px] text-center border-l border-slate-200 align-middle">
                              <div className="rounded p-1 border text-center bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm mx-1">
                                <div className="text-[8px] font-bold opacity-80 leading-tight">کل (Kg):</div>
                                <div className="text-[12px] font-black tracking-tight leading-none mt-1">
                                  {sumStock.toLocaleString("en-US", { maximumFractionDigits: 1 })}
                                </div>
                              </div>
                            </th>
                            
                            <th className={`p-1.5 font-bold text-emerald-950 w-[95px] min-w-[95px] text-center border-l border-slate-200 align-middle ${sumRemaining < 0 ? "bg-rose-200" : "bg-emerald-200"}`}>
                              <div className={`rounded p-1 border text-center shadow-sm mx-1 ${sumRemaining < 0 ? "bg-rose-50 border-rose-300 text-rose-950" : "bg-emerald-50 border-emerald-300 text-emerald-950"}`}>
                                <div className="text-[8px] font-bold opacity-80 leading-tight">کل (Kg):</div>
                                <div className="text-[12px] font-black tracking-tight leading-none mt-1">
                                  {sumRemaining.toLocaleString("en-US", { maximumFractionDigits: 1 })}
                                </div>
                              </div>
                            </th>
                            
                            <th className="bg-rose-200 p-1.5 font-bold text-rose-950 w-[95px] min-w-[95px] text-center border-l border-slate-200 align-middle">
                              <div className="rounded p-1 border text-center bg-rose-50 border-rose-300 text-rose-950 shadow-sm mx-1">
                                <div className="text-[8px] font-bold opacity-80 leading-tight">کل (Kg):</div>
                                <div className="text-[12px] font-black tracking-tight leading-none mt-1">
                                  {sumShortage.toLocaleString("en-US", { maximumFractionDigits: 1 })}
                                </div>
                              </div>
                            </th>

                            {driverSearchSlots.map((slot, idx) => {
                              const realIdx = 9 - idx;
                              const driver = driverSearchSlots[realIdx];
                              
                              let slotTotalWeight = 0;
                              
                              if (driver) {
                                invoices
                                  .filter((inv) => isSameDriver(inv.driverName, driver) && inv.isActive !== false)
                                  .forEach((inv) => {
                                    filteredProducts.forEach((p) => {
                                      const q = Number(inv.quantities[p.id] || 0);
                                      if (q > 0) {
                                        slotTotalWeight += q;
                                      }
                                    });
                                  });
                                searchGrandTotalWeight += slotTotalWeight;
                              }
                              
                              return (
                                <th key={idx} className="bg-orange-50/90 py-1.5 px-1.5 border-l border-slate-200 text-center w-[110px] min-w-[110px] align-middle">
                                  <div className="rounded p-1 border text-center bg-orange-100 border-orange-200 text-orange-950 shadow-sm mx-1">
                                    <div className="text-[8px] font-bold opacity-80 leading-tight">کل (Kg):</div>
                                    <div className="text-[12px] font-black tracking-tight leading-none mt-1">
                                      {slotTotalWeight > 0 ? slotTotalWeight.toLocaleString("en-US", { maximumFractionDigits: 1 }) : "-"}
                                    </div>
                                  </div>
                                </th>
                              );
                            }).reverse()}
                            
                            <th className="bg-orange-100 p-1.5 border-l border-slate-200 align-middle w-[115px] min-w-[115px]">
                              <div className="rounded p-1 border text-center bg-orange-200 border-orange-300 text-slate-950 shadow-sm mx-1">
                                <div className="text-[8px] font-bold opacity-80 leading-tight">کل (Kg):</div>
                                <div className="text-[12px] font-black tracking-tight leading-none mt-1">
                                  {searchGrandTotalWeight > 0 ? searchGrandTotalWeight.toLocaleString("en-US", { maximumFractionDigits: 1 }) : "0"}
                                </div>
                              </div>
                            </th>
                          </>
                        );
                      })()}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 bg-white">
                    {validProducts
                      .filter((p) => selectedCategoryFilter === "all" || p.category === selectedCategoryFilter)
                      .map((p, pIndex, filteredArr) => {
                        const allocated = allocatedQuantities[p.id] || 0;
                        const currentStock = getProductStock(p.id, p.defaultStock);
                        const remainingStock = currentStock - allocated;
                        const isShortage = remainingStock < 0;

                        const isFirstInGroup = pIndex === 0 || filteredArr[pIndex - 1].category !== p.category;
                        const isLastInGroup = pIndex === filteredArr.length - 1 || filteredArr[pIndex + 1].category !== p.category;
                        const borderBottomClass = isLastInGroup ? "border-b-[3px] border-red-600" : "border-b border-slate-200";

                        return (
                          <tr key={p.id} className="hover:bg-slate-50 group transition-colors duration-150">
                            <td 
                              className={`sticky right-0 z-20 ${isProductEditMode ? "p-1" : "py-2 px-1"} border-l border-slate-200 text-center transition w-[110px] shadow-[[-3px_0_6px_rgba(0,0,0,0.06)]] ${borderBottomClass} ${
                                isFirstInGroup
                                  ? "bg-blue-200 text-black font-black text-[12px] group-focus-within:bg-blue-300 group-focus-within:text-blue-950 group-focus-within:group-hover:bg-blue-300 group-focus-within:group-hover:text-blue-950"
                                  : "bg-blue-100 text-black font-bold text-[11.5px] group-hover:bg-blue-200 group-focus-within:bg-blue-300 group-focus-within:text-blue-950 group-focus-within:group-hover:bg-blue-300 group-focus-within:group-hover:text-blue-950"
                              }`}
                              style={{ right: 0 }}
                            >
                              <div className="leading-normal">
                                {isProductEditMode ? (
                                  <EditableProductCell
                                    value={p.category}
                                    onSave={(newVal) => {
                                      const updated = products.map((prod) => 
                                        prod.id === p.id ? { ...prod, category: newVal } : prod
                                      );
                                      setProducts(updated);
                                      saveMasterConfig(drivers, updated);
                                    }}
                                  />
                                ) : (
                                  <span>{p.category}</span>
                                )}
                              </div>
                            </td>

                            <td 
                              className={`sticky z-20 ${isProductEditMode ? "p-1" : "py-2 px-1"} border-l border-slate-200 text-center bg-blue-50 text-black transition w-[90px] font-black text-[11.5px] leading-normal group-hover:bg-blue-100 group-focus-within:bg-blue-300 group-focus-within:text-blue-950 group-focus-within:group-hover:bg-blue-300 group-focus-within:group-hover:text-blue-950 ${borderBottomClass}`}
                              style={{ right: '110px' }}
                            >
                              <div>
                                {isProductEditMode ? (
                                  <EditableProductCell
                                    value={p.flavor}
                                    onSave={(newVal) => {
                                      const updated = products.map((prod) => 
                                        prod.id === p.id ? { ...prod, flavor: newVal } : prod
                                      );
                                      setProducts(updated);
                                      saveMasterConfig(drivers, updated);
                                    }}
                                  />
                                ) : (
                                  <span>{p.flavor || "-"}</span>
                                )}
                              </div>
                            </td>

                            {invoices.map((inv, invIndex) => {
                              const qty = inv.quantities[p.id] || 0;
                              const isActive = inv.isActive !== false;
                              const isSelectedCell = isGridCellSelected(pIndex, invIndex);
                              return (
                                <td
                                  key={inv.id}
                                  data-row={pIndex}
                                  data-col={invIndex}
                                  onMouseDown={(e) => handleGridCellMouseDown(pIndex, invIndex, e)}
                                  onMouseEnter={() => handleGridCellMouseEnter(pIndex, invIndex)}
                                  className={`p-0.5 border-l border-slate-200 text-center select-none ${getDriverCellColorClass(inv.driverName, inv.round, qty, isActive, drivers)} ${borderBottomClass} ${isSelectedCell ? "ring-2 ring-inset ring-emerald-500 bg-emerald-100/60" : ""}`}
                                >
                                  <input
                                    id={`cell-${invIndex}-${pIndex}`}
                                    type="number"
                                    onWheel={(e) => e.currentTarget.blur()}
                                    min="0"
                                    value={qty || ""}
                                    onChange={(e) => handleUpdateCell(inv.id, p.id, Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === "ArrowDown") {
                                        e.preventDefault();
                                        const nextInput = document.getElementById(`cell-${invIndex}-${pIndex + 1}`);
                                        if (nextInput) {
                                          nextInput.focus();
                                          (nextInput as HTMLInputElement).select();
                                        }
                                      } else if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        const prevInput = document.getElementById(`cell-${invIndex}-${pIndex - 1}`);
                                        if (prevInput) {
                                          prevInput.focus();
                                          (prevInput as HTMLInputElement).select();
                                        }
                                      }
                                    }}
                                    className={`border rounded py-0.5 px-0.5 h-7 w-full font-mono text-center font-extrabold text-xs focus:outline-none bg-transparent ${
                                      !isActive
                                        ? "text-slate-400 border-slate-200 cursor-not-allowed opacity-40"
                                        : "text-slate-950 border-current/30 focus:border-current focus:bg-white/50"
                                    }`}
                                    placeholder="-"
                                    disabled={!isActive}
                                  />
                                </td>
                              );
                            })}

                            <td className={`py-1 px-0.5 border-l border-slate-200 text-center bg-emerald-100 font-mono text-emerald-950 w-[95px] ${borderBottomClass} group-focus-within:bg-blue-300 group-focus-within:text-blue-950 group-focus-within:group-hover:bg-blue-300 group-focus-within:group-hover:text-blue-950`}>
                              <div className="font-extrabold text-xs">{allocated > 0 ? allocated.toLocaleString("en-US") : "0"}</div>
                            </td>

                            <td className={`p-0.5 border-l border-slate-200 text-center bg-emerald-100/60 w-[95px] ${borderBottomClass} group-focus-within:bg-blue-300 group-focus-within:text-blue-950 group-focus-within:group-hover:bg-blue-300 group-focus-within:group-hover:text-blue-950`}>
                              <div className="flex flex-col items-center justify-center gap-0.5">
                                                                 <input
                                   id={`stock-${pIndex}`}
                                   type="text"
                                   inputMode="text"
                                   onWheel={(e) => e.currentTarget.blur()}
                                   value={
                                     stockInputValues[p.id] !== undefined
                                       ? stockInputValues[p.id]
                                       : (manualStockOverrides[p.id] !== undefined && manualStockOverrides[p.id] !== null ? manualStockOverrides[p.id].toString() : "")
                                   }
                                   onChange={(e) => {
                                     const val = e.target.value;
                                     setStockInputValues(prev => ({ ...prev, [p.id]: val }));
                                     if (!val.startsWith('=')) {
                                       if (val === "") {
                                         handleUpdateStockOverride(p.id, null);
                                       } else {
                                         const parsed = parseFloat(val);
                                         if (!isNaN(parsed)) {
                                           handleUpdateStockOverride(p.id, parsed);
                                         }
                                       }
                                     } else {
                                       const evaluated = evaluateStockFormula(val);
                                       if (evaluated !== null) {
                                         handleUpdateStockOverride(p.id, evaluated);
                                       }
                                     }
                                   }}
                                   onBlur={() => {
                                     const raw = stockInputValues[p.id];
                                     if (raw && raw.startsWith('=')) {
                                       const evaluated = evaluateStockFormula(raw);
                                       if (evaluated !== null) {
                                         handleUpdateStockOverride(p.id, evaluated);
                                         setStockInputValues(prev => ({ ...prev, [p.id]: evaluated.toString() }));
                                       }
                                     }
                                   }}
                                   onKeyDown={(e) => {
                                     if (e.key === "Enter" || e.key === "ArrowDown") {
                                       e.preventDefault();
                                       const raw = stockInputValues[p.id];
                                       if (raw && raw.startsWith('=')) {
                                         const evaluated = evaluateStockFormula(raw);
                                         if (evaluated !== null) {
                                           handleUpdateStockOverride(p.id, evaluated);
                                           setStockInputValues(prev => ({ ...prev, [p.id]: evaluated.toString() }));
                                         }
                                       }
                                       const nextInput = document.getElementById(`stock-${pIndex + 1}`);
                                       if (nextInput) {
                                         nextInput.focus();
                                         (nextInput as HTMLInputElement).select();
                                       }
                                     } else if (e.key === "ArrowUp") {
                                       e.preventDefault();
                                       const raw = stockInputValues[p.id];
                                       if (raw && raw.startsWith('=')) {
                                         const evaluated = evaluateStockFormula(raw);
                                         if (evaluated !== null) {
                                           handleUpdateStockOverride(p.id, evaluated);
                                           setStockInputValues(prev => ({ ...prev, [p.id]: evaluated.toString() }));
                                         }
                                       }
                                       const prevInput = document.getElementById(`stock-${pIndex - 1}`);
                                       if (prevInput) {
                                         prevInput.focus();
                                         (prevInput as HTMLInputElement).select();
                                       }
                                     }
                                   }}
                                   className="bg-white text-emerald-950 border border-emerald-300 rounded py-0.5 px-0.5 h-7 w-full font-mono text-center font-extrabold text-xs focus:outline-none focus:border-emerald-500 transition-all focus:bg-slate-50"
                                   placeholder={currentStock.toString()}
                                 />
                              </div>
                            </td>

                            <td className={`py-1 px-0.5 border-l border-slate-200 text-center bg-emerald-100 font-mono text-emerald-950 w-[95px] ${borderBottomClass} group-focus-within:bg-blue-300 group-focus-within:text-blue-950 group-focus-within:group-hover:bg-blue-300 group-focus-within:group-hover:text-blue-950`}>
                              <div className="font-extrabold text-xs">{currentStock !== 0 ? currentStock.toLocaleString("en-US") : "0"}</div>
                            </td>

                            <td
                              className={`py-1 px-0.5 border-l border-slate-200 text-center font-mono transition w-[95px] ${borderBottomClass} ${
                                isShortage 
                                  ? "bg-rose-100 text-rose-700 font-extrabold group-focus-within:bg-blue-300 group-focus-within:text-blue-950 group-focus-within:group-hover:bg-blue-300 group-focus-within:group-hover:text-blue-950" 
                                  : "bg-emerald-200 text-emerald-950 font-extrabold group-focus-within:bg-blue-300 group-focus-within:text-blue-950 group-focus-within:group-hover:bg-blue-300 group-focus-within:group-hover:text-blue-950"
                              }`}
                            >
                              <div className="font-extrabold text-xs">
                                {remainingStock.toLocaleString("en-US")}
                              </div>
                            </td>

                            <td
                              className={`py-1 px-0.5 border-l border-slate-200 text-center font-mono transition w-[95px] ${borderBottomClass} ${
                                isShortage 
                                  ? "bg-rose-200 text-rose-800 font-extrabold group-focus-within:bg-rose-300 group-focus-within:text-rose-950 group-focus-within:group-hover:bg-rose-300 group-focus-within:group-hover:text-rose-950" 
                                  : "bg-slate-50 text-slate-400 group-focus-within:bg-blue-100 group-focus-within:text-slate-500 group-focus-within:group-hover:bg-blue-100 group-focus-within:group-hover:text-slate-500"
                              }`}
                            >
                              <div className="font-extrabold text-xs">
                                {isShortage ? Math.abs(remainingStock).toLocaleString("en-US") : "0"}
                              </div>
                            </td>
                            {driverSearchSlots.map((slot, idx) => {
                              const realIdx = 9 - idx;
                              const driver = driverSearchSlots[realIdx];
                              let productWeight = 0;
                              if (driver) {
                                invoices
                                  .filter((inv) => isSameDriver(inv.driverName, driver) && inv.isActive !== false)
                                  .forEach((inv) => {
                                    productWeight += Number(inv.quantities[p.id] || 0);
                                  });
                              }
                              return (
                                <td key={idx} className={`py-1 px-1 border-l border-slate-200 font-mono text-center text-xs text-slate-700 font-extrabold bg-orange-50/15 group-hover:bg-orange-100/30 w-[110px] min-w-[110px] ${borderBottomClass} group-focus-within:bg-blue-300 group-focus-within:text-blue-950 group-focus-within:group-hover:bg-blue-300 group-focus-within:group-hover:text-blue-950`}>
                                  {productWeight > 0 ? productWeight.toLocaleString("en-US") : "0"}
                                </td>
                              );
                            }).reverse()}
                            <td className={`py-1 px-1 border-l border-slate-200 font-mono text-center text-xs text-slate-900 font-black bg-orange-100/20 group-hover:bg-orange-100/40 w-[115px] min-w-[115px] ${borderBottomClass} group-focus-within:bg-blue-300 group-focus-within:text-blue-950 group-focus-within:group-hover:bg-blue-300 group-focus-within:group-hover:text-blue-950`}>
                              {(() => {
                                let rowTotal = 0;
                                driverSearchSlots.forEach((driver) => {
                                  if (driver) {
                                    invoices
                                      .filter((inv) => isSameDriver(inv.driverName, driver) && inv.isActive !== false)
                                      .forEach((inv) => {
                                        rowTotal += Number(inv.quantities[p.id] || 0);
                                      });
                                  }
                                });
                                return rowTotal > 0 ? rowTotal.toLocaleString("en-US") : "0";
                              })()}
                            </td>
                          </tr>
                        );
                      })}

                    {validProducts.length === 0 && (
                      <tr>
                        <td colSpan={invoices.length + 6} className="text-center text-slate-500 py-16">
                          هیچ کالا یا طعمی در پیکربندی پایه ثبت نشده است. ابتدا به تب "پیکربندی پایه" مراجعه کنید.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-right mt-3 text-xs text-amber-800 dark:text-amber-300 font-extrabold flex justify-start no-print">
              <span className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl px-4 py-2.5 shadow-sm inline-block animate-pulse">
                💡 برای ثبت قطعی تغییرات فاکتورها، دکمه سبز رنگ "ثبت نهایی تغییرات" را حتما بزنید.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
