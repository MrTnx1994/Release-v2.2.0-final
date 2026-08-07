import { Driver, Product } from "../types";

export const COLOR_PRESETS = [
  { id: "pink-light", hex: "#ECA5B8" },
  { id: "pink-dark", hex: "#E6787E" },
  { id: "blue-light", hex: "#BBD5ED" },
  { id: "blue-dark", hex: "#89B6E2" },
  { id: "green-light", hex: "#A3CFA1" },
  { id: "green-dark", hex: "#10B960" },
  { id: "yellow-light", hex: "#FFE8A3" },
  { id: "yellow-dark", hex: "#CCA01A" },
  { id: "peach-light", hex: "#FCD3B6" },
  { id: "peach-medium", hex: "#FAAC84" },
  { id: "orange-medium", hex: "#F98F45" },
  { id: "orange-dark", hex: "#EE7E11" },
  { id: "gold", hex: "#FFC000" },
];

// NOTE: getDriverColorClass, getCustomerPillClasses, getDriverHeaderClasses,
// getDriverAccentClasses and getDriverCellColorClass used to be duplicated here
// AND in utils/driverHelpers.ts, with a subtle mismatch in getDriverCellColorClass's
// "no driver assigned" styling (blue here vs. amber in driverHelpers — the one
// actually used by PlanningScreen). To keep a single source of truth matching the
// live UI, those functions now live only in utils/driverHelpers.ts.
export {
  getDriverColorClass,
  getCustomerPillClasses,
  getDriverHeaderClasses,
  getDriverAccentClasses,
  getDriverCellColorClass,
} from "./driverHelpers";

export function getCategoryStyle(category: string, products: Product[], isFlavor: boolean = false): string {
  if (!category) return "bg-slate-50 text-slate-900 border-slate-200";
  const c = category.trim();

  const cats = Array.from(new Set(products.map((p) => p.category)));
  const index = cats.indexOf(c);
  const total = cats.length || 1;

  const palette = [
    { bg: "bg-[#f0f9ff]", text: "text-[#0369a1]", border: "border-[#bae6fd]" },
    { bg: "bg-[#e0f2fe]", text: "text-[#0369a1]", border: "border-[#bae6fd]" },
    { bg: "bg-[#bae6fd]", text: "text-[#0c4a6e]", border: "border-[#7dd3fc]" },
    { bg: "bg-[#e0e7ff]", text: "text-[#4338ca]", border: "border-[#c7d2fe]" },
    { bg: "bg-[#c7d2fe]", text: "text-[#312e81]", border: "border-[#a5b4fc]" },
    { bg: "bg-[#bfdbfe]", text: "text-[#1e3a8a]", border: "border-[#60a5fa]" },
    { bg: "bg-[#93c5fd]", text: "text-[#1e3a8a]", border: "border-[#60a5fa]" },
    { bg: "bg-[#60a5fa]", text: "text-[#172554]", border: "border-[#3b82f6]" },
    { bg: "bg-[#3b82f6]", text: "text-white", border: "border-[#2563eb]" },
    { bg: "bg-[#2563eb]", text: "text-white", border: "border-[#1d4ed8]" },
    { bg: "bg-[#1d4ed8]", text: "text-white", border: "border-[#1e40af]" },
    { bg: "bg-[#1e40af]", text: "text-slate-100", border: "border-[#1e3a8a]" },
    { bg: "bg-[#1e3a8a]", text: "text-slate-100", border: "border-[#172554]" },
    { bg: "bg-[#172554]", text: "text-cyan-200", border: "border-[#0f172a]" }
  ];

  const ratio = index >= 0 ? index / total : 0;
  const paletteIndex = Math.min(ratio * palette.length, palette.length - 1);
  const style = palette[paletteIndex] || palette[0];

  return `${style.bg} ${style.text} ${style.border}`;
}
