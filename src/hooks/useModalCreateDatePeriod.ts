import { useMemo } from 'react';

import dayjs, { Dayjs } from 'dayjs';

import { OfficesIdsByEmployeeResponse } from '@/dto/DtoEmployeesService';
import { timetableStore } from '@/stores/timetable.store';

type UseModalCreateDatePeriodParams = {
  date: Dayjs | null;
  error?: string;
};

type UseModalCreateTimePeriodParams = {
  date: Dayjs | null;
  time: Dayjs | null;
  error?: string;
};

const getWorkingDay = (officeTimetable: OfficesIdsByEmployeeResponse[], dayOfWeek: number) => {
  const selectedOfficeId = timetableStore.selectedOffice?.id;
  const selectedOffice = officeTimetable.find((office) => office.id === selectedOfficeId);
  if (!selectedOffice?.workingHours) return null;
  return selectedOffice.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek) ?? null;
};

export const useModalCreateDatePeriod = ({ error }: UseModalCreateDatePeriodParams) => {
  const { officeTimetable } = timetableStore;

  return useMemo(() => {
    if (!officeTimetable) return {};

    return {
      disablePast: true,
      shouldDisableDate: (d: Dayjs) => {
        const workingDay = getWorkingDay(officeTimetable, d.day());
        return !workingDay;
      },
      slotProps: {
        textField: {
          error: !!error
        }
      }
    };
  }, [error, officeTimetable]);
};

export const useModalCreateTimePeriod = ({ date, time, error }: UseModalCreateTimePeriodParams) => {
  const { officeTimetable } = timetableStore;

  return useMemo(() => {
    const baseConfig = {
      slotProps: {
        textField: {
          error: !!error
        }
      }
    };

    if (!officeTimetable || !date) {
      return baseConfig;
    }

    const workingDay = getWorkingDay(officeTimetable, date.day());

    if (!workingDay) {
      return {
        ...baseConfig,
        shouldDisableTime: () => true
      };
    }
    const now = dayjs();

    const [startHour, startMinute] = workingDay.startsOn.split(':').map(Number);
    const [endHour, endMinute] = workingDay.endsOn.split(':').map(Number);

    const base = time ?? date;
    let minTime = base.hour(startHour).minute(startMinute).second(0).millisecond(0);
    const maxTime = base.hour(endHour).minute(endMinute).second(0).millisecond(0);

    if (date.isSame(now, 'day') && minTime.isBefore(now)) {
      minTime = now.second(0).millisecond(0);
    }

    return {
      ...baseConfig,
      minTime,
      maxTime
    };
  }, [date, time, error, officeTimetable]);
};
