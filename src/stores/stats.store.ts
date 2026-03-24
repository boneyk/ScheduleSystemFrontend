import dayjs, { Dayjs } from 'dayjs';
import { makeAutoObservable } from 'mobx';

export type StatsPeriod = 'day' | 'week';

export class StatsStore {
  selectedDate: Dayjs = dayjs();
  period: StatsPeriod = 'day';

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setSelectedDate(date: Dayjs | null) {
    if (date) {
      this.selectedDate = date;
    }
  }

  setPeriod(period: StatsPeriod) {
    this.period = period;
  }
}

export const statsStore = new StatsStore();
