import { useRef, useState } from "react";
import { apiFetch, setAuthToken } from "../lib/apiClient";
import { NotificationType } from "./useNotification";

interface UseBackupRestoreDeps {
  formattedDate: string;
  showNotification: (type: NotificationType, message: string) => void;
}

// All state + handlers for the "Backup" screen: downloading/restoring backups,
// wiping daily data, and the full factory reset. Pulled out of App.tsx as a
// self-contained unit.
//
// loadConfig/loadDailyPlan live in App.tsx and are only defined after this
// hook must already have been called (hooks can't be called after the
// component's early auth-loading return), so they're wired in via refs:
// call `registerLoaders(loadConfig, loadDailyPlan)` once those functions
// exist (a plain assignment, not a hook, so it's fine to do after the return).
export function useBackupRestore({ formattedDate, showNotification }: UseBackupRestoreDeps) {
  const [backupFromDate, setBackupFromDate] = useState("");
  const [backupToDate, setBackupToDate] = useState("");
  const [backupDownloading, setBackupDownloading] = useState(false);
  const [backupRestoring, setBackupRestoring] = useState(false);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  const [resettingDailyData, setResettingDailyData] = useState(false);
  const [showFactoryResetConfirm, setShowFactoryResetConfirm] = useState(false);
  const [factoryResetConfirmText, setFactoryResetConfirmText] = useState("");
  const [factoryResetting, setFactoryResetting] = useState(false);

  const loadConfigRef = useRef<() => void>(() => {});
  const loadDailyPlanRef = useRef<(dateStr: string, silent?: boolean) => void>(() => {});
  const registerLoaders = (loadConfig: () => void, loadDailyPlan: (dateStr: string, silent?: boolean) => void) => {
    loadConfigRef.current = loadConfig;
    loadDailyPlanRef.current = loadDailyPlan;
  };


  const handleDownloadBackup = async (ranged: boolean) => {
    if (ranged && (!backupFromDate.trim() || !backupToDate.trim())) {
      showNotification("error", "برای دانلود بازه زمانی، هر دو تاریخ را وارد کنید.");
      return;
    }
    setBackupDownloading(true);
    try {
      const params = new URLSearchParams();
      if (ranged) {
        params.set("fromDate", backupFromDate.trim());
        params.set("toDate", backupToDate.trim());
      }
      const res = await apiFetch(`/api/backup/download?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "خطا در دریافت فایل پشتیبان");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match ? match[1] : `backup-${formattedDate.replace(/\//g, "-")}.json`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showNotification("success", "فایل پشتیبان با موفقیت دانلود شد.");
    } catch (err: any) {
      console.error("Backup download error:", err);
      showNotification("error", err.message || "خطا در دانلود فایل پشتیبان.");
    } finally {
      setBackupDownloading(false);
    }
  };

  const handleRestoreBackupFile = async (file: File) => {
    if (!confirm("فایل پشتیبان با اطلاعات فعلی سیستم ادغام می‌شود (چیزی حذف یا جایگزین نمی‌شود، فقط موارد جدید اضافه می‌شوند). ادامه می‌دهید؟")) {
      return;
    }
    setBackupRestoring(true);
    try {
      const text = await file.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("فایل انتخاب‌شده یک فایل پشتیبان معتبر (JSON) نیست.");
      }
      const res = await apiFetch("/api/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "خطا در بازگردانی فایل پشتیبان");
      }
      const s = data.summary;
      showNotification(
        "success",
        `بازگردانی موفق: ${s.dailyPlansAdded} روز جدید، ${s.dailyPlansMerged} روز ادغام‌شده، ${s.driversAdded} راننده جدید، ${s.productsAdded} کالای جدید، ${s.usersAdded} کاربر جدید، ${s.logsAdded} لاگ جدید اضافه شد.`
      );
      loadConfigRef.current();
      loadDailyPlanRef.current(formattedDate);
    } catch (err: any) {
      console.error("Backup restore error:", err);
      showNotification("error", err.message || "فایل پشتیبان نامعتبر است.");
    } finally {
      setBackupRestoring(false);
      if (backupFileInputRef.current) backupFileInputRef.current.value = "";
    }
  };

  const handleResetDailyData = async () => {
    if (!confirm("همه‌ی برنامه‌های روزانه (فاکتورها) و تمام تاریخچه‌ی لاگ فعالیت‌ها برای همیشه پاک می‌شن. رانندگان، کالاها و کاربران دست‌نخورده می‌مونن. ادامه می‌دهید؟")) {
      return;
    }
    setResettingDailyData(true);
    try {
      const res = await apiFetch("/api/system/reset-daily-data", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "خطا در پاک‌سازی");
      showNotification("success", "تمام برنامه‌های روزانه و لاگ‌ها پاک شد.");
      loadDailyPlanRef.current(formattedDate);
    } catch (err: any) {
      showNotification("error", err.message || "خطا در پاک‌سازی اطلاعات.");
    } finally {
      setResettingDailyData(false);
    }
  };

  const handleFactoryReset = async () => {
    if (factoryResetConfirmText !== "RESET") return;
    setFactoryResetting(true);
    try {
      const res = await apiFetch("/api/system/factory-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "RESET" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "خطا در ریست کامل سیستم");
      if (data.token) setAuthToken(data.token);
      showNotification("success", "سیستم کاملاً ریست شد. صفحه در حال بارگذاری مجدد است...");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      showNotification("error", err.message || "خطا در ریست کامل سیستم.");
      setFactoryResetting(false);
    }
  };

  return {
    backupFromDate, setBackupFromDate,
    backupToDate, setBackupToDate,
    backupDownloading,
    backupRestoring,
    backupFileInputRef,
    resettingDailyData,
    showFactoryResetConfirm, setShowFactoryResetConfirm,
    factoryResetConfirmText, setFactoryResetConfirmText,
    factoryResetting,
    handleDownloadBackup,
    handleRestoreBackupFile,
    handleResetDailyData,
    handleFactoryReset,
    registerLoaders,
  };
}
