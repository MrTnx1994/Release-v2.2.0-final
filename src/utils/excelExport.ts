import { InvoiceRun, Product, Driver } from "../types";
import { getDriverHexColor, getDriverCellHexColor, isSameDriver } from "./driverHelpers";
import { getInvoiceWeight } from "./invoiceCalculations";

// --- style helpers ---------------------------------------------------------

// Converts our app's hex colors (either "#RRGGBB" or the "#RRGGBBAA" alpha
// variant used for empty/light cells) into the "AARRGGBB" format xlsx-js-style
// expects. The alpha variant is blended against white rather than passed
// through, since real alpha transparency isn't meaningfully supported by
// Excel cell fills.
function toArgb(hex: string): string {
  let h = hex.replace("#", "");
  if (h.length === 8) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = parseInt(h.slice(6, 8), 16) / 255;
    const blend = (c: number) => Math.round(c * a + 255 * (1 - a));
    h = [blend(r), blend(g), blend(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  return "FF" + h.toUpperCase();
}

const THIN_BORDER = {
  top: { style: "thin", color: { rgb: "FF94A3B8" } },
  bottom: { style: "thin", color: { rgb: "FF94A3B8" } },
  left: { style: "thin", color: { rgb: "FF94A3B8" } },
  right: { style: "thin", color: { rgb: "FF94A3B8" } },
};

interface CellOpts {
  bold?: boolean;
  color?: string;
  size?: number;
  align?: "center" | "right" | "left";
}

function cell(value: string | number, bg: string, opts: CellOpts = {}) {
  return {
    v: value,
    t: typeof value === "number" ? "n" : "s",
    s: {
      fill: { fgColor: { rgb: toArgb(bg) } },
      font: { bold: opts.bold ?? true, sz: opts.size ?? 10, color: { rgb: toArgb(opts.color || "#000000") } },
      alignment: { horizontal: opts.align || "center", vertical: "center", wrapText: true },
      border: THIN_BORDER,
    },
  };
}

// --- main export -------------------------------------------------------------

export const exportToExcelHtml = async (
  invoices: InvoiceRun[],
  validProducts: Product[],
  allocatedQuantities: { [productId: string]: number },
  getProductStock: (id: string, defaultStock: number) => number,
  manualStockOverrides: { [productId: string]: number },
  driverSearchSlots: string[],
  selectedCategoryFilter: string,
  formattedDate: string,
  showNotification: (type: "success" | "error" | "info", msg: string) => void,
  drivers: Driver[] = []
) => {
  try {
    // Loaded on demand instead of imported statically: xlsx-js-style is large
    // and most people using the app never click "export to Excel", so it
    // shouldn't be in everyone's initial page-load bundle.
    const XLSXModule: any = await import("xlsx-js-style");
    const XLSX: any = XLSXModule.utils ? XLSXModule : XLSXModule.default;

    const filteredProducts = validProducts.filter((p) => selectedCategoryFilter === "all" || p.category === selectedCategoryFilter);
    const dateStr = formattedDate ? formattedDate.replace(/\//g, "-") : "امروز";

    const numInvoices = invoices.length;
    const numSlots = driverSearchSlots.length;

    // Column layout: category, flavor, [invoices...], allocated, manualStock,
    // actualStock, remaining, shortage, [search slots...], grandTotal
    const colInvoiceStart = 2;
    const colStatsStart = colInvoiceStart + numInvoices;
    const colSlotsStart = colStatsStart + 5;
    const colGrandTotal = colSlotsStart + numSlots;
    const numCols = colGrandTotal + 1;

    // Reversed search-slot order, matching the on-screen grid (slot 10 shown first).
    const orderedSlots = driverSearchSlots.map((_, idx) => driverSearchSlots[numSlots - 1 - idx]).reverse();

    const grid: any[][] = [];
    const merges: any[] = [];
    const emptyRow = () => new Array(numCols).fill(null);

    // Row 0: Headers
    const headerRow = emptyRow();
    headerRow[0] = cell("نوع مغز", "#93C5FD", { color: "#000000", bold: true });
    headerRow[1] = cell("طعم", "#93C5FD", { color: "#000000", bold: true });

    invoices.forEach((inv, i) => {
      const active = inv.isActive !== false ? "فعال" : "غیرفعال";
      const headerText = `${i + 1} - ${active}\nمشتری: ${inv.customerName || "-"}\nراننده: ${inv.driverName || "بدون راننده"}\nمسیر: ${inv.destinationLocation || "-"}\nباربری: ${inv.shippingAgency || "-"}\nتوضیحات: ${inv.description || "-"}\nوزن کل: ${getInvoiceWeight(inv).toLocaleString()} Kg`;
      headerRow[colInvoiceStart + i] = cell(headerText, getDriverHexColor(inv.driverName, drivers), { align: "right" });
    });

    headerRow[colStatsStart] = cell("کل تخصیص یافته", "#D1FAE5", { color: "#065F46", bold: true });
    headerRow[colStatsStart + 1] = cell("موجودی دستی", "#E2E8F0", { color: "#334155", bold: true });
    headerRow[colStatsStart + 2] = cell("موجودی واقعی", "#D1FAE5", { color: "#065F46", bold: true });
    headerRow[colStatsStart + 3] = cell("باقیمانده", "#D1FAE5", { color: "#065F46", bold: true });
    headerRow[colStatsStart + 4] = cell("کسری", "#FEE2E2", { color: "#991B1B", bold: true });

    orderedSlots.forEach((driver, i) => {
      headerRow[colSlotsStart + i] = cell(`جستجو ${i + 1}:\n${driver || "(خالی)"}`, "#FFE8A3", { color: "#78350F", bold: true, align: "center" });
    });

    headerRow[colGrandTotal] = cell("جمع کل جستجو", "#FFEDD5", { color: "#7C2D12", bold: true });

    grid.push(headerRow);

    // --- data rows -------------------------------------------------------

    filteredProducts.forEach((p, pIndex) => {
      const allocated = allocatedQuantities[p.id] || 0;
      const currentStock = getProductStock(p.id, p.defaultStock);
      const manualStock = manualStockOverrides[p.id];
      const remainingStock = currentStock - allocated;
      const isShortage = remainingStock < 0;
      
      const isFirstInGroup = pIndex === 0 || filteredProducts[pIndex - 1].category !== p.category;
      const row = emptyRow();
      row[0] = cell(p.category, isFirstInGroup ? "#BFDBFE" : "#DBEAFE", { align: "center" });
      row[1] = cell(`${p.flavor || "-"}`, "#EFF6FF", { align: "right" });

      invoices.forEach((inv, i) => {
        const qty = Number(inv.quantities[p.id]) || 0;
        const isActive = inv.isActive !== false;
        const text = qty > 0 ? `${qty.toLocaleString()} Kg` : "-";
        row[colInvoiceStart + i] = cell(text, getDriverCellHexColor(inv.driverName, qty, isActive, drivers), { bold: qty > 0, color: qty > 0 ? "#000000" : "#94A3B8" });
      });

      row[colStatsStart] = cell(allocated > 0 ? `${allocated.toLocaleString()} Kg` : "0", "#D1FAE5", { color: "#065F46" });
      row[colStatsStart + 1] = cell(manualStock !== undefined ? `${manualStock.toLocaleString()} Kg` : "-", "#ECFDF5", { color: "#047857" });
      row[colStatsStart + 2] = cell(currentStock !== 0 ? `${currentStock.toLocaleString()} Kg` : "0", "#D1FAE5", { color: "#065F46" });
      row[colStatsStart + 3] = cell(
        `${remainingStock.toLocaleString()} Kg`,
        isShortage ? "#FEE2E2" : "#A7F3D0",
        { color: isShortage ? "#991B1B" : "#065F46" }
      );
      row[colStatsStart + 4] = cell(
        isShortage ? `${Math.abs(remainingStock).toLocaleString()} Kg` : "0",
        isShortage ? "#FEE2E2" : "#F8FAFC",
        { color: isShortage ? "#991B1B" : "#94A3B8" }
      );

      orderedSlots.forEach((driver, i) => {
        let weight = 0;
        if (driver) {
          invoices
            .filter((inv) => isSameDriver(inv.driverName, driver) && inv.isActive !== false)
            .forEach((inv) => { weight += Number(inv.quantities[p.id] || 0); });
        }
        row[colSlotsStart + i] = cell(weight > 0 ? `${weight.toLocaleString()} Kg` : "0", "#FFF7ED", { color: "#7C2D12" });
      });

      let rowTotal = 0;
      driverSearchSlots.forEach((driver) => {
        if (driver) {
          invoices
            .filter((inv) => isSameDriver(inv.driverName, driver) && inv.isActive !== false)
            .forEach((inv) => { rowTotal += Number(inv.quantities[p.id] || 0); });
        }
      });
      row[colGrandTotal] = cell(rowTotal > 0 ? `${rowTotal.toLocaleString()} Kg` : "0", "#FFEDD5", { color: "#7C2D12" });

      grid.push(row);
    });

    // --- daily total row ---------------------------------------------------

    let sumAllocated = 0;
    let sumStock = 0;
    let sumShortage = 0;
    filteredProducts.forEach((p) => {
      const alloc = allocatedQuantities[p.id] || 0;
      sumAllocated += alloc;
      const stock = getProductStock(p.id, p.defaultStock);
      sumStock += stock;
      const remaining = stock - alloc;
      if (remaining < 0) sumShortage += Math.abs(remaining);
    });
    const sumRemaining = sumStock - sumAllocated;

    const sumRow = emptyRow();
    sumRow[0] = cell("جمع کل بار روزانه", "#FCD34D", { color: "#000000" });
    merges.push({ s: { r: grid.length, c: 0 }, e: { r: grid.length, c: 1 } });
    invoices.forEach((inv, i) => {
      const w = getInvoiceWeight(inv);
      sumRow[colInvoiceStart + i] = cell(`${w.toLocaleString()} Kg`, "#FEF3C7", { color: "#78350F" });
    });
    sumRow[colStatsStart] = cell(`${sumAllocated.toLocaleString()} Kg`, "#A7F3D0", { color: "#065F46" });
    sumRow[colStatsStart + 1] = cell("-", "#E2E8F0", { color: "#334155" });
    sumRow[colStatsStart + 2] = cell(`${sumStock.toLocaleString()} Kg`, "#A7F3D0", { color: "#065F46" });
    sumRow[colStatsStart + 3] = cell(`${sumRemaining.toLocaleString()} Kg`, sumRemaining < 0 ? "#FEE2E2" : "#A7F3D0", { color: sumRemaining < 0 ? "#991B1B" : "#065F46" });
    sumRow[colStatsStart + 4] = cell(`${sumShortage.toLocaleString()} Kg`, "#FEE2E2", { color: "#991B1B" });
    orderedSlots.forEach((driver, i) => {
      let weight = 0;
      if (driver) {
        invoices
          .filter((inv) => isSameDriver(inv.driverName, driver) && inv.isActive !== false)
          .forEach((inv) => { weight += getInvoiceWeight(inv); });
      }
      sumRow[colSlotsStart + i] = cell(weight > 0 ? `${weight.toLocaleString("en-US")} Kg` : "0", "#FFE8A3", { color: "#78350F" });
    });
    let searchGrandTotal = 0;
    driverSearchSlots.forEach((driver) => {
      if (driver) {
        invoices
          .filter((inv) => isSameDriver(inv.driverName, driver) && inv.isActive !== false)
          .forEach((inv) => { searchGrandTotal += getInvoiceWeight(inv); });
      }
    });
    sumRow[colGrandTotal] = cell(`${searchGrandTotal.toLocaleString("en-US")} Kg`, "#FFEDD5", { color: "#7C2D12" });
    grid.push(sumRow);

    // --- build & save ----------------------------------------------------

    const ws: any = {};
    const numRows = grid.length;
    grid.forEach((row, r) => {
      row.forEach((c, colIdx) => {
        if (c === null) return;
        const addr = XLSX.utils.encode_cell({ r, c: colIdx });
        ws[addr] = c;
      });
    });
    ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: numRows - 1, c: numCols - 1 } });
    ws["!merges"] = merges;
    ws["!cols"] = [
      { wch: 14 }, { wch: 16 },
      ...invoices.map(() => ({ wch: 18 })),
      { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
      ...orderedSlots.map(() => ({ wch: 14 })),
      { wch: 14 },
    ];
    ws["!rows"] = grid.map((_, i) => ({ hpt: i === 0 ? 120 : 25 }));
    ws["!views"] = [{ rightToLeft: true }];

    const wb = XLSX.utils.book_new();
    wb.Workbook = { Views: [{ RTL: true }] }; // for old compatibility just in case
    XLSX.utils.book_append_sheet(wb, ws, "برنامه توزیع");
    XLSX.writeFile(wb, `برنامه نهایی-${dateStr}.xlsx`);

    showNotification("success", "فایل اکسل با موفقیت دانلود شد.");
  } catch (e) {
    console.error(e);
    showNotification("error", "خطا در تولید فایل اکسل.");
  }
};
