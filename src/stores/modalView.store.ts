import { makeAutoObservable } from 'mobx';

import type { ShiftModalData } from '@/hooks/useViewModal';

export class ModalViewStore {
  isOpen: boolean = false;
  shiftData: ShiftModalData | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  open = (shiftData: ShiftModalData) => {
    this.shiftData = shiftData;
    this.isOpen = true;
  };

  close = () => {
    this.isOpen = false;
  };

  reset = () => {
    this.shiftData = null;
  };
}

export const modalViewStore = new ModalViewStore();
