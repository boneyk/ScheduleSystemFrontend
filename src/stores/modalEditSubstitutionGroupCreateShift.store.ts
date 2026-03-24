import dayjs, { Dayjs } from 'dayjs';
import { makeAutoObservable } from 'mobx';

import { ShiftModalData } from '@/hooks/useViewModal';
import { isUserManager } from '@/utils/auth';
import { Formats } from '@/utils/formats';

import { timetableStore } from './timetable.store';
import { Cities } from '@/dto/DtoCatalog';
import { EmployeeEntityResponse } from '@/dto/DtoEmployeesService';
import { Office, WorkingHoursDto } from '@/dto/DtoOffice';
import { EditShiftRequest } from '@/dto/DtoSchedule';

class ModalEditSubstitutionGroupStore {
  isOpen = false;
  startOn: Dayjs | null = null;
  endOn: Dayjs | null = null;
  startAt: Dayjs | null = null;
  endAt: Dayjs | null = null;
  cities: Cities[] | null = null;
  selectedCityId: number | null = null;
  selectedCityName: string | null = null;
  officesByCity: Office[] | null = null;
  selectedOffice: { id: number; name: string } | null = null;
  workingHoursBySelectedOffice: WorkingHoursDto[] | null = null;
  employees: EmployeeEntityResponse | null = null;
  selectedRole: string | null = null;
  shiftDates: Dayjs[] = [];
  editMode: 'single' | 'period' = 'single';
  selectedEmployee: {
    id: number;
    name: string;
  } | null = null;
  shiftId: number | null = null;
  shiftData: ShiftModalData | null = null;

  constructor() {
    makeAutoObservable(this);
  }
  setShiftId(id: number | null) {
    this.shiftId = id;
  }
  setStartDate(date: Dayjs | null) {
    this.startOn = date;
  }
  setEditMode(mode: 'single' | 'period') {
    this.editMode = mode;
  }
  setShiftDates(startOn: string, endOn: string) {
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
  }

  setEndDate(date: Dayjs | null) {
    this.endOn = date;
  }
  setShiftStartTime(startAt: Dayjs | null) {
    this.startAt = startAt;
  }
  setShiftEndTime(endAt: Dayjs | null) {
    this.endAt = endAt;
  }
  setCities(cities: Cities[]) {
    this.cities = cities;
  }
  setSelectedCityId(cityId: number) {
    this.selectedCityId = cityId;
  }
  setOfficesByCity(offices: Office[]) {
    this.officesByCity = offices;
  }
  setSelectedOffice(office: { id: number; name: string } | null) {
    this.selectedOffice = office;
  }
  setWorkingHours(hours: WorkingHoursDto[] | null) {
    this.workingHoursBySelectedOffice = hours;
  }
  setEmployees(employeeData: EmployeeEntityResponse) {
    this.employees = employeeData;
  }
  setSelectedRole(role: string | null) {
    this.selectedRole = role;
  }
  setShiftData(data: ShiftModalData | null) {
    this.shiftData = data;
  }
  setSelectedEmployee(
    employee: {
      id: number;
      name: string;
    } | null
  ) {
    this.selectedEmployee = employee;
  }

  selectShiftDate(date: Dayjs) {
    this.startOn = date;
    this.endOn = date;
  }
  open = () => {
    this.isOpen = true;
  };

  get errors() {
    const result: {
      startOn?: string;
      endOn?: string;
      startAt?: string;
      endAt?: string;
    } = {};
    const { startOn, endOn, startAt, endAt, workingHoursBySelectedOffice } = this;
    if (!startOn) result.startOn = 'Дата начала обязательна';
    if (!endOn) result.endOn = 'Дата окончания обязательна';
    if (!startAt) result.startAt = 'Время начала обязательно';
    if (!endAt) result.endAt = 'Время окончания обязательно';
    if (!startOn || !endOn || !startAt || !endAt) return result;

    const startDateTime = startOn.hour(startAt.hour()).minute(startAt.minute()).second(0);
    const endDateTime = endOn.hour(endAt.hour()).minute(endAt.minute()).second(0);
    const now = dayjs();
    const today = now.startOf('day');
    if (startOn.isBefore(today) && !isUserManager()) {
      result.startOn = 'Дата начала не может быть в прошлом';
    }
    if (endOn.isBefore(today) && !isUserManager()) {
      result.endOn = 'Дата окончания не может быть в прошлом';
    }
    const twoMonthsLater = now.add(2, 'month').endOf('day');
    if (startDateTime.isAfter(twoMonthsLater)) {
      result.startOn = 'Нельзя поставить смену позже 2 месяцев от текущей даты';
    }
    if (endDateTime.isAfter(twoMonthsLater)) {
      result.endOn = 'Нельзя поставить смену позже 2 месяцев от текущей даты';
    }
    if (startOn.isSame(today, 'day') && startDateTime.isBefore(now) && !isUserManager()) {
      result.startAt = 'Время начала не может быть в прошлом';
    }
    if (endOn.isSame(today, 'day') && endDateTime.isBefore(now) && !isUserManager()) {
      result.endAt = 'Время окончания не может быть в прошлом';
    }
    if (workingHoursBySelectedOffice && !isUserManager()) {
      const startWorkingDay = workingHoursBySelectedOffice.find((wh) => wh.dayOfWeek === startDateTime.day());
      if (!startWorkingDay) {
        result.startOn = 'Офис не работает в этот день недели';
      } else {
        const [startHour, startMinute] = startWorkingDay.startsOn.split(':').map(Number);
        const [endHour, endMinute] = startWorkingDay.endsOn.split(':').map(Number);
        const minTime = startOn.hour(startHour).minute(startMinute).second(0);
        const maxTime = startOn.hour(endHour).minute(endMinute).second(0);
        if (startDateTime.isBefore(minTime) || startDateTime.isAfter(maxTime)) {
          result.startAt = `Время начала должно быть в пределах расписания офиса: ${startWorkingDay.startsOn.slice(0, 5)} - ${startWorkingDay.endsOn.slice(0, 5)}`;
        }
      }

      const endWorkingDay = workingHoursBySelectedOffice.find((wh) => wh.dayOfWeek === endDateTime.day());
      if (!endWorkingDay) {
        result.endOn = 'Офис не работает в этот день недели';
      } else {
        const [startHour, startMinute] = endWorkingDay.startsOn.split(':').map(Number);
        const [endHour, endMinute] = endWorkingDay.endsOn.split(':').map(Number);
        const minTime = endOn.hour(startHour).minute(startMinute).second(0);
        const maxTime = endOn.hour(endHour).minute(endMinute).second(0);
        if (endDateTime.isBefore(minTime) || endDateTime.isAfter(maxTime)) {
          result.endAt = `Время окончания должно быть в пределах расписания офиса: ${endWorkingDay.startsOn.slice(0, 5)} - ${endWorkingDay.endsOn.slice(0, 5)}`;
        }
      }
    }

    if (startDateTime.isAfter(endDateTime)) {
      result.startAt = 'Время начала не может быть позже времени окончания';
      result.endAt = 'Время окончания не может быть раньше времени начала';
    }
    if (startDateTime.isSame(endDateTime)) {
      result.startAt = 'Время начала и окончания не могут совпадать';
      result.endAt = 'Время начала и окончания не могут совпадать';
    }
    return result;
  }

  close = () => {
    this.isOpen = false;
  };

  get shiftIdsForSingle(): { date: Dayjs; id: number }[] {
    const employee = this.selectedEmployee;
    const role = this.selectedRole;
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

  get shiftIdsForPeriod(): number[] {
    const { startOn, endOn } = this;
    if (!startOn || !endOn) return [];

    const employee = this.selectedEmployee;
    const role = this.selectedRole;
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

  get editShiftDto(): EditShiftRequest | null {
    const { startOn, endOn, startAt, endAt } = this;
    if (!startOn || !endOn || !startAt || !endAt) return null;
    return {
      startAt: startAt.format(Formats.TIME_API),
      endAt: endAt.format(Formats.TIME_API)
    };
  }

  reset = () => {
    this.endAt = null;
    this.endOn = null;
    this.startAt = null;
    this.startOn = null;
    this.selectedCityId = null;
    this.selectedOffice = null;
    this.selectedEmployee = null;
    this.selectedRole = null;
    this.editMode = 'single';
  };
}

export const modalEditSubstitutionGroupStore = new ModalEditSubstitutionGroupStore();
