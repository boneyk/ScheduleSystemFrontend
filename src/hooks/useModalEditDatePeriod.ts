import { useMemo } from 'react';

import dayjs, { Dayjs } from 'dayjs';

import { OfficesIdsByEmployeeResponse } from '@/dto/DtoEmployeesService';
import { timetableStore } from '@/stores/timetable.store';

type UseModalEditDatePeriodParams = {
  date: Dayjs | null;
  error?: string;
};

const getWorkingDay = (officeTimetable: OfficesIdsByEmployeeResponse[], dayOfWeek: number) => {
  const selectedOfficeId = timetableStore.selectedOffice?.id;
  const selectedOffice = officeTimetable.find((office) => office.id === selectedOfficeId);
  if (!selectedOffice?.workingHours) return null;
  return selectedOffice.workingHours.find((workSchedule) => workSchedule.dayOfWeek === dayOfWeek) ?? null;
};

export const useModalEditDatePeriod = ({ date, error }: UseModalEditDatePeriodParams) => {
  const { officeTimetable } = timetableStore;

  const datePickerProps = useMemo(() => {
    if (!officeTimetable) return {};

    const today = dayjs();

    return {
      shouldDisableDate: (d: Dayjs) => {
        if (d.isBefore(today, 'day')) return true;
        return !getWorkingDay(officeTimetable, d.day());
      },
      slotProps: { textField: { error: !!error } }
    };
  }, [error, officeTimetable]);

  const timePickerProps = useMemo(() => {
    const baseConfig = {
      slotProps: { textField: { error: !!error } }
    };

    if (!officeTimetable || !date) return baseConfig;

    const today = dayjs();
    const workingDay = getWorkingDay(officeTimetable, date.day());
    if (!workingDay) return baseConfig;

    const [startHour, startMinute] = workingDay.startsOn.split(':').map(Number);
    const [endHour, endMinute] = workingDay.endsOn.split(':').map(Number);

    const base = date.startOf('day'); // ← фиксированная база
    let minTime = base.hour(startHour).minute(startMinute).second(0);
    const maxTime = base.hour(endHour).minute(endMinute).second(0);

    if (date.isSame(today, 'day') && minTime.isBefore(today)) {
      minTime = today;
    }

    return { ...baseConfig, minTime, maxTime };
  }, [date, error, officeTimetable]);

  return { datePickerProps, timePickerProps };
};
