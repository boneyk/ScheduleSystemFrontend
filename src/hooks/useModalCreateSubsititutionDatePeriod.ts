import { useMemo } from 'react';

import dayjs, { Dayjs } from 'dayjs';

import { OfficesIdsByEmployeeResponse } from '@/dto/DtoEmployeesService';
import { timetableStore } from '@/stores/timetable.store';

type UseModalCreateDatePeriodParams = {
  date: Dayjs | null;
  error?: string;
};

const getWorkingDay = (officeTimetable: OfficesIdsByEmployeeResponse[], dayOfWeek: number) => {
  const selectedOfficeId = timetableStore.selectedOffice?.id;
  const selectedOffice = officeTimetable.find((office) => office.id === selectedOfficeId);
  if (!selectedOffice?.workingHours) return null;
  return selectedOffice.workingHours.find((workSchedule) => workSchedule.dayOfWeek === dayOfWeek) ?? null;
};

export const useModalCreateSubsititutionDatePeriod = ({ date }: UseModalCreateDatePeriodParams) => {
  const { officeTimetable } = timetableStore;

  return useMemo(() => {
    if (!officeTimetable) {
      return { datePickerConfig: {}, timePickerConfig: {} };
    }
    const now = dayjs();

    const datePickerConfig = {
      shouldDisableDate: (d: Dayjs) => {
        const workingDay = getWorkingDay(officeTimetable, d.day());
        return !workingDay;
      },
      disablePast: true
    };

    if (!date) {
      return { datePickerConfig, timePickerConfig: {} };
    }
    const workingDay = getWorkingDay(officeTimetable, date.day());
    if (!workingDay) {
      return {
        datePickerConfig,
        timePickerConfig: { shouldDisableTime: () => true }
      };
    }

    const [startHour, startMinute] = workingDay.startsOn.split(':').map(Number);
    const [endHour, endMinute] = workingDay.endsOn.split(':').map(Number);

    const isToday = date.isSame(now, 'day');
    const minMinutes = startHour * 60 + startMinute;
    const maxMinutes = endHour * 60 + endMinute;

    const officeMinTime = dayjs().hour(startHour).minute(startMinute).second(0);
    const officeMaxTime = dayjs().hour(endHour).minute(endMinute).second(0);

    const timePickerConfig = {
      minTime: isToday && now.isAfter(officeMinTime) ? now : officeMinTime,
      maxTime: officeMaxTime,
      shouldDisableTime: (value: Dayjs) => {
        if (!value) return false;
        const valueMinutes = value.hour() * 60 + value.minute();
        if (isToday && value.isBefore(now)) return true;
        return valueMinutes < minMinutes || valueMinutes > maxMinutes;
      }
    };

    return { datePickerConfig, timePickerConfig };
  }, [date, officeTimetable]);
};
