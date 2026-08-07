import React, { useEffect, useRef, useState } from "react";
import { Product, InvoiceRun } from "../types";
import { NotificationType } from "./useNotification";

type GridCellSelection = { startRow: number; startCol: number; endRow: number; endCol: number };

export interface SelectionStats {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

interface UseGridCellSelectionDeps {
  validProducts: Product[];
  selectedCategoryFilter: string;
  invoices: InvoiceRun[];
  setInvoices: React.Dispatch<React.SetStateAction<InvoiceRun[]>>;
  invoicesRef: React.MutableRefObject<InvoiceRun[]>;
  formattedDate: string;
  showNotification: (type: NotificationType, message: string) => void;
}

export function useGridCellSelection({
  validProducts,
  selectedCategoryFilter,
  invoices,
  setInvoices,
  invoicesRef,
  formattedDate,
  showNotification,
}: UseGridCellSelectionDeps) {
  const [cellSelection, setCellSelection] = useState<GridCellSelection | null>(null);
  const isDraggingSelectionRef = useRef(false);
  const selectionAnchorRef = useRef<{ row: number; col: number } | null>(null);
  const dragCellsCacheRef = useRef<{ el: HTMLElement; row: number; col: number }[]>([]);
  const dragRafIdRef = useRef<number | null>(null);
  const pendingDragRangeRef = useRef<GridCellSelection | null>(null);
  const sumBarCountRef = useRef<HTMLSpanElement>(null);
  const sumBarValueRef = useRef<HTMLSpanElement>(null);

  const HIGHLIGHT_CLASSES = ["ring-2", "ring-inset", "ring-emerald-500", "bg-emerald-100/60"];

  const visibleProductsForGrid = React.useMemo(
    () => validProducts.filter((p) => selectedCategoryFilter === "all" || p.category === selectedCategoryFilter),
    [validProducts, selectedCategoryFilter]
  );

  const buildDragCellsCache = () => {
    const container = document.getElementById("main-unified-grid");
    if (!container) {
      dragCellsCacheRef.current = [];
      return;
    }
    const nodeList = container.querySelectorAll<HTMLElement>("td[data-row][data-col]");
    const cells: { el: HTMLElement; row: number; col: number }[] = [];
    nodeList.forEach((el) => {
      const row = parseInt(el.getAttribute("data-row") || "-1", 10);
      const col = parseInt(el.getAttribute("data-col") || "-1", 10);
      if (row >= 0 && col >= 0) cells.push({ el, row, col });
    });
    dragCellsCacheRef.current = cells;
  };

  const applyDragHighlightAndSum = (sel: GridCellSelection | null) => {
    const range = sel ? {
      minRow: Math.min(sel.startRow, sel.endRow),
      maxRow: Math.max(sel.startRow, sel.endRow),
      minCol: Math.min(sel.startCol, sel.endCol),
      maxCol: Math.max(sel.startCol, sel.endCol),
    } : null;

    let count = 0;
    let sum = 0;

    dragCellsCacheRef.current.forEach(({ el, row, col }) => {
      const inRange = !!range && row >= range.minRow && row <= range.maxRow && col >= range.minCol && col <= range.maxCol;
      if (inRange) {
        el.classList.add(...HIGHLIGHT_CLASSES);
        const product = visibleProductsForGrid[row];
        const inv = invoicesRef.current[col];
        if (product && inv) {
          count++;
          sum += Number(inv.quantities[product.id]) || 0;
        }
      } else {
        el.classList.remove(...HIGHLIGHT_CLASSES);
      }
    });

    if (sumBarCountRef.current) sumBarCountRef.current.textContent = count.toLocaleString("en-US");
    if (sumBarValueRef.current) sumBarValueRef.current.textContent = sum.toLocaleString("en-US");
  };

  const flushDragSelection = () => {
    dragRafIdRef.current = null;
    if (pendingDragRangeRef.current) {
      applyDragHighlightAndSum(pendingDragRangeRef.current);
    }
  };

  const scheduleDragSelectionUpdate = (sel: GridCellSelection) => {
    pendingDragRangeRef.current = sel;
    if (dragRafIdRef.current === null) {
      dragRafIdRef.current = requestAnimationFrame(flushDragSelection);
    }
  };

  useEffect(() => {
    const onMouseUp = () => {
      if (!isDraggingSelectionRef.current) return;
      isDraggingSelectionRef.current = false;
      if (dragRafIdRef.current !== null) {
        cancelAnimationFrame(dragRafIdRef.current);
        dragRafIdRef.current = null;
      }
      if (pendingDragRangeRef.current) {
        setCellSelection(pendingDragRangeRef.current);
        pendingDragRangeRef.current = null;
      }
    };
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      if (dragRafIdRef.current !== null) cancelAnimationFrame(dragRafIdRef.current);
    };
  }, []);

  useEffect(() => {
    setCellSelection(null);
    selectionAnchorRef.current = null;
  }, [formattedDate, selectedCategoryFilter]);

  const handleGridCellMouseDown = (row: number, col: number, e: React.MouseEvent) => {
    isDraggingSelectionRef.current = true;
    buildDragCellsCache();
    let range: GridCellSelection;
    if (e.shiftKey && selectionAnchorRef.current) {
      range = { startRow: selectionAnchorRef.current.row, startCol: selectionAnchorRef.current.col, endRow: row, endCol: col };
    } else {
      selectionAnchorRef.current = { row, col };
      range = { startRow: row, startCol: col, endRow: row, endCol: col };
    }
    setCellSelection(range);
    applyDragHighlightAndSum(range);
  };

  const handleGridCellMouseEnter = (row: number, col: number) => {
    if (isDraggingSelectionRef.current && selectionAnchorRef.current) {
      scheduleDragSelectionUpdate({ startRow: selectionAnchorRef.current.row, startCol: selectionAnchorRef.current.col, endRow: row, endCol: col });
    }
  };

  const gridSelectionRange = cellSelection ? {
    minRow: Math.min(cellSelection.startRow, cellSelection.endRow),
    maxRow: Math.max(cellSelection.startRow, cellSelection.endRow),
    minCol: Math.min(cellSelection.startCol, cellSelection.endCol),
    maxCol: Math.max(cellSelection.startCol, cellSelection.endCol),
  } : null;

  const isGridCellSelected = (row: number, col: number): boolean => {
    if (!gridSelectionRange) return false;
    return row >= gridSelectionRange.minRow && row <= gridSelectionRange.maxRow &&
           col >= gridSelectionRange.minCol && col <= gridSelectionRange.maxCol;
  };

  const gridSelectionStats: SelectionStats = React.useMemo(() => {
    if (!gridSelectionRange) return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
    let sum = 0;
    let count = 0;
    let min = Infinity;
    let max = -Infinity;

    for (let r = gridSelectionRange.minRow; r <= gridSelectionRange.maxRow; r++) {
      const product = visibleProductsForGrid[r];
      if (!product) continue;
      for (let c = gridSelectionRange.minCol; c <= gridSelectionRange.maxCol; c++) {
        const inv = invoices[c];
        if (!inv) continue;
        const val = Number(inv.quantities[product.id]) || 0;
        count++;
        sum += val;
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }

    const avg = count > 0 ? Number((sum / count).toFixed(1)) : 0;
    return {
      count,
      sum,
      avg,
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
    };
  }, [gridSelectionRange, visibleProductsForGrid, invoices]);

  const handleClearSelectedGridCells = () => {
    if (!gridSelectionRange) return;
    const productIdsInSelection = new Set<string>();
    for (let r = gridSelectionRange.minRow; r <= gridSelectionRange.maxRow; r++) {
      const product = visibleProductsForGrid[r];
      if (product) productIdsInSelection.add(product.id);
    }
    setInvoices(
      invoices.map((inv, colIdx) => {
        if (colIdx < gridSelectionRange.minCol || colIdx > gridSelectionRange.maxCol) return inv;
        const newQuantities = { ...inv.quantities };
        productIdsInSelection.forEach((pid) => { delete newQuantities[pid]; });
        return { ...inv, quantities: newQuantities };
      })
    );
    showNotification("info", `مقادیر ${gridSelectionStats.count} سلول انتخاب‌شده صفر/پاک شد.`);
    setCellSelection(null);
    selectionAnchorRef.current = null;
  };

  return {
    cellSelection, setCellSelection,
    selectionAnchorRef,
    sumBarCountRef, sumBarValueRef,
    gridSelectionStats,
    handleGridCellMouseDown,
    handleGridCellMouseEnter,
    handleClearSelectedGridCells,
    isGridCellSelected,
  };
}
