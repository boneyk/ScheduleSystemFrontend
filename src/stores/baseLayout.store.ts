import { makeAutoObservable } from 'mobx';

export class BaseLayoutStore {
  warningMessage: string = '';
  isWarningVisible: boolean = false;
  successMessage: string = '';
  isSuccessVisible: boolean = false;
  cautionMessage: string = '';
  isCautionVisible: boolean = false;
  private hideWarningTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideSuccessTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideCautionTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  showWarning(message: string, duration: number = 3000) {
    if (this.hideWarningTimeout) {
      clearTimeout(this.hideWarningTimeout);
    }

    this.warningMessage = message;
    this.isWarningVisible = true;

    this.hideWarningTimeout = setTimeout(() => {
      this.hideWarning();
    }, duration);
  }

  hideWarning() {
    this.isWarningVisible = false;
    this.hideWarningTimeout = null;
  }

  showSuccess(message: string, duration: number = 4000) {
    if (this.hideSuccessTimeout) {
      clearTimeout(this.hideSuccessTimeout);
    }

    this.successMessage = message;
    this.isSuccessVisible = true;

    this.hideSuccessTimeout = setTimeout(() => {
      this.hideSuccess();
    }, duration);
  }

  hideSuccess() {
    this.isSuccessVisible = false;
    this.hideSuccessTimeout = null;
  }

  showCaution(message: string, duration: number = 4000) {
    if (this.hideCautionTimeout) {
      clearTimeout(this.hideCautionTimeout);
    }

    this.cautionMessage = message;
    this.isCautionVisible = true;

    this.hideCautionTimeout = setTimeout(() => {
      this.hideCaution();
    }, duration);
  }

  hideCaution() {
    this.isCautionVisible = false;
    this.hideCautionTimeout = null;
  }
}

export const baseLayoutStore = new BaseLayoutStore();
