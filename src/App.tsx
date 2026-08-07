import React, { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Package,
  RefreshCw,
  PhoneCall,
  Copy,
  Check
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as XLSX from "xlsx";
import { SHAMSI_MONTHS, getShamsiWeekday, getTomorrowShamsiDate } from "./utils/shamsi";
import { fetchHolidaysFromServer } from "./utils/holidays";
import { Product, Driver, InvoiceRun, DailyPlan } from "./types";
import { useAuth } from "./context/AuthContext";
import { useDateManagement } from "./hooks/useDateManagement";
import { useInvoiceManagement } from "./hooks/useInvoiceManagement";
import { useNotification } from "./hooks/useNotification";
import { useGridZoom } from "./hooks/useGridZoom";
import { useBackupRestore } from "./hooks/useBackupRestore";
import { useCustomerSearch } from "./hooks/useCustomerSearch";
import { useGridCellSelection } from "./hooks/useGridCellSelection";
import { useDriverProductConfig } from "./hooks/useDriverProductConfig";
import { apiFetch, setAuthToken } from "./lib/apiClient";
import { LoginScreen } from "./components/LoginScreen";
import { ActivityLogScreen } from "./components/ActivityLogScreen";
import { UserManagementScreen } from "./components/UserManagementScreen";
import { StockForecastScreen } from "./components/StockForecastScreen";
import { DatePickerModal } from "./components/DatePickerModal";
import { BackupScreen } from "./components/BackupScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { DriversScreen } from "./components/DriversScreen";
import { WarehouseScreen } from "./components/WarehouseScreen";
import { ConfigScreen } from "./components/ConfigScreen";
import { CustomerSearchModal } from "./components/CustomerSearchModal";
import { PrintPreviewModal } from "./components/PrintPreviewModal";
import { PlanningScreen } from "./components/PlanningScreen";
import { AppHeader } from "./components/AppHeader";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import { VersionHistoryModal } from "./components/VersionHistoryModal";
import { APP_VERSION, APP_NAME } from "./utils/version";
import { renderMatrixContent as renderMatrixContentUtil, renderDriverSheetsContent as renderDriverSheetsContentUtil } from "./components/MatrixPrintSheets";
import { isSameDriver } from "./utils/driverHelpers";
import { getInvoiceWeight, getInvoiceCartonsReal, getInvoiceVolumetricWeight, getDriverCapacity } from "./utils/invoiceCalculations";
import { exportToExcelHtml } from "./utils/excelExport";
import { logActivity } from "./lib/activityLog";
import { DRIVERS_TABLE_PAGE_SIZE, PRODUCTS_TABLE_PAGE_SIZE } from "./utils/constants";

export default function App() {
  useEffect(() => {
    fetchHolidaysFromServer();
  }, []);

  const { user, role, loading: authLoading, logout } = useAuth();
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const validProducts = React.useMemo(
    () => products.filter(p => p.category && p.category.trim() !== ''),
    [products]
  );
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);
  
  const {
    todayShamsi,
    shamsiYear, setShamsiYear,
    shamsiMonth, setShamsiMonth,
    shamsiDay, setShamsiDay,
    showDatePicker, setShowDatePicker,
    tempYear, setTempYear,
    tempMonth, setTempMonth,
    tempDay, setTempDay,
    manualDateInput, setManualDateInput,
    formattedDate
  } = useDateManagement();


  const { invoices, setInvoices, visibleInvoices } = useInvoiceManagement([], role, user);
  
  const [manualStockOverrides, setManualStockOverrides] = useState<{ [productId: string]: number }>({});
  const [computedStartingStocks, setComputedStartingStocks] = useState<{ [productId: string]: number }>({});
  const [activeTab, setActiveTabState] = useState<"dashboard" | "planning" | "drivers" | "warehouse" | "waybill" | "config" | "logs" | "users" | "forecast" | "backup">(() => {
    try {
      const saved = sessionStorage.getItem("app_active_tab");
      const validTabs = ["dashboard", "planning", "drivers", "warehouse", "waybill", "config", "logs", "users", "forecast", "backup"];
      if (saved && validTabs.includes(saved)) {
        return saved as any;
      }
    } catch (e) {}
    return "dashboard";
  });

  const setActiveTab = (tab: "dashboard" | "planning" | "drivers" | "warehouse" | "waybill" | "config" | "logs" | "users" | "forecast" | "backup") => {
    setActiveTabState(tab);
    try {
      sessionStorage.setItem("app_active_tab", tab);
    } catch (e) {}
  };
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState<boolean>(false);
  const [copiedSupportPhone, setCopiedSupportPhone] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [isProductEditMode, setIsProductEditMode] = useState<boolean>(false);
  const dashboardRightTabState = useState<"stock" | "category_sales">("category_sales");
  const dashboardRightTab = dashboardRightTabState[0];
  const setDashboardRightTab = dashboardRightTabState[1];

  const [dashboardPeriod, setDashboardPeriod] = useState<number | { label: string; startDate: string; endDate: string; days: number }>(30);
  const dashboardPeriodDays = typeof dashboardPeriod === 'number' ? dashboardPeriod : dashboardPeriod.days;
  const dashboardPeriodLabel = typeof dashboardPeriod === 'number' ? `${dashboardPeriod} روز گذشته` : dashboardPeriod.label;
  const [selectedCategorySales, setSelectedCategorySales] = useState<string>("بادام زمینی");
  
  const [realSales, setRealSales] = useState<{ [productId: string]: number }>({});
  const [realIncoming, setRealIncoming] = useState<{ [productId: string]: number }>({});
  const [invoiceStats, setInvoiceStats] = useState<{ driverStats: { [driver: string]: number }; totalOrders: number }>({ driverStats: {}, totalOrders: 0 });
  const [productTableFilter, setProductTableFilter] = useState<string>("all");
  const [detailedInventoryFilter, setDetailedInventoryFilter] = useState<string>("all");
  const [driversTablePage, setDriversTablePage] = useState(1);
  const [productsTablePage, setProductsTablePage] = useState(1);

  const [driverSearchSlots, setDriverSearchSlots] = useState<string[]>(Array(10).fill(""));
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [driverPrintPreview, setDriverPrintPreview] = useState<boolean>(false);
  const [printDriverName, setPrintDriverName] = useState<string | null>(null);

  const invoicesRef = useRef(invoices);
  const overridesRef = useRef(manualStockOverrides);
  const slotsRef = useRef(driverSearchSlots);
  useEffect(() => { invoicesRef.current = invoices; }, [invoices]);
  useEffect(() => { overridesRef.current = manualStockOverrides; }, [manualStockOverrides]);
  useEffect(() => { slotsRef.current = driverSearchSlots; }, [driverSearchSlots]);

  const lastSyncedSnapshotRef = useRef<string>("");
  const warnedAboutConflictRef = useRef<boolean>(false);
  const makeSnapshot = (inv: InvoiceRun[], ov: { [k: string]: number }, slots: string[]) =>
    JSON.stringify({ inv, ov, slots });

  const [excelPasteText, setExcelPasteText] = useState("");
  const [showPasteModal, setShowPasteModal] = useState(false);

  const {
    showCustomerSearchModal, setShowCustomerSearchModal,
    customerSearchName, setCustomerSearchName,
    customerSearchFromDate, setCustomerSearchFromDate,
    customerSearchResults, setCustomerSearchResults,
    customerSearchLoading,
    customerSearchError, setCustomerSearchError,
    openCustomerSearchModal,
    handleCustomerSearch,
  } = useCustomerSearch();

  const { notification, setNotification, showNotification } = useNotification();

  const {
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
  } = useBackupRestore({ formattedDate, showNotification });

  const {
    cellSelection, setCellSelection,
    selectionAnchorRef,
    sumBarCountRef, sumBarValueRef,
    gridSelectionStats,
    handleGridCellMouseDown,
    handleGridCellMouseEnter,
    handleClearSelectedGridCells,
    isGridCellSelected,
  } = useGridCellSelection({
    validProducts,
    selectedCategoryFilter,
    invoices,
    setInvoices,
    invoicesRef,
    formattedDate,
    showNotification,
  });

  const {
    gridZoomRef,
    gridZoomWrapperRef,
    zoomLabelRef,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  } = useGridZoom();

  const {
    newDriverName, setNewDriverName,
    newDriverVehicle, setNewDriverVehicle,
    newDriverColor, setNewDriverColor,
    editingDriverName,
    newProductCategory, setNewProductCategory,
    newProductFlavor, setNewProductFlavor,
    newProductWeight, setNewProductWeight,
    newProductStock, setNewProductStock,
    newProductRealCartonWeight, setNewProductRealCartonWeight,
    editingProductId,
    handleAddDriver,
    handleEditDriver,
    handleCancelEditDriver,
    handleDeleteDriver,
    handleAddProduct,
    handleEditProduct,
    handleCancelEditProduct,
    handleDeleteProduct,
    registerSaveMasterConfig,
  } = useDriverProductConfig({
    drivers, setDrivers,
    products, setProducts,
    invoices, setInvoices,
    driverSearchSlots, setDriverSearchSlots,
    manualStockOverrides, setManualStockOverrides,
    showNotification,
  });

  useEffect(() => {
    if (user && !authLoading) {
      loadConfig();
      loadSalesStatistics();
    }
  }, [user, authLoading, role]);

  useEffect(() => {
    if (!role) return;
    if (role === "driver" && activeTab !== "drivers") {
      setActiveTab("drivers");
    } else if (role !== "admin" && (activeTab === "logs" || activeTab === "users" || activeTab === "backup")) {
      setActiveTab("dashboard");
    }
  }, [role, activeTab]);

  useEffect(() => {
    if (user && !authLoading) {
      loadSalesStatistics(undefined, true);
    }
  }, [dashboardPeriod]);
  useEffect(() => {
    setProductsTablePage(1);
  }, [productTableFilter]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(drivers.length / DRIVERS_TABLE_PAGE_SIZE));
    if (driversTablePage > totalPages) setDriversTablePage(totalPages);
  }, [drivers.length, driversTablePage]);

  useEffect(() => {
    const visibleCount = products.filter((p) => productTableFilter === "all" || p.category === productTableFilter).length;
    const totalPages = Math.max(1, Math.ceil(visibleCount / PRODUCTS_TABLE_PAGE_SIZE));
    if (productsTablePage > totalPages) setProductsTablePage(totalPages);
  }, [products, productTableFilter, productsTablePage]);

  useEffect(() => {
    if (user && !authLoading && products.length > 0) {
      loadDailyPlan(formattedDate);
    }
  }, [formattedDate, products, user, authLoading, role]);

  useEffect(() => {
    if (!user || authLoading || products.length === 0) return;

    const POLL_INTERVAL_MS = 8000;

    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await apiFetch(`/api/load/${encodeURIComponent(formattedDate)}`);
        if (!res.ok) return;
        const payload = await res.json();

        const currentSnapshot = makeSnapshot(invoicesRef.current, overridesRef.current, slotsRef.current);
        const isLocallyDirty = currentSnapshot !== lastSyncedSnapshotRef.current;

        const remoteInvoices: InvoiceRun[] = payload.found && payload.data ? (payload.data.invoices || []) : [];
        const remoteOverrides: { [productId: string]: number } = payload.found && payload.data ? (payload.data.manualStockOverrides || {}) : {};
        const remoteSlots: string[] = payload.found && payload.data ? (payload.data.driverSearchSlots || Array(10).fill("")) : Array(10).fill("");
        const remoteSnapshot = makeSnapshot(remoteInvoices, remoteOverrides, remoteSlots);

        if (remoteSnapshot === currentSnapshot) {
          return;
        }

        if (isLocallyDirty) {
          if (!warnedAboutConflictRef.current) {
            warnedAboutConflictRef.current = true;
            showNotification("info", "شخص دیگری این تاریخ را تغییر داده است. بعد از ذخیره اطلاعات خودتان، صفحه را بررسی کنید.");
          }
          return;
        }

        setInvoices(remoteInvoices);
        setManualStockOverrides(remoteOverrides);
        setDriverSearchSlots(remoteSlots);
        if (payload.computedStartingStocks) {
          setComputedStartingStocks(payload.computedStartingStocks);
        }
        lastSyncedSnapshotRef.current = remoteSnapshot;
        warnedAboutConflictRef.current = false;
      } catch (e) {
        console.error("Live-sync poll failed", e);
      }
    };

    const intervalId = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [formattedDate, user, authLoading, products.length, role]);

  useEffect(() => {
    if (!user || authLoading) return;
    const STATS_POLL_INTERVAL_MS = 15000;
    const intervalId = setInterval(() => {
      if (document.hidden) return;
      loadSalesStatistics(undefined, true);
    }, STATS_POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [user, authLoading, formattedDate, role]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen">در حال بارگذاری...</div>;
  if (!user) return <LoginScreen />;

  const loadSalesStatistics = async (dateToExclude?: string, silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const targetDate = dateToExclude || formattedDate;
      const params = new URLSearchParams();
      
      if (typeof dashboardPeriod === 'number') {
        if (targetDate) params.append('endDate', targetDate);
        params.append('days', dashboardPeriod.toString());
      } else {
        params.append('startDate', dashboardPeriod.startDate);
        params.append('endDate', dashboardPeriod.endDate);
      }

      const [resSales, resIncoming, resInvoiceStats] = await Promise.allSettled([
        apiFetch(`/api/statistics/sales?${params.toString()}`),
        apiFetch(`/api/statistics/incoming?${params.toString()}`),
        apiFetch(`/api/statistics/invoices?${params.toString()}`)
      ]);

      if (resSales.status === "fulfilled" && resSales.value.ok) {
        const dataSales = await resSales.value.json().catch(() => null);
        if (dataSales && dataSales.sales) {
          setRealSales(dataSales.sales);
        }
      }

      if (resIncoming.status === "fulfilled" && resIncoming.value.ok) {
        const dataIncoming = await resIncoming.value.json().catch(() => null);
        if (dataIncoming && dataIncoming.incoming) {
          setRealIncoming(dataIncoming.incoming);
        }
      }

      if (resInvoiceStats.status === "fulfilled" && resInvoiceStats.value.ok) {
        const dataInvoices = await resInvoiceStats.value.json().catch(() => null);
        if (dataInvoices) {
          setInvoiceStats(dataInvoices);
        }
      }
    } catch (e) {
      console.error("Error loading statistics", e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/config");
      const config = await res.json();
      if (config.drivers && config.drivers.length > 0) {
        setDrivers(config.drivers);
      }
      if (config.products && config.products.length > 0) {
        setProducts(config.products);
      }
    } catch (e) {
      console.error("Error loading configuration", e);
      showNotification("error", "خطا در اتصال به سرور و دریافت تنظیمات اولیه.");
    } finally {
      setLoading(false);
    }
  };

  const loadDailyPlan = async (dateStr: string, silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await apiFetch(`/api/load/${encodeURIComponent(dateStr)}`);
      const payload = await res.json();
      
      if (payload.computedStartingStocks) {
        setComputedStartingStocks(payload.computedStartingStocks);
      } else {
        setComputedStartingStocks({});
      }
      
      let newInvoices: InvoiceRun[] = [];
      let newOverrides: { [productId: string]: number } = {};
      let newSlots: string[] = Array(10).fill("");

      if (payload.found && payload.data) {
        newInvoices = payload.data.invoices || [];
        newOverrides = payload.data.manualStockOverrides || {};
        newSlots = payload.data.driverSearchSlots || Array(10).fill("");
        setInvoices(newInvoices);
        setManualStockOverrides(newOverrides);
        setDriverSearchSlots(newSlots);
        if (!silent) showNotification("success", `برنامه توزیع تاریخ ${dateStr} با موفقیت بارگذاری شد.`);
      } else {
        setInvoices(newInvoices);
        setManualStockOverrides(newOverrides);
        setDriverSearchSlots(prev => prev.length ? prev : Array(10).fill(""));
        if (!silent) showNotification("info", `اطلاعاتی برای تاریخ ${dateStr} وجود ندارد. آماده ورود اطلاعات جدید.`);
      }
      lastSyncedSnapshotRef.current = makeSnapshot(newInvoices, newOverrides, newSlots);
      warnedAboutConflictRef.current = false;
      loadSalesStatistics(dateStr, silent);
    } catch (e) {
      console.error("Error loading daily plan", e);
      if (!silent) showNotification("error", "خطا در بازیابی اطلاعات توزیع روزانه.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  registerLoaders(loadConfig, loadDailyPlan);

  const saveDailyPlan = async () => {
    try {
      setSaving(true);
      const planData: DailyPlan = {
        date: formattedDate,
        invoices,
        manualStockOverrides,
        driverSearchSlots
      };

      const res = await apiFetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formattedDate,
          data: planData,
          userEmail: user?.email || "admin@system.com"
        })
      });

      const result = await res.json();
      if (result.status === "success") {
        showNotification("success", `اطلاعات تاریخ ${formattedDate} با موفقیت در بانک اطلاعاتی ذخیره شد.`);
        lastSyncedSnapshotRef.current = makeSnapshot(invoices, manualStockOverrides, driverSearchSlots);
        warnedAboutConflictRef.current = false;
        loadSalesStatistics();
      } else {
        showNotification("error", `خطا در ذخیره‌سازی: ${result.message}`);
      }
    } catch (e) {
      console.error("Error saving daily plan", e);
      showNotification("error", "خطا در ارسال اطلاعات به سرور.");
    } finally {
      setSaving(false);
    }
  };

  const saveMasterConfig = async (updatedDrivers: Driver[], updatedProducts: Product[]) => {
    try {
      const res = await apiFetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drivers: updatedDrivers,
          products: updatedProducts
        })
      });
      const result = await res.json();
      if (result.status === "success") {
        showNotification("success", "تنظیمات پایه و محصولات جدید با موفقیت ذخیره شدند.");
        loadSalesStatistics();
      }
    } catch (e) {
      console.error("Error saving master config", e);
      showNotification("error", "خطا در ذخیره‌سازی تنظیمات پایه.");
    }
  };

  registerSaveMasterConfig(saveMasterConfig);

  const getAllocatedQuantities = (): { [productId: string]: number } => {
    const allocations: { [productId: string]: number } = {};
    validProducts.forEach((p) => {
      allocations[p.id] = 0;
    });
    visibleInvoices.forEach((inv) => {
      if (inv.isActive !== false) {
        Object.entries(inv.quantities).forEach(([pId, qty]) => {
          const numQty = Number(qty) || 0;
          if (allocations[pId] !== undefined) {
            allocations[pId] += numQty;
          } else {
            allocations[pId] = numQty;
          }
        });
      }
    });
    return allocations;
  };

  const allocatedQuantities = getAllocatedQuantities();

  const getProductStock = (productId: string, defaultStock: number): number => {
    const carriedOver = computedStartingStocks[productId] || 0;
    const manualAdd = manualStockOverrides[productId] !== undefined ? manualStockOverrides[productId] : 0;
    return carriedOver + manualAdd;
  };

  const totalPlannedWeight = visibleInvoices
    .filter((inv) => inv.isActive !== false)
    .reduce((sum, inv) => sum + getInvoiceWeight(inv), 0);

  const totalInitialStockWeight = validProducts.reduce((sum, p) => {
    const stock = getProductStock(p.id, p.defaultStock);
    return sum + stock;
  }, 0);
  
  const totalPlannedCartons = visibleInvoices
    .filter((inv) => inv.isActive !== false)
    .reduce((sum, inv) => sum + getInvoiceCartonsReal(inv, products), 0);

  const totalOverloadedDrivers = visibleInvoices.filter((inv) => {
    if (inv.isActive === false || !inv.driverName) return false;
    const currentVolumetricWeight = getInvoiceVolumetricWeight(inv, products);
    const maxCapacity = getDriverCapacity(inv.driverName, drivers);
    return currentVolumetricWeight > maxCapacity;
  }).length;

  const totalSentDrivers = Array.from(
    new Set(
      visibleInvoices
        .filter((inv) => inv.isActive !== false && inv.driverName && inv.driverName.trim() !== "")
        .map((inv) => inv.driverName.trim())
    )
  ).length;

  const totalSentCustomers = Array.from(
    new Set(
      visibleInvoices
        .filter((inv) => inv.isActive !== false && inv.customerName && inv.customerName.trim() !== "")
        .map((inv) => inv.customerName.trim())
    )
  ).length;

  const totalRemainingStockWeight = Math.max(0, totalInitialStockWeight - totalPlannedWeight);
  const loadingRate = totalInitialStockWeight > 0 ? (totalPlannedWeight / totalInitialStockWeight) * 100 : 0;
  const avgWeightPerDriver = totalSentDrivers > 0 ? totalPlannedWeight / totalSentDrivers : 0;

  const getTopTenProducts = () => {
    if (!validProducts || validProducts.length === 0) return [];

    const allMapped = validProducts.map((p) => {
      const todayWeight = allocatedQuantities[p.id] || 0;
      const totalSales = getProductSalesInPeriod(p, dashboardPeriodDays);
      return {
        product: p,
        name: `${p.category} ${p.flavor ? `(${p.flavor})` : ""}`,
        totalSales,
        todayWeight,
        category: p.category
      };
    });
    return allMapped.sort((a, b) => b.totalSales - a.totalSales).slice(0, 10);
  };

  const isTodayInPeriod = typeof dashboardPeriod === 'number' || (formattedDate >= dashboardPeriod.startDate && formattedDate <= dashboardPeriod.endDate);

  const getProductSalesInPeriod = (p: Product, days: number) => {
    const todayWeight = isTodayInPeriod ? (allocatedQuantities[p.id] || 0) : 0;
    const historicalSales = realSales[p.id] || 0;
    return historicalSales + todayWeight;
  };

  const totalSalesToday = validProducts.reduce((sum, p) => sum + (allocatedQuantities[p.id] || 0), 0);
  const totalSales30Days = validProducts.reduce((sum, p) => sum + getProductSalesInPeriod(p, dashboardPeriodDays), 0);

  const top3Drivers = Object.entries(invoiceStats.driverStats)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3);
    
  const getProduct30DayIncoming = (p: Product) => {
    const todayIncoming = isTodayInPeriod ? (manualStockOverrides[p.id] || 0) : 0;
    const historicalIncoming = realIncoming[p.id] || 0;
    return historicalIncoming + todayIncoming;
  };

  const totalIncoming30Days = validProducts.reduce((sum, p) => sum + getProduct30DayIncoming(p), 0);

  const getCategorySalesAggregate = () => {
    const aggregates: { [category: string]: { totalSales: number; todaySales: number; count: number } } = {};
    validProducts.forEach((p) => {
      const todayWeight = isTodayInPeriod ? (allocatedQuantities[p.id] || 0) : 0;
      const totalSales = getProductSalesInPeriod(p, dashboardPeriodDays);
      if (!aggregates[p.category]) {
        aggregates[p.category] = { totalSales: 0, todaySales: 0, count: 0 };
      }
      aggregates[p.category].totalSales += totalSales;
      aggregates[p.category].todaySales += todayWeight;
      aggregates[p.category].count += 1;
    });
    return aggregates;
  };

  const getCategoryFlavorsRanking = (category: string) => {
    const filtered = validProducts.filter((p) => p.category === category);
    return filtered.map((p) => {
      const todayWeight = isTodayInPeriod ? (allocatedQuantities[p.id] || 0) : 0;
      const totalSales = getProductSalesInPeriod(p, dashboardPeriodDays);
      return {
        product: p,
        flavorName: p.flavor || "ساده",
        totalSales,
        todayWeight
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
  };

  const handleAddInvoiceRun = () => {
    const newRun: InvoiceRun = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      driverName: "",
      round: 1,
      customerName: "",
      destinationLocation: "",
      quantities: {},
      isActive: true,
      description: "",
      shippingAgency: ""
    };

    setInvoices([...invoices, newRun]);
    showNotification("success", "فاکتور جدید خام (بدون راننده) با موفقیت ایجاد شد.");
  };

  const handleUpdateInvoiceHeader = (runId: string, field: keyof InvoiceRun, value: any) => {
    setInvoices(
      invoices.map((inv) => {
        if (inv.id === runId) {
          if (field === "driverName") {
            const nextRound = invoices
              .filter((i) => i.driverName === value && i.id !== runId)
              .reduce((max, i) => Math.max(max, i.round), 0) + 1;
            return { ...inv, [field]: value, round: nextRound };
          }
          return { ...inv, [field]: value };
        }
        return inv;
      })
    );
  };

  const handleUpdateCell = (runId: string, productId: string, value: number) => {
    setInvoices(
      invoices.map((inv) => {
        if (inv.id === runId) {
          return {
            ...inv,
            quantities: {
              ...inv.quantities,
              [productId]: value
            }
          };
        }
        return inv;
      })
    );
  };

  const handleUpdateStockOverride = (productId: string, value: number | null | undefined) => {
    const updated = { ...manualStockOverrides };
    if (value === null || value === undefined) {
      delete updated[productId];
    } else {
      updated[productId] = value;
    }
    setManualStockOverrides(updated);
  };

  const handleDeleteInvoice = (runId: string) => {
    setInvoices(invoices.filter((inv) => inv.id !== runId));
    showNotification("info", "فاکتور مربوطه حذف شد.");
  };

  const handleMoveInactiveToTomorrow = async () => {
    const inactiveInvoices = invoices.filter((inv) => inv.isActive === false);
    if (inactiveInvoices.length === 0) {
      showNotification("info", "هیچ فاکتور غیرفعالی برای انتقال پیدا نشد.");
      return;
    }

    try {
      setSaving(true);
      const tomorrowStr = getTomorrowShamsiDate(shamsiYear, shamsiMonth, shamsiDay);

      const loadRes = await apiFetch(`/api/load/${encodeURIComponent(tomorrowStr)}`);
      const payload = await loadRes.json();

      let tomorrowPlan: DailyPlan;
      if (payload.found && payload.data) {
        tomorrowPlan = payload.data;
      } else {
        tomorrowPlan = {
          date: tomorrowStr,
          invoices: [],
          manualStockOverrides: {},
          driverSearchSlots: Array(10).fill("")
        };
      }

      const moved = inactiveInvoices.map((inv) => ({
        ...inv,
        isActive: true
      }));

      tomorrowPlan.invoices = [...(tomorrowPlan.invoices || []), ...moved];

      const saveTomorrowRes = await apiFetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: tomorrowStr,
          data: tomorrowPlan,
          userEmail: user?.email || "admin@system.com"
        })
      });

      const tomorrowResult = await saveTomorrowRes.json();
      if (tomorrowResult.status !== "success") {
        throw new Error("خطا در ذخیره برنامه فردا");
      }

      const remainingInvoices = invoices.filter((inv) => inv.isActive !== false);
      setInvoices(remainingInvoices);

      const saveTodayRes = await apiFetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formattedDate,
          data: {
            date: formattedDate,
            invoices: remainingInvoices,
            manualStockOverrides,
            driverSearchSlots
          },
          userEmail: user?.email || "admin@system.com"
        })
      });

      const todayResult = await saveTodayRes.json();
      if (todayResult.status === "success") {
        await logActivity(user?.email || 'admin@system.com', 'انتقال فاکتورهای غیرفعال به روز بعد', {
          count: inactiveInvoices.length,
          fromDate: formattedDate,
          toDate: tomorrowStr
        });
        showNotification(
          "success",
          `تعداد ${inactiveInvoices.length} فاکتور با موفقیت به فردا (${tomorrowStr}) منتقل و ثبت شدند.`
        );
      } else {
        showNotification("error", "خطا در بروزرسانی برنامه امروز.");
      }
    } catch (err) {
      console.error("Error moving inactive invoices", err);
      showNotification("error", "خطا در فرایند انتقال فاکتورها به روز بعد.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrevDay = () => {
    if (shamsiDay > 1) {
      setShamsiDay(shamsiDay - 1);
    } else {
      const prevMonth = shamsiMonth === 1 ? 12 : shamsiMonth - 1;
      const prevYear = shamsiMonth === 1 ? shamsiYear - 1 : shamsiYear;
      const daysInPrevMonth = SHAMSI_MONTHS.find((m) => m.id === prevMonth)?.days || 30;
      setShamsiYear(prevYear);
      setShamsiMonth(prevMonth);
      setShamsiDay(daysInPrevMonth);
    }
  };

  const handleNextDay = () => {
    const maxDays = SHAMSI_MONTHS.find((m) => m.id === shamsiMonth)?.days || 30;
    if (shamsiDay < maxDays) {
      setShamsiDay(shamsiDay + 1);
    } else {
      const nextMonth = shamsiMonth === 12 ? 1 : shamsiMonth + 1;
      const nextYear = shamsiMonth === 12 ? shamsiYear + 1 : shamsiYear;
      setShamsiYear(nextYear);
      setShamsiMonth(nextMonth);
      setShamsiDay(1);
    }
  };

  const handleResetCurrentDayPlan = () => {
    if (confirm("آیا مطمئن هستید که می‌خواهید تمام فاکتورهای امروز را پاک کنید؟")) {
      setInvoices([]);
      showNotification("info", "برنامه امروز بازنشانی شد.");
    }
  };

  const handleExportExcel = () => {
    exportToExcelHtml(
      invoices,
      validProducts,
      allocatedQuantities,
      getProductStock,
      manualStockOverrides,
      driverSearchSlots,
      selectedCategoryFilter,
      formattedDate,
      showNotification,
      drivers
    );
  };

  const handleExportAsImage = async () => {
    const element = document.getElementById("main-unified-grid");
    if (!element) {
      showNotification("error", "جدول اصلی پیدا نشد.");
      return;
    }

    showNotification("info", "در حال پردازش و تولید تصویر باکیفیت از جدول... لطفا شکیبا باشید.");

    try {
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth + 100,
        windowHeight: element.scrollHeight + 100,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("main-unified-grid");
          if (clonedElement) {
            const buttons = clonedElement.querySelectorAll("button");
            buttons.forEach((btn) => {
              btn.style.display = "none";
            });

            const inputs = clonedElement.querySelectorAll("input");
            inputs.forEach((input) => {
              if (input.type === "checkbox") {
                const parentLabel = input.closest("label");
                if (parentLabel) {
                  if (!input.checked) {
                    parentLabel.style.opacity = "0.4";
                    parentLabel.textContent = "غیرفعال";
                  } else {
                    parentLabel.textContent = "فعال";
                  }
                }
              } else {
                const value = input.value || "";
                const span = clonedDoc.createElement("span");
                span.textContent = value === "" ? "-" : value;
                span.className = "font-extrabold text-[11px] text-slate-800 text-center block w-full py-1";
                input.parentNode?.replaceChild(span, input);
              }
            });

            const selects = clonedElement.querySelectorAll("select");
            selects.forEach((select) => {
              const selectedOption = select.options[select.selectedIndex];
              let value = selectedOption ? selectedOption.text : "";
              if (value.startsWith("--")) value = "-";
              const span = clonedDoc.createElement("span");
              span.textContent = value;
              span.className = "font-black text-xs text-slate-900 text-center block w-full py-1";
              select.parentNode?.replaceChild(span, select);
            });

            clonedElement.style.overflow = "visible";
            clonedElement.style.width = "auto";
            clonedElement.style.maxWidth = "none";

            const stickies = clonedElement.querySelectorAll(".sticky");
            stickies.forEach((el) => {
              const elem = el as HTMLElement;
              elem.style.position = "static";
              elem.style.boxShadow = "none";
              elem.style.backgroundColor = "#f1f5f9";
            });
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const dateStr = formattedDate ? formattedDate.replace(/\//g, "-") : "امروز";
      link.download = `جدول_برنامه‌ریزی_و_فروش_${dateStr}.png`;
      link.href = imgData;
      link.click();
      showNotification("success", "تصویر باکیفیت جدول با موفقیت دانلود شد.");
    } catch (error) {
      console.error(error);
      showNotification("error", "خطا در تولید تصویر جدول.");
    }
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          showNotification("error", "فایل اکسل خالی یا نامعتبر است.");
          return;
        }

        const importedProducts: Product[] = [];
        const newStockOverrides: { [productId: string]: number } = { ...manualStockOverrides };

        data.forEach((row, idx) => {
          const category = row["دسته‌بندی اصلی"] || row["دسته"] || row["کالا"] || "نامشخص";
          const flavor = row["طعم"] || row["اسانس"] || `طعم ${idx + 1}`;
          const unitWeight = parseFloat(row["وزن واحد"] || row["وزن واحد (کیلو)"] || "10");
          const defaultStock = parseInt(row["موجودی"] || row["موجودی انبار"] || "200", 10);

          const id = `imported_${idx}_${Date.now()}`;
          importedProducts.push({
            id,
            category,
            flavor,
            unitWeight,
            defaultStock
          });

          newStockOverrides[id] = defaultStock;
        });

        if (confirm(`تعداد ${importedProducts.length} محصول از اکسل استخراج شد. آیا جایگزین محصولات پایه فعلی شوند؟`)) {
          setProducts(importedProducts);
          setManualStockOverrides(newStockOverrides);
          saveMasterConfig(drivers, importedProducts);
          showNotification("success", "لیست کالاها و موجودی انبار با موفقیت از اکسل درون‌ریزی شد.");
        }
      } catch (err) {
        console.error(err);
        showNotification("error", "قالب‌بندی فایل اکسل نادرست است.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const getCategoryAggregateOutflow = () => {
    const catOutflow: { [category: string]: { weight: number; packs: number } } = {};
    validProducts.forEach((p) => {
      if (!catOutflow[p.category]) {
        catOutflow[p.category] = { weight: 0, packs: 0 };
      }
      const qty = allocatedQuantities[p.id] || 0;
      catOutflow[p.category].weight += qty;
      const divider = p.unitWeight;
      if (divider > 0) {
        catOutflow[p.category].packs += qty / divider;
      }
    });
    return catOutflow;
  };

  const getCategoryAggregateStock = () => {
    const catStock: { [category: string]: { totalStock: number; totalRemaining: number; totalStockCartons: number; totalRemainingCartons: number } } = {};
    validProducts.forEach((p) => {
      if (!catStock[p.category]) {
        catStock[p.category] = { totalStock: 0, totalRemaining: 0, totalStockCartons: 0, totalRemainingCartons: 0 };
      }
      const stock = getProductStock(p.id, p.defaultStock);
      const allocated = allocatedQuantities[p.id] || 0;
      catStock[p.category].totalStock += stock;
      catStock[p.category].totalRemaining += (stock - allocated);
      const divider = p.realCartonWeight && p.realCartonWeight > 0 ? p.realCartonWeight : p.unitWeight;
      if (divider > 0) {
        catStock[p.category].totalStockCartons += stock / divider;
        catStock[p.category].totalRemainingCartons += (stock - allocated) / divider;
      }
    });
    return catStock;
  };

  const getCustomWarehouseSummary = () => {
    let badam = 0, sunflower = 0, soya = 0, cashew = 0, khaleeji = 0, corn = 0, snack = 0;
    validProducts.forEach((p) => {
      const qty = allocatedQuantities[p.id] || 0;
      const cat = p.category;
      if (cat === "بادام زمینی") badam += qty;
      else if (cat === "آفتابگردان") sunflower += qty;
      else if (cat === "سویا") soya += qty;
      else if (cat === "بادام هندی") cashew += qty;
      else if (cat === "خلیجی") khaleeji += qty;
      else if (cat === "ذرت کبابی") corn += qty;
      else if (cat && cat.startsWith("اسنک")) snack += qty;
      else if (cat && cat.includes("اسنک")) snack += qty;
    });
    const total = badam + sunflower + soya + cashew + khaleeji + corn + snack;
    return { badam, sunflower, soya, cashew, khaleeji, corn, snack, total };
  };

  const getCustomRemainingStockSummary = () => {
    let badam = 0, sunflower = 0, soya = 0, cashew = 0, khaleeji = 0, corn = 0, snack = 0;
    validProducts.forEach((p) => {
      const stock = getProductStock(p.id, p.defaultStock);
      const sold = allocatedQuantities[p.id] || 0;
      const remaining = stock - sold;
      const cat = p.category;
      if (cat === "بادام زمینی") badam += remaining;
      else if (cat === "آفتابگردان") sunflower += remaining;
      else if (cat === "سویا") soya += remaining;
      else if (cat === "بادام هندی") cashew += remaining;
      else if (cat === "خلیجی") khaleeji += remaining;
      else if (cat === "ذرت کبابی") corn += remaining;
      else if (cat && cat.startsWith("اسنک")) snack += remaining;
      else if (cat && cat.includes("اسنک")) snack += remaining;
    });
    const total = badam + sunflower + soya + cashew + khaleeji + corn + snack;
    return { badam, sunflower, soya, cashew, khaleeji, corn, snack, total };
  };

  const getDetailedExcelGridData = (categoryFilter: string = "all") => {
    const getProductInfo = (p: Product) => {
      const stock = getProductStock(p.id, p.defaultStock);
      const sold = allocatedQuantities[p.id] || 0;
      const remaining = stock - sold;
      const name = p.flavor && p.flavor !== "-" ? `${p.category} (${p.flavor})` : p.category;
      return { name, value: remaining };
    };

    const filteredProducts = categoryFilter === "all" 
      ? validProducts.filter(p => p.category && p.category.trim() !== '')
      : validProducts.filter(p => p.category === categoryFilter && p.category && p.category.trim() !== '');

    const rightCols: { name: string; value: number | string; isSpacer: boolean }[] = [];
    const leftCols: { name: string; value: number | string; isSpacer: boolean }[] = [];

    const totalProducts = filteredProducts.length;
    const half = Math.ceil(totalProducts / 2);

    for (let i = 0; i < half; i++) {
      if (i < totalProducts) {
        rightCols.push({ ...getProductInfo(filteredProducts[i]), isSpacer: false });
      } else {
        rightCols.push({ name: "", value: "", isSpacer: true });
      }
    }

    for (let i = half; i < totalProducts; i++) {
      if (i < totalProducts) {
        leftCols.push({ ...getProductInfo(filteredProducts[i]), isSpacer: false });
      } else {
        leftCols.push({ name: "", value: "", isSpacer: true });
      }
    }

    const maxLen = Math.max(rightCols.length, leftCols.length);
    const finalRows = [];
    for (let i = 0; i < maxLen; i++) {
      finalRows.push({
        right: rightCols[i] || { name: "", value: "", isSpacer: true },
        left: leftCols[i] || { name: "", value: "", isSpacer: true }
      });
    }

    return finalRows;
  };

  const matrixProps = {
    products,
    drivers,
    invoices,
    driverSearchSlots,
    selectedCategoryFilter,
    shamsiYear,
    shamsiMonth,
    shamsiDay,
    validProducts
  };

  const renderMatrixContent = (isModal = false) => {
    return renderMatrixContentUtil(isModal, matrixProps);
  };

  const renderDriverSheetsContent = (isPrint: boolean, targetDriver: string | null) => {
    return renderDriverSheetsContentUtil(isPrint, targetDriver, matrixProps);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-cyan-200 selection:text-slate-950">
      <div className={(showPrintPreview || driverPrintPreview) ? "print:hidden flex flex-col flex-1" : "flex flex-col flex-1"}>
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border backdrop-blur-md max-w-md ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : notification.type === "error"
                ? "bg-rose-50 border-rose-300 text-rose-950"
                : "bg-cyan-50 border-cyan-300 text-cyan-950"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : notification.type === "error" ? (
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            ) : (
              <Package className="w-6 h-6 text-cyan-600 shrink-0" />
            )}
            <p className="text-sm font-semibold leading-relaxed">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AppHeader
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        user={user}
        role={role}
        logout={logout}
        todayShamsi={todayShamsi}
        shamsiYear={shamsiYear}
        shamsiMonth={shamsiMonth}
        shamsiDay={shamsiDay}
        formattedDate={formattedDate}
        handlePrevDay={handlePrevDay}
        handleNextDay={handleNextDay}
        setTempYear={setTempYear}
        setTempMonth={setTempMonth}
        setTempDay={setTempDay}
        setManualDateInput={setManualDateInput}
        setShowDatePicker={setShowDatePicker}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
        onOpenVersionHistory={() => setShowVersionHistoryModal(true)}
      />

      <main className="flex-1 overflow-auto p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="text-slate-400 font-medium">داده‌ها در حال همگام‌سازی و بارگذاری هستند...</p>
          </div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">
            {activeTab === "logs" && role === "admin" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <ActivityLogScreen />
              </motion.div>
            )}

            {activeTab === "users" && role === "admin" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <UserManagementScreen />
              </motion.div>
            )}

            {activeTab === "backup" && role === "admin" && (
              <BackupScreen
                handleDownloadBackup={handleDownloadBackup}
                backupDownloading={backupDownloading}
                backupFromDate={backupFromDate}
                setBackupFromDate={setBackupFromDate}
                backupToDate={backupToDate}
                setBackupToDate={setBackupToDate}
                backupFileInputRef={backupFileInputRef}
                handleRestoreBackupFile={handleRestoreBackupFile}
                backupRestoring={backupRestoring}
                userEmail={user?.email}
                handleResetDailyData={handleResetDailyData}
                resettingDailyData={resettingDailyData}
                showFactoryResetConfirm={showFactoryResetConfirm}
                setShowFactoryResetConfirm={setShowFactoryResetConfirm}
                factoryResetConfirmText={factoryResetConfirmText}
                setFactoryResetConfirmText={setFactoryResetConfirmText}
                handleFactoryReset={handleFactoryReset}
                factoryResetting={factoryResetting}
              />
            )}

            {activeTab === "forecast" && role !== 'driver' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <StockForecastScreen 
                  products={validProducts}
                  getProductStock={getProductStock}
                  allocatedQuantities={allocatedQuantities}
                  getProductSalesInPeriod={getProductSalesInPeriod}
                />
              </motion.div>
            )}
            
            {activeTab === "dashboard" && (
              <DashboardScreen
                role={role}
                user={user}
                totalPlannedWeight={totalPlannedWeight}
                totalInitialStockWeight={totalInitialStockWeight}
                totalSentDrivers={totalSentDrivers}
                totalSentCustomers={totalSentCustomers}
                totalSales30Days={totalSales30Days}
                totalIncoming30Days={totalIncoming30Days}
                top3Drivers={top3Drivers as Array<[string, number]>}
                invoiceStats={invoiceStats}
                getTopTenProducts={getTopTenProducts}
                dashboardRightTab={dashboardRightTab}
                setDashboardRightTab={setDashboardRightTab}
                dashboardPeriod={dashboardPeriod}
                setDashboardPeriod={setDashboardPeriod}
                dashboardPeriodDays={dashboardPeriodDays}
                dashboardPeriodLabel={dashboardPeriodLabel}
                getCategorySalesAggregate={getCategorySalesAggregate}
                selectedCategorySales={selectedCategorySales}
                setSelectedCategorySales={setSelectedCategorySales}
                getCategoryFlavorsRanking={getCategoryFlavorsRanking}
                getCategoryAggregateStock={getCategoryAggregateStock}
              />
            )}

            {activeTab === "planning" && role !== 'driver' && role !== 'visitor' && role !== 'production_manager' && (
              <PlanningScreen
                role={role}
                invoices={invoices}
                drivers={drivers}
                products={products}
                allocatedQuantities={allocatedQuantities}
                getProductStock={getProductStock}
                manualStockOverrides={manualStockOverrides}
                driverSearchSlots={driverSearchSlots}
                setDriverSearchSlots={setDriverSearchSlots}
                shamsiYear={shamsiYear}
                shamsiMonth={shamsiMonth}
                shamsiDay={shamsiDay}
                formattedDate={formattedDate}
                selectedCategoryFilter={selectedCategoryFilter}
                setSelectedCategoryFilter={setSelectedCategoryFilter}
                isProductEditMode={isProductEditMode}
                setIsProductEditMode={setIsProductEditMode}
                gridSelectionStats={gridSelectionStats}
                setCellSelection={setCellSelection}
                selectionAnchorRef={selectionAnchorRef}
                gridZoomWrapperRef={gridZoomWrapperRef}
                zoomLabelRef={zoomLabelRef}
                sumBarCountRef={sumBarCountRef}
                sumBarValueRef={sumBarValueRef}
                handleUpdateInvoiceHeader={handleUpdateInvoiceHeader}
                handleDeleteInvoice={handleDeleteInvoice}
                handleUpdateCell={handleUpdateCell}
                handleUpdateStockOverride={handleUpdateStockOverride}
                handleAddInvoiceRun={handleAddInvoiceRun}
                handleResetCurrentDayPlan={handleResetCurrentDayPlan}
                saveDailyPlan={saveDailyPlan}
                saving={saving}
                handleMoveInactiveToTomorrow={handleMoveInactiveToTomorrow}
                openCustomerSearchModal={openCustomerSearchModal}
                handleExportExcel={handleExportExcel}
                setShowPrintPreview={setShowPrintPreview}
                handleGridCellMouseDown={handleGridCellMouseDown}
                handleGridCellMouseEnter={handleGridCellMouseEnter}
                handleClearSelectedGridCells={handleClearSelectedGridCells}
                handleZoomIn={handleZoomIn}
                handleZoomOut={handleZoomOut}
                handleZoomReset={handleZoomReset}
                isGridCellSelected={isGridCellSelected}
                saveMasterConfig={saveMasterConfig}
                setProducts={setProducts}
              />
            )}

            {activeTab === "drivers" && role !== 'visitor' && role !== 'production_manager' && (
              <DriversScreen
                visibleInvoices={visibleInvoices}
                drivers={drivers}
                validProducts={validProducts}
                driverSearchSlots={driverSearchSlots}
                role={role}
                setPrintDriverName={setPrintDriverName}
                setDriverPrintPreview={setDriverPrintPreview}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "warehouse" && role !== 'driver' && (
              <WarehouseScreen
                role={role}
                openCustomerSearchModal={openCustomerSearchModal}
                handleExcelImport={handleExcelImport}
                shamsiYear={shamsiYear}
                shamsiMonth={shamsiMonth}
                shamsiDay={shamsiDay}
                getCustomRemainingStockSummary={getCustomRemainingStockSummary}
                getCustomWarehouseSummary={getCustomWarehouseSummary}
                detailedInventoryFilter={detailedInventoryFilter}
                setDetailedInventoryFilter={setDetailedInventoryFilter}
                validProducts={validProducts}
                getDetailedExcelGridData={getDetailedExcelGridData}
              />
            )}

            {activeTab === "config" && role === 'admin' && (
              <ConfigScreen
                editingDriverName={editingDriverName}
                newDriverName={newDriverName}
                setNewDriverName={setNewDriverName}
                newDriverVehicle={newDriverVehicle}
                setNewDriverVehicle={setNewDriverVehicle}
                newDriverColor={newDriverColor}
                setNewDriverColor={setNewDriverColor}
                handleAddDriver={handleAddDriver}
                handleCancelEditDriver={handleCancelEditDriver}
                editingProductId={editingProductId}
                newProductCategory={newProductCategory}
                setNewProductCategory={setNewProductCategory}
                newProductFlavor={newProductFlavor}
                setNewProductFlavor={setNewProductFlavor}
                newProductWeight={newProductWeight}
                setNewProductWeight={setNewProductWeight}
                newProductRealCartonWeight={newProductRealCartonWeight}
                setNewProductRealCartonWeight={setNewProductRealCartonWeight}
                newProductStock={newProductStock}
                setNewProductStock={setNewProductStock}
                handleAddProduct={handleAddProduct}
                handleCancelEditProduct={handleCancelEditProduct}
                drivers={drivers}
                setDrivers={setDrivers}
                products={products}
                driversTablePage={driversTablePage}
                setDriversTablePage={setDriversTablePage}
                saveMasterConfig={saveMasterConfig}
                showNotification={showNotification}
                handleEditDriver={handleEditDriver}
                handleDeleteDriver={handleDeleteDriver}
                productTableFilter={productTableFilter}
                setProductTableFilter={setProductTableFilter}
                productsTablePage={productsTablePage}
                setProductsTablePage={setProductsTablePage}
                handleEditProduct={handleEditProduct}
                handleDeleteProduct={handleDeleteProduct}
              />
            )}
          </AnimatePresence>
        )}
      </main>

      <footer className="py-5 px-6 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl text-center text-xs text-slate-500 dark:text-slate-400 select-none no-print transition-colors duration-300 w-full shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          <p className="font-bold">
            © کلیه حقوق مادی و معنوی این سیستم برای <span className="text-blue-600 dark:text-cyan-400 text-sm font-black">برناتجارت باور</span> محفوظ است.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Support Phone */}
            <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-xs">
              <a
                href="tel:02137832,502"
                className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                title="تماس مستقیم با پشتیبانی فنی"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
                <span>پشتیبانی:</span>
                <span className="font-bold text-blue-700 dark:text-cyan-300 dir-ltr inline-block">02137832</span>
                <span className="text-slate-400">|</span>
                <span>داخلی:</span>
                <span className="font-bold text-amber-500">502</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText("02137832");
                  setCopiedSupportPhone(true);
                  setTimeout(() => setCopiedSupportPhone(false), 2000);
                }}
                className="p-1 hover:bg-slate-300/60 dark:hover:bg-slate-600/60 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="کپی شماره تلفن"
              >
                {copiedSupportPhone ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Version Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowVersionHistoryModal(true)}
              className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/70 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800/70 font-mono text-[11px] font-bold text-blue-700 dark:text-blue-300 transition-all cursor-pointer shadow-xs"
              title="مشاهده جزئیات کامل نگارش‌ها و تغییرات سامانه"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span>نسخه: v{APP_VERSION}</span>
            </button>

            {/* Copyright / Developer email */}
            <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-all shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>حق کپی رایت:</span>
              <a href="mailto:nazari925@gmail.com" className="underline hover:no-underline">nazari925@gmail.com</a>
            </div>
          </div>
        </div>
      </footer>
      </div>

      <CustomerSearchModal
        showCustomerSearchModal={showCustomerSearchModal}
        setShowCustomerSearchModal={setShowCustomerSearchModal}
        customerSearchName={customerSearchName}
        setCustomerSearchName={setCustomerSearchName}
        customerSearchFromDate={customerSearchFromDate}
        setCustomerSearchFromDate={setCustomerSearchFromDate}
        customerSearchResults={customerSearchResults}
        setCustomerSearchResults={setCustomerSearchResults}
        customerSearchLoading={customerSearchLoading}
        customerSearchError={customerSearchError}
        setCustomerSearchError={setCustomerSearchError}
        handleCustomerSearch={handleCustomerSearch}
        products={products}
      />

      <PrintPreviewModal
        showPrintPreview={showPrintPreview}
        setShowPrintPreview={setShowPrintPreview}
        driverPrintPreview={driverPrintPreview}
        setDriverPrintPreview={setDriverPrintPreview}
        printDriverName={printDriverName}
        renderMatrixContent={renderMatrixContent}
        renderDriverSheetsContent={renderDriverSheetsContent}
        setNotification={setNotification}
      />

      <DatePickerModal
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        tempYear={tempYear}
        setTempYear={setTempYear}
        tempMonth={tempMonth}
        setTempMonth={setTempMonth}
        tempDay={tempDay}
        setTempDay={setTempDay}
        manualDateInput={manualDateInput}
        setManualDateInput={setManualDateInput}
        todayShamsi={todayShamsi}
        setShamsiYear={setShamsiYear}
        setShamsiMonth={setShamsiMonth}
        setShamsiDay={setShamsiDay}
        showNotification={showNotification}
      />

      <ChangePasswordModal
        show={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        showNotification={showNotification}
      />

      <VersionHistoryModal
        show={showVersionHistoryModal}
        onClose={() => setShowVersionHistoryModal(false)}
      />
    </div>
  );
}