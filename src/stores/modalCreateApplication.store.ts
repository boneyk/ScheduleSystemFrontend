import dayjs, { Dayjs } from 'dayjs';
import { makeAutoObservable } from 'mobx';

import { Formats } from '@/utils/formats';

import { timetableStore } from './timetable.store';
import { ApplicationsRequest } from '@/dto/DtoApplications';

export class ModalCreateApplication {
  date: Dayjs | null = null;
  startAt: Dayjs | null = null;
  endAt: Dayjs | null = null;
  role: number | null = null;
  isOpen = false;
  regionId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setDate = (v: Dayjs | null) => {
    this.date = v;
  };

  setStartTime = (v: Dayjs | null) => {
    this.startAt = v;
  };

  setEndTime = (v: Dayjs | null) => {
    this.endAt = v;
  };

  setRole = (v: number | null) => {
    this.role = v;
  };

  setRegionId = (v: number | null) => {
    this.regionId = v;
  };

  get errors() {
    const error: {
      date?: string;
      startAt?: string;
      endAt?: string;
      role?: string;
    } = {};

    const { date, startAt, endAt, role } = this;

    if (!date) error.date = 'Дата обязательна';
    if (!startAt) error.startAt = 'Время начала обязательно';
    if (!endAt) error.endAt = 'Время окончания обязательно';
    if (!role) error.role = 'Должность обязательна';

    if (!date || !startAt || !endAt) {
      return error;
    }

    const now = dayjs();
    const today = now.startOf('day');
    const selectedDate = date.startOf('day');

    if (selectedDate.isBefore(today)) {
      error.date = 'Дата не может быть в прошлом';
    }
    const twoMonthsLater = now.add(2, 'month').endOf('day');
    if (date.isAfter(twoMonthsLater)) {
      error.date = 'Нельзя создать заявку на подмену позже 2 месяцев от текущей даты';
    }

    const startDateTime = date.hour(startAt.hour()).minute(startAt.minute()).second(0);
    const endDateTime = date.hour(endAt.hour()).minute(endAt.minute()).second(0);

    const { officeTimetable } = timetableStore;
    const selectedOfficeId = timetableStore.selectedOffice?.id;
    const selectedOffice = officeTimetable?.find((office) => office.id === selectedOfficeId);
    if (!selectedOffice || !selectedOffice.workingHours) {
      error.startAt = 'Не удалось получить график работы офиса';
      error.endAt = 'Не удалось получить график работы офиса';
      return error;
    }
    const endWorkingDay = selectedOffice.workingHours.find((wh) => wh.dayOfWeek === endDateTime.day());
    if (!endWorkingDay) {
      error.endAt = 'Офис не работает в этот день';
    } else {
      const [startHour, startMinute] = endWorkingDay.startsOn.split(':').map(Number);
      const [endHour, endMinute] = endWorkingDay.endsOn.split(':').map(Number);
      const minTime = date.hour(startHour).minute(startMinute);
      const maxTime = date.hour(endHour).minute(endMinute);
      if (endDateTime.isBefore(minTime) || endDateTime.isAfter(maxTime)) {
        error.endAt = 'Время окончания смены выходит за рамки работы офиса';
      }
      if (startDateTime.isBefore(minTime) || startDateTime.isAfter(maxTime)) {
        error.startAt = 'Время начала смены смены выходит за рамки работы офиса';
      }
    }

    if (selectedDate.isSame(today) && startDateTime.isBefore(now)) {
      error.startAt = 'Время начала не может быть в прошлом';
    }

    if (startDateTime.isAfter(endDateTime)) {
      error.startAt = 'Время начала должно быть раньше времени окончания';
      error.endAt = 'Время окончания должно быть позже времени начала';
    }

    if (startDateTime.isSame(endDateTime)) {
      error.startAt = 'Время начала и окончания не могут совпадать';
      error.endAt = 'Время начала и окончания не могут совпадать';
    }
    return error;
  }

  get isValid() {
    return Object.keys(this.errors).length === 0;
  }

  get createApplicationDto(): ApplicationsRequest | null {
    if (!this.isValid) return null;

    const { selectedOffice, regionId } = timetableStore;

    if (!selectedOffice || !regionId) return null;
    if (!this.date || !this.startAt || !this.endAt || !this.role) return null;

    return {
      officeId: selectedOffice.id,
      regionId: regionId,
      records: [
        {
          positionId: Number(this.role),
          quantity: 1,
          startOn: this.date.format(Formats.DATE_API),
          endOn: this.date.format(Formats.DATE_API),
          startAt: this.startAt.format(Formats.TIME_API),
          endAt: this.endAt.format(Formats.TIME_API)
        }
      ]
    };
  }

  open = () => {
    this.isOpen = true;
  };

  close = () => {
    this.isOpen = false;
  };

  reset = () => {
    this.date = null;
    this.startAt = null;
    this.endAt = null;
    this.role = null;
  };
}

export const modalCreateApplicationStore = new ModalCreateApplication();
