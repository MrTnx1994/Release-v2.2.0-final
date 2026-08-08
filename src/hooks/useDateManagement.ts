import { useState, useMemo, useCallback, useEffect } from "react";
import {
  getTodayShamsi,
  getTomorrowShamsi,
  getNextWorkingDayShamsi,
  getPrevWorkingDayShamsi,
  getPrevShamsiDate,
  getTomorrowShamsiDate,
  getDateHolidayInfo,
} from "../utils/shamsi";
import { isOfficialHoliday } from "../utils/holidays";

const DATE_STORAGE_KEY = "borna_selected_planning_date";

type ShamsiDate = { year: number; month: number; day: number };

function getInitialDate(todayShamsi: ShamsiDate): ShamsiDate {
  try {
    const saved = localStorage.getItem(DATE_STORAGE_KEY);
    if (saved) {
      const [year, month, day] = saved.split("/").map(Number);
      if (
        Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day) &&
        year >= 1300 && year <= 1600 && month >= 1 && month <= 12 && day >= 1 && day <= 31
      ) {
        return { year, month, day };
      }
    }
  } catch (e) {
    // Ignore storage errors and use the normal default.
  }

  return getNextWorkingDayShamsi(todayShamsi.year, todayShamsi.month, todayShamsi.day, isOfficialHoliday);
}

export function useDateManagement() {
  const todayShamsi = getTodayShamsi();
  const tomorrowShamsi = getTomorrowShamsi();
  const initialDate = useMemo(() => getInitialDate(todayShamsi), [todayShamsi.year, todayShamsi.month, todayShamsi.day]);

  const [shamsiYear, setShamsiYear] = useState<number>(initialDate.year);
  const [shamsiMonth, setShamsiMonth] = useState<number>(initialDate.month);
  const [shamsiDay, setShamsiDay] = useState<number>(initialDate.day);

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [tempYear, setTempYear] = useState<number>(initialDate.year);
  const [tempMonth, setTempMonth] = useState<number>(initialDate.month);
  const [tempDay, setTempDay] = useState<number>(initialDate.day);
  const [manualDateInput, setManualDateInput] = useState<string>("");

  const formattedDate = useMemo(
    () => `${shamsiYear}/${shamsiMonth.toString().padStart(2, "0")}/${shamsiDay.toString().padStart(2, "0")}`,
    [shamsiYear, shamsiMonth, shamsiDay]
  );

  useEffect(() => {
    try {
      localStorage.setItem(DATE_STORAGE_KEY, formattedDate);
    } catch (e) {
      // Ignore storage errors.
    }
  }, [formattedDate]);

  const currentDateHolidayInfo = useMemo(
    () => getDateHolidayInfo(shamsiYear, shamsiMonth, shamsiDay),
    [shamsiYear, shamsiMonth, shamsiDay]
  );

  const handlePrevDay = useCallback(() => {
    const prevStr = getPrevShamsiDate(shamsiYear, shamsiMonth, shamsiDay);
    const [y, m, d] = prevStr.split("/").map(Number);
    setShamsiYear(y); setShamsiMonth(m); setShamsiDay(d);
  }, [shamsiYear, shamsiMonth, shamsiDay]);

  const handleNextDay = useCallback(() => {
    const nextStr = getTomorrowShamsiDate(shamsiYear, shamsiMonth, shamsiDay);
    const [y, m, d] = nextStr.split("/").map(Number);
    setShamsiYear(y); setShamsiMonth(m); setShamsiDay(d);
  }, [shamsiYear, shamsiMonth, shamsiDay]);

  const handleJumpNextWorkingDay = useCallback(() => {
    const target = getNextWorkingDayShamsi(shamsiYear, shamsiMonth, shamsiDay, isOfficialHoliday);
    setShamsiYear(target.year); setShamsiMonth(target.month); setShamsiDay(target.day);
  }, [shamsiYear, shamsiMonth, shamsiDay]);

  const handleJumpPrevWorkingDay = useCallback(() => {
    const target = getPrevWorkingDayShamsi(shamsiYear, shamsiMonth, shamsiDay, isOfficialHoliday);
    setShamsiYear(target.year); setShamsiMonth(target.month); setShamsiDay(target.day);
  }, [shamsiYear, shamsiMonth, shamsiDay]);

  const handleJumpToday = useCallback(() => {
    const today = getTodayShamsi();
    setShamsiYear(today.year); setShamsiMonth(today.month); setShamsiDay(today.day);
  }, []);

  return {
    todayShamsi,
    tomorrowShamsi,
    shamsiYear, setShamsiYear,
    shamsiMonth, setShamsiMonth,
    shamsiDay, setShamsiDay,
    showDatePicker, setShowDatePicker,
    tempYear, setTempYear,
    tempMonth, setTempMonth,
    tempDay, setTempDay,
    manualDateInput, setManualDateInput,
    formattedDate,
    currentDateHolidayInfo,
    handlePrevDay,
    handleNextDay,
    handleJumpNextWorkingDay,
    handleJumpPrevWorkingDay,
    handleJumpToday
  };
}
