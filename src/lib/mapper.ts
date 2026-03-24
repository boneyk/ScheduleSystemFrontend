import dayjs from 'dayjs';

import { ShiftsResponse } from '@/dto/DtoSchedule';

export const getFutureShiftIds = (dataNew: ShiftsResponse[]): number[] => {
  const futureShiftIds: number[] = [];
  dataNew.forEach((employeeBlock) => {
    employeeBlock.shifts.forEach((shift) => {
      if (dayjs(shift.scheduledOn).isSameOrAfter(dayjs(), 'day')) {
        futureShiftIds.push(shift.id);
      }
    });
  });
  return futureShiftIds;
};
