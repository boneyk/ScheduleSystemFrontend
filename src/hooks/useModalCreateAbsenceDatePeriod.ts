import { useMemo } from 'react';

import { Dayjs } from 'dayjs';

import { timetableStore } from '@/stores/timetable.store';

export const useOfficeDatePicker = (error?: string) => {
  const { officeTimetable } = timetableStore;

  return useMemo(() => {
    if (!officeTimetable) {
      return { disablePast: true };
    }

    const selectedOfficeId = timetableStore.selectedOffice?.id;
    const selectedOffice = officeTimetable.find((office) => office.id === selectedOfficeId);

    return {
      disablePast: true,
      shouldDisableDate: (d: Dayjs) => {
        if (!selectedOffice?.workingHours) return true;
        return !selectedOffice.workingHours.some((wh) => wh.dayOfWeek === d.day());
      },
      slotProps: {
        textField: {
          error: !!error
        }
      }
    };
  }, [officeTimetable, error]);
};
