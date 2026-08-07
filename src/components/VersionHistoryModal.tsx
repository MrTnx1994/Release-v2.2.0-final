import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  History,
  CheckCircle2,
  Calendar,
  PhoneCall,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  Bug,
  ShieldCheck,
  Palette,
  Database,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  APP_NAME,
  APP_VERSION,
  getAppReleaseDate,
  getChangelogHistory,
  VersionChange,
  VersionCategorySection,
} from "../utils/version";

interface VersionHistoryModalProps {
  show: boolean;
  onClose: () => void;
}

export function VersionHistoryModal({ show, onClose }: VersionHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"latest" | "archive">("latest");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<"all" | "major" | "minor" | "patch">("all");

  const releaseDate = useMemo(() => getAppReleaseDate(), [show]);
  const changelogs = useMemo(() => getChangelogHistory(), [show]);
  const latestVersion = changelogs[0] || null;

  // Initialize expanded state on first load: expand the top 2 in archive by default
  React.useEffect(() => {
    if (show) {
      const initial: Record<string, boolean> = {};
      changelogs.forEach((item, index) => {
        initial[item.version] = index === 0 || index === 1;
      });
      setExpandedVersions(initial);
      setSearchQuery("");
      setActiveTab("latest");
    }
  }, [show, changelogs]);

  const handleCopySupport = () => {
    navigator.clipboard?.writeText("02137832");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleVersionExpand = (ver: string) => {
    setExpandedVersions((prev) => ({
      ...prev,
      [ver]: !prev[ver],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    changelogs.forEach((c) => (all[c.version] = true));
    setExpandedVersions(all);
  };

  const collapseAll = () => {
    setExpandedVersions({});
  };

  // Filtered changelogs for the archive tab
  const filteredChangelogs = useMemo(() => {
    return changelogs.filter((item) => {
      const matchesType = filterType === "all" || item.type === filterType;
      if (!matchesType) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const inVersion = item.version.toLowerCase().includes(q);
      const inTitle = item.title.toLowerCase().includes(q);
      const inSummary = item.summary?.toLowerCase().includes(q) || false;
      const inChanges = item.changes.some((c) => c.toLowerCase().includes(q));
      const inCategories =
        item.categories?.some(
          (cat) =>
            cat.title.toLowerCase().includes(q) ||
            cat.items.some((it) => it.toLowerCase().includes(q))
        ) || false;

      return inVersion || inTitle || inSummary || inChanges || inCategories;
    });
  }, [changelogs, searchQuery, filterType]);

  const getCategoryIcon = (iconType?: string) => {
    switch (iconType) {
      case "bug":
        return <Bug className="w-4 h-4 text-rose-500 shrink-0" />;
      case "security":
        return <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />;
      case "ui":
        return <Palette className="w-4 h-4 text-purple-500 shrink-0" />;
      case "database":
        return <Database className="w-4 h-4 text-amber-500 shrink-0" />;
      case "support":
        return <PhoneCall className="w-4 h-4 text-cyan-500 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  const getTypeBadge = (type: "major" | "minor" | "patch") => {
    switch (type) {
      case "major":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            نسخه اصلی (Major)
          </span>
        );
      case "minor":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            امکانات جدید (Minor)
          </span>
        );
      case "patch":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            اصلاح و پچ (Patch)
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-md"
          onClick={onClose}
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Top Gradient Header */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-5 sm:p-6 text-white shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
                    <History className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                      {APP_NAME}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="bg-white/20 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/25">
                        نسخه فعال: v{APP_VERSION}
                      </span>
                      <span className="text-xs text-blue-100 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {releaseDate}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white cursor-pointer"
                  title="بستن پنجره"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs Switcher */}
              <div className="flex items-center gap-2 mt-4 bg-black/20 p-1 rounded-2xl backdrop-blur-md border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("latest")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    activeTab === "latest"
                      ? "bg-white text-blue-900 shadow-md"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>تغییرات آخرین نسخه (v{APP_VERSION})</span>
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                    نگارش جاری
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("archive")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    activeTab === "archive"
                      ? "bg-white text-blue-900 shadow-md"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>آرشیو و نسخه‌های پیشین</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      activeTab === "archive"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {changelogs.length} نگارش
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-100 space-y-6">
              {activeTab === "latest" && latestVersion && (
                <div className="space-y-6">
                  {/* Latest Version Hero Banner */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-cyan-50/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800/60 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm px-3 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                          v{latestVersion.version}
                        </span>
                        {getTypeBadge(latestVersion.type)}
                        <span className="text-[11px] bg-emerald-500 text-white font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3" />
                          نگارش فعال سامانه
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>تاریخ اعمال: {latestVersion.date}</span>
                      </div>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                      {latestVersion.title}
                    </h4>

                    {latestVersion.summary && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                        {latestVersion.summary}
                      </p>
                    )}
                  </div>

                  {/* Detailed Categories for Latest Version */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span>جزئیات کامل تغییرات و امکانات نسخه {latestVersion.version}</span>
                      </h5>
                    </div>

                    {latestVersion.categories && latestVersion.categories.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3.5">
                        {latestVersion.categories.map((cat, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-2.5">
                              {getCategoryIcon(cat.iconType)}
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {cat.title}
                              </span>
                            </div>
                            <ul className="space-y-2 pr-1">
                              {cat.items.map((item, itemIdx) => (
                                <li
                                  key={itemIdx}
                                  className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 leading-relaxed"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                        {latestVersion.changes.map((change, cIdx) => (
                          <li
                            key={cIdx}
                            className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Switch to Archive CTA */}
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab("archive")}
                      className="px-5 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 font-bold text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <History className="w-4 h-4" />
                      <span>مشاهده تاریخچه کامل و نسخه‌های پیشین ({changelogs.length - 1} نسخه قدیمی‌تر)</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "archive" && (
                <div className="space-y-4">
                  {/* Search and Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="جستجو در تغییرات (مثلاً: اکسل، راننده، لاگ، تعطیلات، پیش‌بینی)..."
                        className="w-full pl-3 pr-9 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                        <button
                          type="button"
                          onClick={() => setFilterType("all")}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                            filterType === "all"
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          همه ({changelogs.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterType("minor")}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                            filterType === "minor"
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          Minor
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterType("patch")}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                            filterType === "patch"
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          Patch
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={expandAll}
                          className="px-2.5 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          باز کردن همه
                        </button>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <button
                          type="button"
                          onClick={collapseAll}
                          className="px-2.5 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          بستن همه
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* List of Versions */}
                  <div className="space-y-3">
                    {filteredChangelogs.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        موردی منطبق با جستجوی «{searchQuery}» یافت نشد.
                      </div>
                    ) : (
                      filteredChangelogs.map((item, idx) => {
                        const isExpanded = !!expandedVersions[item.version];
                        const isCurrent = item.version === APP_VERSION;

                        return (
                          <div
                            key={item.version}
                            className={`rounded-2xl border transition-all overflow-hidden ${
                              isCurrent
                                ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/70"
                                : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            {/* Version Header Bar */}
                            <div
                              onClick={() => toggleVersionExpand(item.version)}
                              className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors select-none"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-full shrink-0 ${
                                    isCurrent
                                      ? "bg-blue-600 text-white shadow-xs"
                                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  v{item.version}
                                </span>
                                {getTypeBadge(item.type)}
                                {isCurrent && (
                                  <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    جاری
                                  </span>
                                )}
                                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                  {item.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                                  {item.date}
                                </span>
                                <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Summary when collapsed */}
                            {!isExpanded && item.summary && (
                              <div
                                onClick={() => toggleVersionExpand(item.version)}
                                className="px-4 pb-3 pt-0 text-[11px] text-slate-500 dark:text-slate-400 truncate cursor-pointer"
                              >
                                {item.summary}
                              </div>
                            )}

                            {/* Expanded Full Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="border-t border-slate-200 dark:border-slate-800/80 p-4 bg-white/60 dark:bg-slate-900/50 space-y-3.5"
                                >
                                  {item.summary && (
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-100/70 dark:bg-slate-800/60 p-3 rounded-xl">
                                      {item.summary}
                                    </p>
                                  )}

                                  {/* Render Categories if available */}
                                  {item.categories && item.categories.length > 0 ? (
                                    <div className="space-y-3">
                                      {item.categories.map((cat, catIdx) => (
                                        <div
                                          key={catIdx}
                                          className="p-3 bg-white dark:bg-slate-800/70 rounded-xl border border-slate-200/80 dark:border-slate-700/60"
                                        >
                                          <div className="flex items-center gap-2 mb-2">
                                            {getCategoryIcon(cat.iconType)}
                                            <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                                              {cat.title}
                                            </span>
                                          </div>
                                          <ul className="space-y-1.5 pr-2">
                                            {cat.items.map((it, itIdx) => (
                                              <li
                                                key={itIdx}
                                                className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 leading-relaxed"
                                              >
                                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                                <span>{it}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <ul className="space-y-1.5 pr-2">
                                      {item.changes.map((change, cIdx) => (
                                        <li
                                          key={cIdx}
                                          className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 leading-relaxed"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                          <span>{change}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Support & Contact Card */}
              <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      پشتیبانی فنی و ثبت درخواست تغییرات:
                    </span>
                    <span className="block text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      شماره تماس مستقیم: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">02137832</span> (داخلی <span className="font-bold text-amber-500">502</span>)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="tel:02137832,502"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>تماس مستقیم</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopySupport}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>کپی شد</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی شماره</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 text-xs">
              <span className="text-slate-400">
                © کلیه حقوق برای برناتجارت باور محفوظ است
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

