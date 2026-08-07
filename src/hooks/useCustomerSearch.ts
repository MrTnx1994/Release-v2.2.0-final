import { useState } from "react";
import { apiFetch } from "../lib/apiClient";
import { getTodayShamsi } from "../utils/shamsi";

// State + handlers for the global "search a customer across all history"
// modal (opened from the planning screen's toolbar).
export function useCustomerSearch() {
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [customerSearchName, setCustomerSearchName] = useState("");
  const [customerSearchFromDate, setCustomerSearchFromDate] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState<any[] | null>(null);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState<string | null>(null);

  const openCustomerSearchModal = () => {
    const today = getTodayShamsi();
    const todayStr = `${today.year}/${today.month.toString().padStart(2, '0')}/${today.day.toString().padStart(2, '0')}`;
    setCustomerSearchFromDate(todayStr);
    setCustomerSearchName('');
    setCustomerSearchResults(null);
    setCustomerSearchError(null);
    setShowCustomerSearchModal(true);
  };

  const handleCustomerSearch = async (overrideFromDate?: string, overrideToDate?: string) => {
    if (!customerSearchName.trim()) {
      setCustomerSearchError("لطفاً نام مشتری را وارد کنید.");
      return;
    }
    const from = overrideFromDate !== undefined ? overrideFromDate : customerSearchFromDate;
    const to = overrideToDate !== undefined ? overrideToDate : "";

    setCustomerSearchLoading(true);
    setCustomerSearchError(null);
    try {
      const params = new URLSearchParams({
        name: customerSearchName.trim(),
        fromDate: from.trim(),
        toDate: to.trim()
      });

      const res = await apiFetch(`/api/search/customer?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "خطا در جستجو");
      }

      setCustomerSearchResults(data.results || []);
    } catch (err: any) {
      console.error("Customer search error:", err);
      setCustomerSearchError(err.message || "خطا در برقراری ارتباط با سرور.");
      setCustomerSearchResults(null);
    } finally {
      setCustomerSearchLoading(false);
    }
  };

  return {
    showCustomerSearchModal, setShowCustomerSearchModal,
    customerSearchName, setCustomerSearchName,
    customerSearchFromDate, setCustomerSearchFromDate,
    customerSearchResults, setCustomerSearchResults,
    customerSearchLoading,
    customerSearchError, setCustomerSearchError,
    openCustomerSearchModal,
    handleCustomerSearch,
  };
}
