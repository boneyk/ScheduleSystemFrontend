import dayjs, { Dayjs } from 'dayjs';
import { makeAutoObservable } from 'mobx';

import { isUserManager } from '@/utils/auth';
import { Formats } from 'utils/formats';

import { timetableStore } from './timetable.store';
import { AbsenceType, CreateAbsenceDto } from '@/dto/DtoSchedule';

export class ModalCreateAbsenceStore {
  startOn: Dayjs | null = null;
  endOn: Dayjs | null = null;
  absenceTypeId: number | null = null;
  employeeId: number | null = null;

  isOpen = false;
  isLoadingTypes = false;
  isSubmitting = false;
  typesError: string | null = null;

  absenceTypes: AbsenceType[] = [];
  private typesLoaded = false;

  constructor() {
    makeAutoObservable(this);
  }

  open = async () => {
    this.isOpen = true;
  };

  close = () => {
    this.isOpen = false;
  };

  reset = () => {
    this.startOn = null;
    this.endOn = null;
    this.absenceTypeId = null;
    this.employeeId = null;
    this.typesError = null;
  };

  setStartDate = (date: Dayjs | null) => {
    this.startOn = date;
  };
  setEndDate = (date: Dayjs | null) => {
    this.endOn = date;
  };
  setAbsenceTypes = (types: AbsenceType[]) => {
    this.absenceTypes = types;
  };
  setAbsenceTypeId = (id: number | null) => {
    this.absenceTypeId = id;
  };
  setEmployeeId = (id: number | null) => {
    this.employeeId = id;
  };

  get errors() {
    const result: {
      startOn?: string;
      endOn?: string;
      absenceTypeId?: string;
      employeeId?: string;
    } = {};
    const { selectedEmployee } = timetableStore;
    const { startOn, endOn, absenceTypeId } = this;

    if (!startOn) result.startOn = 'Дата начала обязательна';
    if (!endOn) result.endOn = 'Дата окончания обязательна';
    if (!absenceTypeId) result.absenceTypeId = 'Тип отсутствия обязателен';
    if (!selectedEmployee) result.employeeId = 'Сотрудник обязателен';

    if (!startOn || !endOn) {
      return result;
    }

    const start = startOn.startOf('day');
    const end = endOn.startOf('day');
    const today = dayjs().startOf('day');

    if (start.isBefore(today)) {
      result.startOn = 'Дата начала не может быть в прошлом';
    }
    if (end.isBefore(today)) {
      result.endOn = 'Дата окончания не может быть в прошлом';
    }
    const twoMonthsLater = today.add(2, 'month').endOf('day');
    if (start.isAfter(twoMonthsLater)) {
      result.startOn = 'Нельзя поставить смену позже 2 месяцев от текущей даты';
    }
    if (end.isAfter(twoMonthsLater)) {
      result.endOn = 'Нельзя поставить отсутствие позже 2 месяцев от текущей даты';
    }

    if (start.isAfter(end)) {
      result.startOn = 'Дата начала не может быть позже даты окончания';
      result.endOn = 'Дата окончания не может быть раньше даты начала';
    }

    if (!isUserManager()) {
      const { officeTimetable } = timetableStore;
      const selectedOfficeId = timetableStore.selectedOffice?.id;
      const selectedOffice = officeTimetable?.find((office) => office.id === selectedOfficeId);
      if (!selectedOffice || !selectedOffice.workingHours) {
        result.startOn = 'Не удалось получить график работы офиса';
        result.endOn = 'Не удалось получить график работы офиса';
        return result;
      }
      const endWorkingDay = selectedOffice.workingHours.find((wh) => wh.dayOfWeek === end.day());
      if (!endWorkingDay) {
        result.endOn = 'Офис не работает в этот день';
      }
      const startWorkingDay = selectedOffice.workingHours.find((wh) => wh.dayOfWeek === start.day());
      if (!startWorkingDay) {
        result.startOn = 'Офис не работает в этот день';
      }
    }

    return result;
  }

  get isValid() {
    return Object.keys(this.errors).length === 0;
  }

  get createAbsenceDto(): CreateAbsenceDto | null {
    const { selectedEmployee } = timetableStore;
    const { startOn, endOn, absenceTypeId } = this;

    if (!this.isValid || !startOn || !endOn || !absenceTypeId || !selectedEmployee) {
      return null;
    }

    return {
      startOn: startOn.format(Formats.DATE_API),
      endOn: endOn.format(Formats.DATE_API),
      absenceTypeId: absenceTypeId,
      employeeId: selectedEmployee.id
    };
  }
}

export const modalCreateAbsenceStore = new ModalCreateAbsenceStore();
