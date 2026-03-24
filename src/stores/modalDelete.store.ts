import type { Dayjs } from 'dayjs';
import { makeAutoObservable } from 'mobx';

import type { ShiftModalData } from '@/hooks/useViewModal';

export class ModalDeleteStore {
  isOpen: boolean = false;
  shiftId: number | null = null;
  shiftData: ShiftModalData | null = null;
  startOn: Dayjs | null = null;
  endOn: Dayjs | null = null;
  deleteMode: 'single' | 'period' = 'single';

  constructor() {
    makeAutoObservable(this);
  }

  open = (
    shiftId: number,
    shiftData: ShiftModalData,
    startOn: Dayjs | null = null,
    endOn: Dayjs | null = null,
    deleteMode: 'single' | 'period' = 'single'
  ) => {
    this.shiftId = shiftId;
    this.shiftData = shiftData;
    this.startOn = startOn;
    this.endOn = endOn;
    this.deleteMode = deleteMode;
    this.isOpen = true;
  };

  close = () => {
    this.isOpen = false;
  };

  reset = () => {
    this.shiftId = null;
    this.shiftData = null;
    this.startOn = null;
    this.endOn = null;
    this.deleteMode = 'single';
  };
}

export const modalDeleteStore = new ModalDeleteStore();
