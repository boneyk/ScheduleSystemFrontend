import { useMemo } from 'react';

import { Dayjs } from 'dayjs';

import { WorkingHoursDto } from '@/dto/DtoOffice';

type UseModalEditDatePeriodParams = {
  date: Dayjs | null;
  error?: string;
  workingHoursBySelectedOffice: WorkingHoursDto[] | null;
};

const getWorkingDay = (officeTimetable: WorkingHoursDto[], dayOfWeek: number) => {
  return officeTimetable.find((workSchedule) => workSchedule.dayOfWeek === dayOfWeek) ?? null;
};

export const useModalEditSubstitutionDatePeriod = ({
  date,
  error,
  workingHoursBySelectedOffice
}: UseModalEditDatePeriodParams) => {
  const datePickerProps = useMemo(() => {
    const baseConfig = {
      disablePast: true,
      slotProps: { textField: { error: !!error } }
    };

    if (!workingHoursBySelectedOffice) return { ...baseConfig, disabled: true };

    return baseConfig;
  }, [error, workingHoursBySelectedOffice]);

  const timePickerProps = useMemo(() => {
    const baseConfig = {
      slotProps: { textField: { error: !!error } }
    };

    if (!workingHoursBySelectedOffice || !date) return baseConfig;

    const workingDay = getWorkingDay(workingHoursBySelectedOffice, date.day());
    if (!workingDay) return baseConfig;

    const [startHour, startMinute] = workingDay.startsOn.split(':').map(Number);
    const [endHour, endMinute] = workingDay.endsOn.split(':').map(Number);

    const base = date.startOf('day');
    const minTime = base.hour(startHour).minute(startMinute).second(0);
    const maxTime = base.hour(endHour).minute(endMinute).second(0);

    return { ...baseConfig, minTime, maxTime };
  }, [date, error, workingHoursBySelectedOffice]);

  return { datePickerProps, timePickerProps };
};
