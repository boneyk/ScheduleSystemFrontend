import dayjs, { Dayjs } from 'dayjs';
import { CreateShiftDto, EditShiftRequest } from 'dto/DtoSchedule';
import { makeAutoObservable } from 'mobx';

import customParseFormat from 'dayjs/plugin/customParseFormat';

import type { ShiftModalData } from '@/hooks/useViewModal';
import { Formats } from 'utils/formats';

import { timetableStore } from './timetable.store';
import { ModalCreateMode } from '@/types/schedule';

dayjs.extend(customParseFormat);

export interface ShiftPreset {
  id: number;
  label: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

interface ShiftPresetDto {
  id: number;
  startTime: string;
  endTime: string;
}

const shiftPresetsMock: ShiftPresetDto[] = [
  { id: 1, startTime: '09:00', endTime: '18:00' },
  { id: 2, startTime: '10:00', endTime: '19:00' },
  { id: 3, startTime: '09:00', endTime: '19:00' }
];

export class ModalCreateStore {
  startOn: Dayjs | null = null;
  endOn: Dayjs | null = null;
  startAt: Dayjs | null = null;
  endAt: Dayjs | null = null;
  selectedPresetId: number | null = null;
  presets: ShiftPreset[] = [];
  shiftId: number | null = null;
  isOpen: boolean = false;
  mode: ModalCreateMode = 'shift';
  editMode: 'single' | 'period' = 'single';
  shiftDates: Dayjs[] = [];
  shiftData: ShiftModalData | null = null;

  constructor() {
    makeAutoObservable(this);
    this.presets = shiftPresetsMock.map(this.mapShiftPresetDtoToModel);
    this._applyFirstPresetTime();
  }

  private _applyFirstPresetTime = () => {
    const first = this.presets[0];
    if (!first) return;
    const base = dayjs();
    this.startAt = base.hour(first.startHour).minute(first.startMinute).second(0);
    this.endAt = base.hour(first.endHour).minute(first.endMinute).second(0);
  };

  open = (mode: ModalCreateMode = 'shift') => {
    this.mode = mode;
    this.isOpen = true;
  };

  close = () => {
    this.isOpen = false;
  };

  resetAll = () => {
    this.mode = 'shift';
    this.reset();
  };

  setShiftData = (data: ShiftModalData | null) => {
    this.shiftData = data;
  };

  private parseTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return { hour, minute };
  };

  private mapShiftPresetDtoToModel = (dto: ShiftPresetDto): ShiftPreset => {
    const start = this.parseTime(dto.startTime);
    const end = this.parseTime(dto.endTime);
    return {
      id: dto.id,
      label: `${dto.startTime} – ${dto.endTime}`,
      startHour: start.hour,
      startMinute: start.minute,
      endHour: end.hour,
      endMinute: end.minute
    };
  };

  setStartDate = (date: Dayjs | null) => {
    this.startOn = date;
  };
  setEndDate = (date: Dayjs | null) => {
    this.endOn = date;
  };
  setShiftId = (id: number) => {
    this.shiftId = id;
  };

  setEditMode = (mode: 'single' | 'period') => {
    this.editMode = mode;
  };

  setShiftStartTime = (startAt: Dayjs | null) => {
    this.startAt = startAt;
  };
  setShiftEndTime = (endAt: Dayjs | null) => {
    this.endAt = endAt;
  };

  setShiftDates = (startOn: string, endOn: string) => {
    const start = dayjs(startOn, Formats.DATE_SHORT).startOf('day');
    const end = dayjs(endOn, Formats.DATE_SHORT).startOf('day');

    if (!start.isValid() || !end.isValid()) {
      this.shiftDates = [];
      return;
    }

    const dates: Dayjs[] = [];
    let current = start;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current);
      current = current.add(1, 'day');
    }
    this.shiftDates = dates;
  };

  selectShiftDate = (date: Dayjs) => {
    const preset = this.presets.find((p) => p.id === this.selectedPresetId);
    if (preset) {
      this.startOn = date.hour(preset.startHour).minute(preset.startMinute).second(0);
      this.endOn = date.hour(preset.endHour).minute(preset.endMinute).second(0);
    } else {
      this.startOn = date;
      this.endOn = date;
    }
  };

  selectPreset = (presetId: number | null) => {
    this.selectedPresetId = presetId;
    const preset = this.presets.find((p) => p.id === presetId) || null;
    if (!preset) {
      return;
    }
    const currentDate1 = this.startOn || dayjs();
    const currentDate2 = this.endOn || dayjs();

    this.startAt = currentDate1.hour(preset.startHour).minute(preset.startMinute).second(0);
    this.endAt = currentDate2.hour(preset.endHour).minute(preset.endMinute).second(0);
  };
  reset = () => {
    this.selectedPresetId = null;
    this.startOn = null;
    this.endOn = null;
    this.shiftDates = [];
    this.editMode = 'single';
    this._applyFirstPresetTime();
  };

  get shiftIdsForPeriod(): number[] {
    const { startOn, endOn } = this;
    if (!startOn || !endOn) return [];

    const employee = timetableStore.selectedEmployee;
    const role = timetableStore.selectedRole;
    if (!employee || !role) return [];

    const employees = timetableStore.shifts[role];
    if (!employees) return [];

    const emp = employees.find((e) => e.id === employee.id);
    if (!emp) return [];

    return emp.shifts
      .filter((shift) => {
        const shiftDate = dayjs(shift.scheduledOn);
        return (
          (shiftDate.isSame(startOn, 'day') || shiftDate.isAfter(startOn, 'day')) &&
          (shiftDate.isSame(endOn, 'day') || shiftDate.isBefore(endOn, 'day'))
        );
      })
      .map((shift) => shift.id);
  }

  get shiftIdsForSingle(): { date: Dayjs; id: number }[] {
    const employee = timetableStore.selectedEmployee;
    const role = timetableStore.selectedRole;
    if (!employee || !role) return [];
    const employees = timetableStore.shifts[role];
    if (!employees) return [];
    const emp = employees.find((e) => e.id === employee.id);
    if (!emp) return [];

    const periodStart = dayjs(this.shiftData?.startOn, Formats.DATE_SHORT).startOf('day');
    const periodEnd = dayjs(this.shiftData?.endOn, Formats.DATE_SHORT).startOf('day');
    if (!periodStart.isValid() || !periodEnd.isValid()) return [];

    return emp.shifts
      .filter((shift) => {
        const shiftDate = dayjs(shift.scheduledOn);
        return (
          (shiftDate.isSame(periodStart, 'day') || shiftDate.isAfter(periodStart, 'day')) &&
          (shiftDate.isSame(periodEnd, 'day') || shiftDate.isBefore(periodEnd, 'day'))
        );
      })
      .map((shift) => ({ date: dayjs(shift.scheduledOn), id: shift.id }));
  }

  get errors() {
    const result: {
      startOn?: string;
      endOn?: string;
      startAt?: string;
      endAt?: string;
    } = {};
    const { startOn, endOn, startAt, endAt } = this;
    const { officeTimetable } = timetableStore;
    const selectedOfficeId = timetableStore.selectedOffice?.id;

    if (!startOn) result.startOn = 'Дата начала обязательна';
    if (!endOn) result.endOn = 'Дата окончания обязательна';
    if (!startAt) result.startAt = 'Время начала обязательно';
    if (!endAt) result.endAt = 'Время окончания обязательно';

    if (!startOn || !endOn || !startAt || !endAt) return result;

    const startDateTime = startOn.hour(startAt.hour()).minute(startAt.minute()).second(0);
    const endDateTime = endOn.hour(endAt.hour()).minute(endAt.minute()).second(0);
    const selectedOffice = officeTimetable?.find((office) => office.id === selectedOfficeId);

    if (!selectedOffice || !selectedOffice.workingHours) {
      result.startOn = 'Не удалось получить график работы офиса';
      result.endOn = 'Не удалось получить график работы офиса';
      return result;
    }

    const startWorkingDay = selectedOffice.workingHours.find((wh) => wh.dayOfWeek === startDateTime.day());
    if (!startWorkingDay) {
      result.startOn = 'Офис не работает в этот день';
    } else {
      const [startHour, startMinute] = startWorkingDay.startsOn.split(':').map(Number);
      const [endHour, endMinute] = startWorkingDay.endsOn.split(':').map(Number);
      const minTime = startOn.hour(startHour).minute(startMinute).second(0);
      const maxTime = startOn.hour(endHour).minute(endMinute).second(0);
      if (startDateTime.isBefore(minTime) || startDateTime.isAfter(maxTime)) {
        result.startAt = 'Время начала смены смены выходит за рамки работы офиса';
      }
    }

    const endWorkingDay = selectedOffice.workingHours.find((wh) => wh.dayOfWeek === endDateTime.day());
    if (!endWorkingDay) {
      result.endOn = 'Офис не работает в этот день';
    } else {
      const [startHour, startMinute] = endWorkingDay.startsOn.split(':').map(Number);
      const [endHour, endMinute] = endWorkingDay.endsOn.split(':').map(Number);
      const minTime = endOn.hour(startHour).minute(startMinute);
      const maxTime = endOn.hour(endHour).minute(endMinute);

      if (endDateTime.isBefore(minTime) || endDateTime.isAfter(maxTime)) {
        result.endAt = 'Время окончания смены выходит за рамки работы офиса';
      }
    }

    const now = dayjs();
    const today = now.startOf('day');

    if (this.mode !== 'edit' && startDateTime.isBefore(today)) {
      result.startOn = 'Дата начала не может быть в прошлом';
    }
    if (this.mode !== 'edit' && endDateTime.isBefore(today)) {
      result.endOn = 'Дата окончания не может быть в прошлом';
    }
    const twoMonthsLater = now.add(2, 'month').endOf('day');
    if (startDateTime.isAfter(twoMonthsLater)) {
      result.startOn = 'Нельзя поставить смену позже 2 месяцев от текущей даты';
    }
    if (endDateTime.isAfter(twoMonthsLater)) {
      result.endOn = 'Нельзя поставить смену позже 2 месяцев от текущей даты';
    }
    if (this.mode !== 'edit' && startDateTime.isSame(today, 'day') && startDateTime.isBefore(now)) {
      result.startAt = 'Время начала не может быть в прошлом';
    }

    if (startDateTime.isAfter(endDateTime)) {
      result.startOn = 'Дата начала не может быть позже даты конца';
      result.endOn = 'Дата окончания не может быть раньше даты начала';
    }
    if (startDateTime.isSame(endDateTime)) {
      result.startAt = 'Время начала и окончания не могут совпадать';
      result.endAt = 'Время начала и окончания не могут совпадать';
    }
    return result;
  }

  get isValid() {
    return Object.keys(this.errors).length === 0;
  }

  get createShiftDto(): CreateShiftDto | null {
    const { startOn, endOn, startAt, endAt } = this;
    const employee = timetableStore.selectedEmployee;
    const office = timetableStore.selectedOffice;
    if (!this.isValid || !employee || !startOn || !endOn || !office || !startAt || !endAt) return null;

    return {
      employeeId: employee.id,
      officeId: office.id,
      startOn: startOn.format(Formats.DATE_API),
      endOn: endOn.format(Formats.DATE_API),
      startAt: startAt.format(Formats.TIME_API),
      endAt: endAt.format(Formats.TIME_API)
    };
  }

  get editShiftDto(): EditShiftRequest | null {
    const { startOn, endOn, startAt, endAt } = this;
    if (!startOn || !endOn || !startAt || !endAt) return null;
    return {
      startAt: startAt.format(Formats.TIME_API),
      endAt: endAt.format(Formats.TIME_API)
    };
  }
}
export const modalCreateStore = new ModalCreateStore();
