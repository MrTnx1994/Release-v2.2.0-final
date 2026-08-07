import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

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
    <div className="fixed bottom-5 left-5 z-50 no-print flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1 gap-1 transition-all duration-300 text-slate-700 dark:text-slate-200 animate-green-red-blink" dir="ltr">
      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center"
        title="کوچک‌نمایی (Ctrl + -)"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="w-[1px] h-5 my-auto bg-slate-200 dark:bg-slate-800" />

      {/* Zoom label & Preset Popover */}
      <div className="relative">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="px-2.5 py-1 text-xs font-black text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer font-mono min-w-[50px] text-center"
          title="تنظیم درصد بزرگ‌نمایی / بازنشانی (Ctrl + 0)"
        >
          <span ref={zoomLabelRef}>{currentZoom}%</span>
        </button>

        {showPresets && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 grid grid-cols-2 gap-1.5 min-w-[130px] animate-in fade-in zoom-in-95 duration-150 z-50 text-slate-900 dark:text-slate-100">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  if (handleSetPreset) handleSetPreset(p);
                  setShowPresets(false);
                }}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                  currentZoom === p
                    ? "bg-cyan-500 text-white shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {p}%
              </button>
            ))}
            <button
              onClick={() => {
                handleZoomReset();
                setShowPresets(false);
              }}
              className="col-span-2 mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              پیش‌فرض (۸۰٪)
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-[1px] h-5 my-auto bg-slate-200 dark:bg-slate-800" />

      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center"
        title="بزرگ‌نمایی (Ctrl + +)"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="w-[1px] h-5 my-auto bg-slate-200 dark:bg-slate-800" />

      {/* Reset button */}
      <button
        onClick={handleZoomReset}
        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center"
        title="بازنشانی به ۸۰٪"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
