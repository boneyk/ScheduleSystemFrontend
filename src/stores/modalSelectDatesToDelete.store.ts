import dayjs, { Dayjs } from 'dayjs';
import { makeAutoObservable } from 'mobx';

import type { ShiftModalData } from '@/hooks/useViewModal';
import { Formats } from '@/utils/formats';

import { timetableStore } from './timetable.store';

export interface shiftsWithIds {
  id: number;
  date: Dayjs;
}

export class ModalSelectDatesToDeleteStore {
  isOpen: boolean = false;
  shiftData: ShiftModalData | null = null;
  deleteMode: 'single' | 'period' = 'single';
  startOn: Dayjs | null = null;
  endOn: Dayjs | null = null;
  shiftDates: shiftsWithIds[] = [];
  shiftId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  open = (shiftData: ShiftModalData, shiftDates: shiftsWithIds[]) => {
    this.shiftData = shiftData;
    this.shiftDates = shiftDates;
    this.deleteMode = 'single';
    const clicked = this.shiftIdsForSingle.find((s) => s.id === shiftData.id);
    this.startOn = clicked?.date ?? shiftDates[0].date;
    this.endOn = clicked?.date ?? shiftDates[0].date;
    this.shiftId = clicked?.id ?? shiftDates[0].id;
    this.isOpen = true;
  };

  close = () => {
    this.isOpen = false;
  };

  get shiftIdsForSingle(): { date: Dayjs; id: number }[] {
    if (!this.shiftData) return [];
    const { job, employeeId, type, startOn, endOn } = this.shiftData;
    const workerData = timetableStore.shifts[job]?.find((emp) => emp.id === employeeId);
    if (!workerData) return [];
    const periodStart = dayjs(startOn, Formats.DATE_SHORT).startOf('day');
    const periodEnd = dayjs(endOn, Formats.DATE_SHORT).startOf('day');
    if (!periodStart.isValid() || !periodEnd.isValid()) return [];

    const source = type === 'work' ? workerData.shifts : (workerData.absences ?? []);
    return source
      .filter((s) => {
        const dateStr = 'scheduledOn' in s ? s.scheduledOn : s.absentOn;
        const date = dayjs(dateStr).startOf('day');
        return (
          (date.isSame(periodStart, 'day') || date.isAfter(periodStart, 'day')) &&
          (date.isSame(periodEnd, 'day') || date.isBefore(periodEnd, 'day'))
        );
      })
      .map((s) => ({
        id: s.id,
        date: dayjs('scheduledOn' in s ? s.scheduledOn : s.absentOn)
      }));
  }

  reset = () => {
    this.shiftData = null;
    this.deleteMode = 'single';
    this.startOn = null;
    this.endOn = null;
    this.shiftDates = [];
    this.shiftId = null;
  };

  setDeleteMode = (mode: 'single' | 'period') => {
    this.deleteMode = mode;
    if (mode === 'period' && this.shiftDates.length > 0) {
      this.startOn = this.shiftDates[0].date;
      this.endOn = this.shiftDates[this.shiftDates.length - 1].date;
    }
  };

  setStartDate = (date: Dayjs | null) => {
    this.startOn = date;
  };

  setEndDate = (date: Dayjs | null) => {
    this.endOn = date;
  };
  setShiftId = (id: number | null) => {
    this.shiftId = id;
  };
}

export const modalSelectDatesToDeleteStore = new ModalSelectDatesToDeleteStore();
