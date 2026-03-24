import { useMemo } from 'react';

import dayjs from 'dayjs';
import { timetableStore } from 'stores/timetable.store';

import { isUserAdmin, isUserManager } from '@/utils/auth';
import { Formats } from '@/utils/formats';

import { buildShiftsWorkerList } from '@/lib/schedule';
import { modalCreateStore } from '@/stores/modalCreate.store';
import { modalCreateSubstitutionGroupCreateShift } from '@/stores/modalCreateSubstitutionGroupCreateShift.store';
import { modalViewStore } from '@/stores/modalView.store';
import type { ShiftType } from '@/types/schedule';

interface UseWorkerRowModalParams {
  role: string;
  employeeId: number;
  days: number[];
  daysInMonth: number;
  year: number;
  month: number;
}

export const useCellClick = ({ role, employeeId, days, daysInMonth, year, month }: UseWorkerRowModalParams) => {
  const workerData = timetableStore.shifts[role]?.[employeeId];
  const daysShiftsList = useMemo(() => {
    return buildShiftsWorkerList(timetableStore.year, timetableStore.month, daysInMonth, workerData);
  }, [daysInMonth, workerData]);
  const getCellDate = (dayIndex: number) => dayjs(new Date(year, month, days[dayIndex] + 1));
  const isPastDate = (dayIndex: number) => getCellDate(dayIndex).isBefore(dayjs(), 'day');
  const hasShift = (dayIndex: number) => daysShiftsList[dayIndex + 1] !== null;
  const getDaysToIndex = (dayIndex: number) => getCellDate(dayIndex).day();

  const isSubstitutionEmployee = !!workerData?.substitutionGroup;

  const isUnattachedEmployee = !workerData?.attachedToOffice;
  const canAddShiftAdmin = (dayIndex: number) =>
    isUserAdmin() &&
    !isSubstitutionEmployee &&
    !isUnattachedEmployee &&
    !hasShift(dayIndex) &&
    !isPastDate(dayIndex) &&
    !!isOfficeWorkingDay(dayIndex);
  const canAddShiftManager = (dayIndex: number) => isUserManager() && !hasShift(dayIndex) && !isPastDate(dayIndex);
  const isOfficeWorkingDay = (dayIndex: number) => {
    const officeTimetable = timetableStore.officeTimetable;
    const selectedOfficeId = timetableStore.selectedOffice?.id;
    if (!officeTimetable || !officeTimetable.length) return false;
    const backendDay = getDaysToIndex(dayIndex);
    const selectedOffice = officeTimetable.find((office) => office.id === selectedOfficeId);
    if (!selectedOffice || !selectedOffice.workingHours) return false;
    const workingDay = selectedOffice.workingHours.find((wh) => wh.dayOfWeek === backendDay);
    return workingDay;
  };

  const getShiftByDayIndex = (dayIndex: number) => {
    const date = getCellDate(dayIndex).format(Formats.DATE_API);
    const shift = workerData.shifts.find((shift) => shift.scheduledOn === date);
    if (shift) return shift;
    return workerData.absences?.find((absence) => absence.absentOn === date);
  };

  const openViewModalForShift = (dayIndex: number) => {
    const shift = getShiftByDayIndex(dayIndex);
    if (!shift) return;
    const info = daysShiftsList[dayIndex + 1];
    if (!info) return;
    modalViewStore.open({
      id: shift.id,
      employeeId: workerData.id,
      fullname: workerData.fullName,
      job: role,
      dayIndex,
      type: info.type as ShiftType,
      text: info.title,
      startOn: info.blockStartDate,
      endOn: info.blockEndDate,
      substitutionGroup: workerData.substitutionGroup,
      attachedToOffice: workerData.attachedToOffice,
      office: 'office' in shift ? shift.office : null,
      isCombined: info?.isCombined,
      shiftsForCombined: info?.isCombined ? info?.shiftsForCombined : null
    });
  };

  const openCreateModal = (dayIndex: number) => {
    timetableStore.initRoleAndEmployee(role, {
      id: workerData.id,
      name: workerData.fullName
    });

    const cellDate = getCellDate(dayIndex);
    modalCreateStore.setStartDate(cellDate);
    modalCreateStore.setEndDate(cellDate);
    modalCreateStore.selectPreset(1);
    modalCreateStore.open('shift');
  };
  const openSubstitutionCreateModal = (dayIndex: number) => {
    modalCreateSubstitutionGroupCreateShift.setSelectedRole(role);
    modalCreateSubstitutionGroupCreateShift.setSelectedEmployee({
      id: workerData.id,
      name: workerData.fullName
    });
    const cellDate = getCellDate(dayIndex);
    modalCreateSubstitutionGroupCreateShift.setStartDate(cellDate.hour(0).minute(0));
    modalCreateSubstitutionGroupCreateShift.setEndDate(cellDate.hour(0).minute(0));
    modalCreateSubstitutionGroupCreateShift.open();
  };
  const handleCellClick = (dayIndex: number) => {
    if (hasShift(dayIndex)) {
      openViewModalForShift(dayIndex);
      return;
    }
    if (isUserAdmin()) {
      if (isSubstitutionEmployee || isUnattachedEmployee) return;
      if (isPastDate(dayIndex) || !isOfficeWorkingDay(dayIndex)) return;
      openCreateModal(dayIndex);
      return;
    }

    if (isUserManager()) {
      if (isPastDate(dayIndex)) return;
      openSubstitutionCreateModal(dayIndex);
      return;
    }
  };

  return {
    daysShiftsList,
    handleCellClick,
    canAddShiftAdmin,
    canAddShiftManager,
    isOfficeWorkingDay,
    isSubstitutionEmployee,
    isUnattachedEmployee
  };
};
