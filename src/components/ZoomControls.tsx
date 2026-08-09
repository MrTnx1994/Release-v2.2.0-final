import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, SlidersHorizontal } from "lucide-react";

interface ZoomControlsProps {
  zoomLabelRef: React.RefObject<HTMLSpanElement>;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
  handleSetPreset?: (val: number) => void;
  currentZoom?: number;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomLabelRef,
  handleZoomIn,
  handleZoomOut,
  handleZoomReset,
  handleSetPreset,
  currentZoom = 80
}) => {
  const [showPresets, setShowPresets] = useState(false);
  const PRESETS = [50, 65, 75, 80, 90, 100, 115, 130];

  return (
    <div
      className="fixed bottom-4 left-4 z-50 no-print flex items-center gap-0.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/90 rounded-xl shadow-lg px-1 py-1 text-slate-700 dark:text-slate-200"
      dir="ltr"
      aria-label="کنترل بزرگنمایی جدول"
    >
      <button
        type="button"
        onClick={handleZoomOut}
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
        title="کوچک‌نمایی (Ctrl + -)"
        aria-label="کوچک‌نمایی"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPresets(v => !v)}
          className="h-7 min-w-[44px] px-1.5 rounded-lg text-[11px] font-black font-mono tabular-nums hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="انتخاب درصد بزرگنمایی"
          aria-expanded={showPresets}
        >
          <span ref={zoomLabelRef}>{currentZoom}%</span>
        </button>

        {showPresets && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 grid grid-cols-4 gap-1 min-w-[150px] z-50">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  handleSetPreset?.(p);
                  setShowPresets(false);
                }}
                className={`h-7 rounded-md text-[10px] font-bold font-mono transition cursor-pointer ${
                  currentZoom === p
                    ? "bg-cyan-500 text-white"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {p}%
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                handleZoomReset();
                setShowPresets(false);
              }}
              className="col-span-4 mt-0.5 h-7 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              پیش‌فرض ۸۰٪
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />

      <button
        type="button"
        onClick={handleZoomIn}
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
        title="بزرگ‌نمایی (Ctrl + +)"
        aria-label="بزرگ‌نمایی"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={handleZoomReset}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
        title="بازنشانی به ۸۰٪"
        aria-label="بازنشانی بزرگنمایی"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
