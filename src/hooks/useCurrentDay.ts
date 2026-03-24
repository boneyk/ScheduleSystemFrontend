import { useMemo } from 'react';

interface UseCurrentDayParams {
  cellDay: number;
  cellMonth: number;
  year: number;
}

interface UseCurrentDayResult {
  isCurrentDay: boolean;
  isWeekend: boolean;
  isPast: boolean;
}

export const useCurrentDay = ({ cellDay, cellMonth, year }: UseCurrentDayParams): UseCurrentDayResult => {
  return useMemo(() => {
    const today = new Date();
    const cellDate = new Date(year, cellMonth, cellDay);
    const dayOfWeek = cellDate.getDay();

    return {
      isCurrentDay: cellMonth === today.getMonth() && cellDay === today.getDate() && year === today.getFullYear(),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isPast: cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    };
  }, [cellDay, cellMonth, year]);
};
