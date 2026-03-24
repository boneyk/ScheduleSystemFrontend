import { useMemo } from 'react';

import dayjs, { Dayjs } from 'dayjs';

import { WorkingHoursDto } from '@/dto/DtoOffice';

type UseModalCreateSubstitutionDatePeriodParams = {
  date: Dayjs | null;
  error?: string;
  workingHoursBySelectedOffice: WorkingHoursDto[] | null;
  selectedOffice: { id: number; name: string } | null;
};

export const useModalSubsititutionGroupDatePeriod = ({
  date,
  error,
  workingHoursBySelectedOffice,
  selectedOffice
}: UseModalCreateSubstitutionDatePeriodParams) => {
  return useMemo(() => {
    if (!selectedOffice || !workingHoursBySelectedOffice) {
      return {
        disabled: true,
        slotProps: { textField: { error: !!error } }
      };
    }

    const getWorkingDay = (dayOfWeek: number) =>
      workingHoursBySelectedOffice.find((wh) => wh.dayOfWeek === dayOfWeek) ?? null;

    const today = dayjs();

    const baseConfig = {
      disabled: false,
      shouldDisableDate: (d: Dayjs) => {
        if (d.isBefore(today, 'day')) return true;
        return !getWorkingDay(d.day());
      },
      slotProps: { textField: { error: !!error } }
    };

    if (!date) return baseConfig;

    const workingDay = getWorkingDay(date.day());
    if (!workingDay) {
      return { ...baseConfig, shouldDisableTime: () => true };
    }

    const [startHour, startMinute] = workingDay.startsOn.split(':').map(Number);
    const [endHour, endMinute] = workingDay.endsOn.split(':').map(Number);

    let minTime = date.hour(startHour).minute(startMinute).second(0);
    const maxTime = date.hour(endHour).minute(endMinute).second(0);

    if (date.isSame(today, 'day') && minTime.isBefore(today)) {
      minTime = today;
    }

    return { ...baseConfig, minTime, maxTime };
  }, [date, error, workingHoursBySelectedOffice, selectedOffice]);
};
