import dayjs, { Dayjs } from 'dayjs';
import { makeAutoObservable } from 'mobx';

import { Formats } from '@/utils/formats';

import { Cities } from '@/dto/DtoCatalog';
import { EmployeeEntityResponse } from '@/dto/DtoEmployeesService';
import { Office, WorkingHoursDto } from '@/dto/DtoOffice';
import { CreateShiftDto } from '@/dto/DtoSchedule';

class ModalCreateSubstitutionGroupCreateShiftStore {
  isOpen = false;
  startOn: Dayjs | null = null;
  endOn: Dayjs | null = null;
  startAt: Dayjs | null = null;
  endAt: Dayjs | null = null;
  cities: Cities[] | null = null;
  selectedCityId: number | null = null;
  officesByCity: Office[] | null = null;
  selectedOffice: { id: number; name: string } | null = null;
  workingHoursBySelectedOffice: WorkingHoursDto[] | null = null;
  employees: EmployeeEntityResponse | null = null;
  selectedRole: string | null = null;
  selectedEmployee: {
    id: number;
    name: string;
  } | null = null;

  constructor() {
    makeAutoObservable(this);
  }
  setStartDate = (date: Dayjs | null) => {
    this.startOn = date;
  };
  setEndDate = (date: Dayjs | null) => {
    this.endOn = date;
  };
  setShiftStartTime = (startAt: Dayjs | null) => {
    this.startAt = startAt;
  };
  setShiftEndTime = (endAt: Dayjs | null) => {
    this.endAt = endAt;
  };
  setCities = (cities: Cities[]) => {
    this.cities = cities;
  };
  setSelectedCityId = (cityId: number) => {
    this.selectedCityId = cityId;
  };
  setOfficesByCity = (offices: Office[] | null) => {
    this.officesByCity = offices;
  };
  setSelectedOffice = (office: { id: number; name: string } | null) => {
    this.selectedOffice = office;
    if (!office) {
      this.workingHoursBySelectedOffice = null;
      this.startAt = null;
      this.endAt = null;
    }
  };
  setWorkingHours = (hours: WorkingHoursDto[] | null) => {
    this.workingHoursBySelectedOffice = hours;
  };
  setEmployees = (employeeData: EmployeeEntityResponse) => {
    this.employees = employeeData;
  };
  setSelectedRole = (role: string | null) => {
    this.selectedRole = role;
  };
  setSelectedEmployee = (
    employee: {
      id: number;
      name: string;
    } | null
  ) => {
    this.selectedEmployee = employee;
  };
  open = () => {
    this.isOpen = true;
  };

  get errors() {
    const result: {
      startOn?: string;
      endOn?: string;
      startAt?: string;
      endAt?: string;
      city?: string;
      employee?: string;
      office?: string;
      role?: string;
    } = {};
    const {
      startOn,
      endOn,
      startAt,
      endAt,
      workingHoursBySelectedOffice,
      selectedCityId,
      selectedEmployee,
      selectedOffice,
      selectedRole
    } = this;

    if (!selectedCityId) result.city = 'Выбор города обязателен';
    if (!selectedOffice) result.office = 'Выбор офиса обязателен';
    if (!startOn) result.startOn = 'Дата начала обязательна';
    if (!endOn) result.endOn = 'Дата окончания обязательна';
    if (!startAt) result.startAt = 'Время начала обязательно';
    if (!endAt) result.endAt = 'Время окончания обязательно';
    if (!selectedRole) result.role = 'Выбор должности обязателен';
    if (!selectedEmployee) result.employee = 'Выбор работника обязателен';

    if (
      !startOn ||
      !endOn ||
      !startAt ||
      !endAt ||
      !selectedCityId ||
      !selectedEmployee ||
      !selectedOffice ||
      !selectedRole
    )
      return result;

    const startDateTime = startOn.hour(startAt.hour()).minute(startAt.minute()).second(0).millisecond(0);
    const endDateTime = endOn.hour(endAt.hour()).minute(endAt.minute()).second(0).millisecond(0);
    const now = dayjs();
    const today = now.startOf('day');

    if (startDateTime.isBefore(today)) {
      result.startOn = 'Дата начала не может быть в прошлом';
    }
    if (endDateTime.isBefore(today)) {
      result.endOn = 'Дата окончания не может быть в прошлом';
    }
    const twoMonthsLater = now.add(2, 'month').endOf('day');
    if (startDateTime.isAfter(twoMonthsLater)) {
      result.startOn = 'Нельзя поставить смену позже 2 месяцев от текущей даты';
    }
    if (endDateTime.isAfter(twoMonthsLater)) {
      result.endOn = 'Нельзя поставить смену позже 2 месяцев от текущей даты';
    }
    if (startDateTime.isSame(today, 'day') && startDateTime.isBefore(now)) {
      result.startAt = 'Время начала не может быть в прошлом';
    }
    if (endDateTime.isSame(today, 'day') && endDateTime.isBefore(now)) {
      result.endAt = 'Время окончания не может быть в прошлом';
    }

    if (workingHoursBySelectedOffice) {
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

  get createShiftDTO(): CreateShiftDto | null {
    const { selectedOffice, selectedCityId, selectedEmployee, selectedRole, startOn, endOn, startAt, endAt } = this;
    if (
      !selectedOffice ||
      !selectedCityId ||
      !selectedEmployee ||
      !selectedRole ||
      !startOn ||
      !endOn ||
      !startAt ||
      !endAt
    ) {
      return null;
    }
    return {
      employeeId: selectedEmployee?.id,
      officeId: selectedOffice?.id,
      startOn: startOn.format(Formats.DATE_API),
      endOn: endOn.format(Formats.DATE_API),
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
  };
}

export const modalCreateSubstitutionGroupCreateShift = new ModalCreateSubstitutionGroupCreateShiftStore();
