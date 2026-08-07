import { useEffect, useRef, useState } from "react";

const ZOOM_STEP = 10;
const ZOOM_MIN = 40;
const ZOOM_MAX = 180;
const ZOOM_DEFAULT = 80;
const STORAGE_KEY = "borna_planning_grid_zoom";

export function useGridZoom() {
  const [currentZoom, setCurrentZoom] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= ZOOM_MIN && parsed <= ZOOM_MAX) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return ZOOM_DEFAULT;
  });

  const gridZoomRef = useRef(currentZoom);
  const gridZoomWrapperRef = useRef<HTMLDivElement>(null);
  const zoomLabelRef = useRef<HTMLSpanElement>(null);

  const applyZoom = (newZoom: number) => {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, newZoom));
    gridZoomRef.current = clamped;
    setCurrentZoom(clamped);

    try {
      localStorage.setItem(STORAGE_KEY, clamped.toString());
    } catch (e) {
      // ignore
    }

    if (gridZoomWrapperRef.current) {
      gridZoomWrapperRef.current.style.zoom = `${clamped}%`;
    }
    if (zoomLabelRef.current) {
      zoomLabelRef.current.textContent = `${clamped}%`;
    }
  };

  const handleZoomIn = () => applyZoom(gridZoomRef.current + ZOOM_STEP);
  const handleZoomOut = () => applyZoom(gridZoomRef.current - ZOOM_STEP);
  const handleZoomReset = () => applyZoom(ZOOM_DEFAULT);
  const handleSetPreset = (val: number) => applyZoom(val);

  useEffect(() => {
    applyZoom(gridZoomRef.current);

    // Keyboard shortcut handler (Ctrl + Wheel or Ctrl + Plus/Minus)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === "-") {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === "0") {
          e.preventDefault();
          handleZoomReset();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    currentZoom,
    gridZoomRef,
    gridZoomWrapperRef,
    zoomLabelRef,
    applyZoom,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleSetPreset,
  };
}
