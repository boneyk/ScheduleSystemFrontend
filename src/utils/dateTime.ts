import { Dayjs } from 'dayjs';

export const updateTime = (currentDate: Dayjs | null, newTime: Dayjs | null): Dayjs | null => {
  if (!newTime || !currentDate) return null;
  return currentDate.hour(newTime.hour()).minute(newTime.minute()).second(0).millisecond(0);
};

export const updateDate = (currentDate: Dayjs | null, newDate: Dayjs | null): Dayjs | null => {
  if (!newDate) return null;
  return currentDate
    ? newDate.hour(currentDate.hour()).minute(currentDate.minute()).second(currentDate.second())
    : newDate;
};
export const dayLabel: Record<string, string> = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  0: 'Вс'
};
export const dayOrder = [1, 2, 3, 4, 5, 6, 0] as const;
