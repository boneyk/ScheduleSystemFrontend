import axios from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';

import { baseLayoutStore } from './baseLayout.store';
import { getTimesheet, getTimesheetByRegion, saveWorktimes } from '@/api/shedule_service';
import { buildWorktimeItems, mapTimesheetGroups } from '@/lib/timesheet';

export type TimesheetRow = {
  employeeId: number;
  name: string;
  position: string;
  days: number[];
  isDraftDays: boolean[];
  dayTypes: ('work' | 'absence' | 'empty')[];
  dayOfficeIds: (number | null)[];
  absenceCodes: (string | null)[];
  normMinutes: number;
};

export class TimesheetStore {
  month = new Date().getMonth();
  year = new Date().getFullYear();
  isLoading = false;
  isSaving = false;
  officeId: number | null = null;
  regionId: number | null = null;
  isSubGroup = false;
  rows: TimesheetRow[] = [];
  originalRows: TimesheetRow[] = [];
  changedCells: Set<string> = new Set();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get hasChanges() {
    return this.changedCells.size > 0;
  }

  get hasDraftDays() {
    return this.rows.some((row) =>
      row.isDraftDays.some((isDraft, idx) => isDraft && row.dayTypes[idx] === 'work' && (row.days[idx] ?? 0) > 0)
    );
  }

  get canSave() {
    return this.hasChanges || this.hasDraftDays;
  }

  get isPastMonth() {
    const now = new Date();
    return this.year < now.getFullYear() || (this.year === now.getFullYear() && this.month < now.getMonth());
  }

  setOfficeId(id: number) {
    this.officeId = id;
  }

  setRegionId(id: number) {
    this.regionId = id;
  }

  setIsSubGroup(value: boolean) {
    this.isSubGroup = value;
  }

  async fetchData() {
    if (this.isSubGroup) {
      if (this.regionId === null) return;
    } else {
      if (this.officeId === null) return;
    }
    runInAction(() => {
      this.isLoading = true;
      this.rows = [];
      this.originalRows = [];
      this.changedCells = new Set();
    });
    try {
      const regionId = this.regionId ?? 0;
      const officeId = this.officeId ?? 0;
      const res = this.isSubGroup
        ? await getTimesheetByRegion(regionId, this.year, this.month + 1)
        : await getTimesheet(officeId, this.year, this.month + 1);
      runInAction(() => {
        const rows = mapTimesheetGroups(res.data.data);
        this.rows = rows;
        this.originalRows = rows.map((r) => ({
          ...r,
          days: [...r.days],
          isDraftDays: [...r.isDraftDays],
          dayTypes: [...r.dayTypes],
          dayOfficeIds: [...r.dayOfficeIds],
          absenceCodes: [...r.absenceCodes]
        }));
        this.changedCells = new Set();
        this.isLoading = false;
      });
    } catch (error) {
      let message = 'Не удалось загрузить табель';
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 403) message = 'Недостаточно прав';
        else if (status === 400)
          message = error.response?.data?.detail ?? error.response?.data?.message ?? 'Неверные данные запроса';
        else if (status && status >= 500) message = 'Ошибка загрузки данных';
      }
      baseLayoutStore.showWarning(message);
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async saveData() {
    runInAction(() => {
      this.isSaving = true;
    });
    try {
      const items = buildWorktimeItems(this.changedCells, this.rows, this.year, this.month, this.officeId);
      if (items.length > 0) await saveWorktimes(items);
      await this.fetchData();
    } catch (error) {
      let message = 'Ошибка сохранения данных';
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 403) message = 'Недостаточно прав';
        else if (status === 400)
          message = error.response?.data?.detail ?? error.response?.data?.message ?? 'Неверные данные запроса';
        else if (status && status >= 500) message = 'Ошибка сохранения данных';
      }
      baseLayoutStore.showWarning(message);
    } finally {
      runInAction(() => {
        this.isSaving = false;
      });
    }
  }

  resetChanges() {
    this.rows = this.originalRows.map((r) => ({
      ...r,
      days: [...r.days],
      isDraftDays: [...r.isDraftDays],
      dayTypes: [...r.dayTypes],
      dayOfficeIds: [...r.dayOfficeIds],
      absenceCodes: [...r.absenceCodes]
    }));
    this.changedCells = new Set();
  }

  get daysInMonth() {
    return new Date(this.year, this.month + 1, 0).getDate();
  }

  getTotalMinutes(rowIdx: number): number {
    return this.rows[rowIdx]?.days.slice(0, this.daysInMonth).reduce((sum, d) => sum + d, 0) ?? 0;
  }

  getNormMinutes(rowIdx: number): number {
    return this.rows[rowIdx]?.normMinutes ?? 0;
  }

  changeMonth(month: number) {
    this.month = month;
  }

  incMonth() {
    if (this.month === 11) {
      this.month = 0;
      this.year += 1;
    } else {
      this.month += 1;
    }
  }

  decMonth() {
    if (this.month === 0) {
      this.month = 11;
      this.year -= 1;
    } else {
      this.month -= 1;
    }
  }

  incYear() {
    this.year += 1;
  }

  decYear() {
    this.year -= 1;
  }

  setDayValue(rowIdx: number, dayIdx: number, value: number) {
    const key = `${rowIdx}-${dayIdx}`;
    const original = this.originalRows[rowIdx]?.days[dayIdx] ?? 0;
    if (value === original) {
      this.changedCells.delete(key);
    } else {
      this.changedCells.add(key);
    }
    this.rows[rowIdx].days[dayIdx] = value;
  }
}

export const timesheetStore = new TimesheetStore();
