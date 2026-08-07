import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Driver, Product, InvoiceRun } from "../types";
import { NotificationType } from "./useNotification";

interface UseDriverProductConfigDeps {
  drivers: Driver[];
  setDrivers: Dispatch<SetStateAction<Driver[]>>;
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  invoices: InvoiceRun[];
  setInvoices: Dispatch<SetStateAction<InvoiceRun[]>>;
  driverSearchSlots: string[];
  setDriverSearchSlots: Dispatch<SetStateAction<string[]>>;
  manualStockOverrides: { [productId: string]: number };
  setManualStockOverrides: Dispatch<SetStateAction<{ [productId: string]: number }>>;
  showNotification: (type: NotificationType, message: string) => void;
}

// The add/edit/delete forms for drivers and products on the Config screen.
// Two parallel form flows (driver + product) that share the same shape,
// pulled out together since ConfigScreen renders and drives both from one place.
//
// saveMasterConfig lives in App.tsx and is only defined after the component's
// early auth-loading return (hooks can't be called after that return), so
// it's wired in via a ref: call `registerSaveMasterConfig(saveMasterConfig)`
// once that function exists (a plain assignment, not a hook, so it's fine to
// do after the return).
export function useDriverProductConfig({
  drivers,
  setDrivers,
  products,
  setProducts,
  invoices,
  setInvoices,
  driverSearchSlots,
  setDriverSearchSlots,
  manualStockOverrides,
  setManualStockOverrides,
  showNotification,
}: UseDriverProductConfigDeps) {
  const saveMasterConfigRef = useRef<(updatedDrivers: Driver[], updatedProducts: Product[]) => void>(() => {});
  const registerSaveMasterConfig = (fn: (updatedDrivers: Driver[], updatedProducts: Product[]) => void) => {
    saveMasterConfigRef.current = fn;
  };
  const saveMasterConfig = (updatedDrivers: Driver[], updatedProducts: Product[]) => saveMasterConfigRef.current(updatedDrivers, updatedProducts);

  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverVehicle, setNewDriverVehicle] = useState("نیسان");
  const [newDriverColor, setNewDriverColor] = useState("pink-light");
  const [editingDriverName, setEditingDriverName] = useState<string | null>(null);

  const [newProductCategory, setNewProductCategory] = useState("بادام زمینی");
  const [newProductFlavor, setNewProductFlavor] = useState("");
  const [newProductWeight, setNewProductWeight] = useState(10);
  const [newProductStock, setNewProductStock] = useState(200);
  const [newProductRealCartonWeight, setNewProductRealCartonWeight] = useState(0);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleAddDriver = () => {
    if (!newDriverName.trim()) {
      showNotification("error", "نام راننده نمی‌تواند خالی باشد.");
      return;
    }
    const trimmedName = newDriverName.trim();

    if (editingDriverName) {
      if (trimmedName !== editingDriverName && drivers.some((d) => d.name === trimmedName)) {
        showNotification("error", "راننده‌ای با این نام قبلاً ثبت شده است.");
        return;
      }

      const updatedDrivers = drivers.map((d) =>
        d.name === editingDriverName
          ? { name: trimmedName, vehicle: newDriverVehicle, capacity: d.capacity, color: newDriverColor }
          : d
      );

      const updatedInvoices = invoices.map((inv) =>
        inv.driverName === editingDriverName ? { ...inv, driverName: trimmedName } : inv
      );

      const updatedSearchSlots = driverSearchSlots.map((slot) =>
        slot === editingDriverName ? trimmedName : slot
      );

      setDrivers(updatedDrivers);
      setInvoices(updatedInvoices);
      setDriverSearchSlots(updatedSearchSlots);

      setEditingDriverName(null);
      setNewDriverName("");
      setNewDriverVehicle("نیسان");
      setNewDriverColor("pink-light");

      saveMasterConfig(updatedDrivers, products);
      showNotification("success", "تغییرات راننده با موفقیت ذخیره شد.");
    } else {
      if (drivers.some((d) => d.name === trimmedName)) {
        showNotification("error", "راننده‌ای با این نام قبلاً ثبت شده است.");
        return;
      }
      const updated = [...drivers, {
        name: trimmedName,
        vehicle: newDriverVehicle,
        color: newDriverColor
      }];
      setDrivers(updated);
      setNewDriverName("");
      setNewDriverVehicle("نیسان");
      setNewDriverColor("pink-light");
      saveMasterConfig(updated, products);
      showNotification("success", "راننده جدید با موفقیت اضافه شد.");
    }
  };

  const handleEditDriver = (drv: Driver) => {
    setEditingDriverName(drv.name);
    setNewDriverName(drv.name);
    setNewDriverVehicle(drv.vehicle);
    setNewDriverColor(drv.color || "pink-light");
  };

  const handleCancelEditDriver = () => {
    setEditingDriverName(null);
    setNewDriverName("");
    setNewDriverVehicle("نیسان");
    setNewDriverColor("pink-light");
  };

  const handleDeleteDriver = (name: string) => {
    const updated = drivers.filter((d) => d.name !== name);
    setDrivers(updated);
    saveMasterConfig(updated, products);
    showNotification("info", `راننده ${name} حذف شد.`);
  };

  const handleAddProduct = () => {
    if (!newProductFlavor.trim()) {
      showNotification("error", "طعم محصول نمی‌تواند خالی باشد.");
      return;
    }
    const trimmedFlavor = newProductFlavor.trim();

    if (editingProductId) {
      const exists = products.some(
        (p) => p.id !== editingProductId && p.category === newProductCategory && p.flavor.trim().toLowerCase() === trimmedFlavor.toLowerCase()
      );
      if (exists) {
        showNotification("error", "این ترکیب کالا و طعم قبلاً ثبت شده است.");
        return;
      }

      const updated = products.map((p) =>
        p.id === editingProductId
          ? {
              ...p,
              category: newProductCategory,
              flavor: trimmedFlavor,
              unitWeight: newProductWeight,
              realCartonWeight: newProductRealCartonWeight,
              defaultStock: newProductStock,
            }
          : p
      );

      setProducts(updated);
      setEditingProductId(null);
      setNewProductFlavor("");
      setNewProductWeight(10);
      setNewProductRealCartonWeight(0);
      setNewProductStock(200);

      saveMasterConfig(drivers, updated);
      showNotification("success", "تغییرات محصول با موفقیت ذخیره شد.");
    } else {
      const exists = products.some(
        (p) => p.category === newProductCategory && p.flavor.trim().toLowerCase() === trimmedFlavor.toLowerCase()
      );
      if (exists) {
        showNotification("error", "این ترکیب کالا و طعم قبلاً ثبت شده است.");
        return;
      }

      const newProd: Product = {
        id: `prod_${Date.now()}`,
        category: newProductCategory,
        flavor: trimmedFlavor,
        unitWeight: newProductWeight,
        realCartonWeight: newProductRealCartonWeight,
        defaultStock: newProductStock
      };

      const updated = [...products, newProd];
      setProducts(updated);

      setManualStockOverrides({
        ...manualStockOverrides,
        [newProd.id]: newProductStock
      });

      setNewProductFlavor("");
      saveMasterConfig(drivers, updated);
      showNotification("success", "محصول جدید با موفقیت ثبت شد.");
    }
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setNewProductCategory(prod.category);
    setNewProductFlavor(prod.flavor);
    setNewProductWeight(prod.unitWeight);
    setNewProductRealCartonWeight(prod.realCartonWeight || 0);
    setNewProductStock(prod.defaultStock);
  };

  const handleCancelEditProduct = () => {
    setEditingProductId(null);
    setNewProductFlavor("");
    setNewProductWeight(10);
    setNewProductRealCartonWeight(0);
    setNewProductStock(200);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveMasterConfig(drivers, updated);
    showNotification("info", "محصول از تنظیمات پایه حذف شد.");
  };

  return {
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
  };
}
