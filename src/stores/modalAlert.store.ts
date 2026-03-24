import dayjs from 'dayjs';
import { makeAutoObservable } from 'mobx';

import { ShiftModalData } from '@/hooks/useViewModal';

class ModalAlertStore {
  isOpen = false;
  shiftData: ShiftModalData | null = null;
  startOn: dayjs.Dayjs | null = null;
  endOn: dayjs.Dayjs | null = null;
  editMode: 'single' | 'range' | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  open(shiftData: ShiftModalData, startOn: dayjs.Dayjs, endOn: dayjs.Dayjs) {
    this.shiftData = shiftData;
    this.startOn = startOn;
    this.endOn = endOn;
    this.editMode = startOn.isSame(endOn, 'day') ? 'single' : 'range';
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  reset() {
    this.shiftData = null;
    this.startOn = null;
    this.endOn = null;
    this.editMode = null;
  }
}

export const modalAlertStore = new ModalAlertStore();
