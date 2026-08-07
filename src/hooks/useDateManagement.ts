import { useState, useMemo, useCallback } from "react";
import { 
  getTodayShamsi, 
  getTomorrowShamsi, 
  getNextWorkingDayShamsi, 
  getPrevWorkingDayShamsi,
  getPrevShamsiDate,
  getTomorrowShamsiDate,
  getDateHolidayInfo,
  SHAMSI_MONTHS 
} from "../utils/shamsi";
import { isOfficialHoliday } from "../utils/holidays";

export function useDateManagement() {
  const todayShamsi = getTodayShamsi();
  const tomorrowShamsi = getTomorrowShamsi();
  
  // Default to next working day (skipping Fridays and official Iranian public holidays)
  const nextWorkingDay = getNextWorkingDayShamsi(todayShamsi.year, todayShamsi.month, todayShamsi.day, isOfficialHoliday);

  const [shamsiYear, setShamsiYear] = useState<number>(nextWorkingDay.year);
  const [shamsiMonth, setShamsiMonth] = useState<number>(nextWorkingDay.month);
  const [shamsiDay, setShamsiDay] = useState<number>(nextWorkingDay.day);

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [tempYear, setTempYear] = useState<number>(nextWorkingDay.year);
  const [tempMonth, setTempMonth] = useState<number>(nextWorkingDay.month);
  const [tempDay, setTempDay] = useState<number>(nextWorkingDay.day);
  const [manualDateInput, setManualDateInput] = useState<string>("");

  const formattedDate = useMemo(
    () => `${shamsiYear}/${shamsiMonth.toString().padStart(2, "0")}/${shamsiDay.toString().padStart(2, "0")}`,
    [shamsiYear, shamsiMonth, shamsiDay]
  );

  const currentDateHolidayInfo = useMemo(
    () => getDateHolidayInfo(shamsiYear, shamsiMonth, shamsiDay),
    [shamsiYear, shamsiMonth, shamsiDay]
  );

  // Jump to single previous day
  const handlePrevDay = useCallback(() => {
    const prevStr = getPrevShamsiDate(shamsiYear, shamsiMonth, shamsiDay);
    const [y, m, d] = prevStr.split("/").map(Number);
    setShamsiYear(y);
    setShamsiMonth(m);
    setShamsiDay(d);
  }, [shamsiYear, shamsiMonth, shamsiDay]);

  // Jump to single next day
  const handleNextDay = useCallback(() => {
    const nextStr = getTomorrowShamsiDate(shamsiYear, shamsiMonth, shamsiDay);
    const [y, m, d] = nextStr.split("/").map(Number);
    setShamsiYear(y);
    setShamsiMonth(m);
    setShamsiDay(d);
  }, [shamsiYear, shamsiMonth, shamsiDay]);

  // Jump skipping holidays & Fridays to next working day
  const handleJumpNextWorkingDay = useCallback(() => {
    const target = getNextWorkingDayShamsi(shamsiYear, shamsiMonth, shamsiDay, isOfficialHoliday);
    setShamsiYear(target.year);
    setShamsiMonth(target.month);
    setShamsiDay(target.day);
  }, [shamsiYear, shamsiMonth, shamsiDay]);

  // Jump skipping holidays & Fridays to previous working day
  const handleJumpPrevWorkingDay = useCallback(() => {
    const target = getPrevWorkingDayShamsi(shamsiYear, shamsiMonth, shamsiDay, isOfficialHoliday);
    setShamsiYear(target.year);
    setShamsiMonth(target.month);
    setShamsiDay(target.day);
  }, [shamsiYear, shamsiMonth, shamsiDay]);

  // Jump to today
  const handleJumpToday = useCallback(() => {
    const today = getTodayShamsi();
    setShamsiYear(today.year);
    setShamsiMonth(today.month);
    setShamsiDay(today.day);
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
