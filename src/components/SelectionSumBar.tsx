import React from "react";
import { Trash2 } from "lucide-react";

interface SelectionSumBarProps {
  gridSelectionStats: { count: number; sum: number };
  sumBarCountRef: React.RefObject<HTMLSpanElement>;
  sumBarValueRef: React.RefObject<HTMLSpanElement>;
  handleClearSelectedGridCells: () => void;
  setCellSelection: (val: any) => void;
  selectionAnchorRef: React.MutableRefObject<any>;
}

// Floating pill shown at the bottom of the screen while cells are drag-selected
// in the planning grid: live count + sum (updated via refs for performance),
// clear button, and a dismiss button.
export const SelectionSumBar: React.FC<SelectionSumBarProps> = ({
  gridSelectionStats,
  sumBarCountRef,
  sumBarValueRef,
  handleClearSelectedGridCells,
  setCellSelection,
  selectionAnchorRef,
}) => {
  if (gridSelectionStats.count === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 no-print flex items-center gap-2 bg-slate-900/95 text-white rounded-full shadow-lg px-3 py-1.5 backdrop-blur-sm">
      <span ref={sumBarCountRef} className="text-[10px] font-bold text-slate-400">
        {gridSelectionStats.count.toLocaleString("en-US")}
      </span>
      <span className="text-[10px] font-bold text-slate-400 -mr-1.5">سلول</span>
      <span className="w-px h-3 bg-slate-700" />
      <span className="text-[11px] font-black text-emerald-400 font-mono">
        <span ref={sumBarValueRef}>{gridSelectionStats.sum.toLocaleString("en-US")}</span>
      </span>
      <button
        onClick={handleClearSelectedGridCells}
        className="flex items-center justify-center bg-rose-600/90 hover:bg-rose-500 transition-colors text-white rounded-full w-5 h-5 cursor-pointer"
        title="پاک کردن مقادیر سلول‌های انتخاب‌شده"
      >
        <Trash2 className="w-2.5 h-2.5" />
      </button>
      <button
        onClick={() => { setCellSelection(null); selectionAnchorRef.current = null; }}
        className="text-slate-500 hover:text-white transition-colors text-[11px] leading-none cursor-pointer"
        title="لغو انتخاب"
      >
        ✕
      </button>
    </div>
  );
};
