import { makeAutoObservable } from 'mobx';

import { timetableStore } from './timetable.store';
import { EmployeeResponse } from '@/api/employees_service';

export type EmployeeStatus = 'ACTIVE' | 'FIRED';

const DEFAULT_PAGE_SIZE = 20;

export class EmployeesStore {
  employees: EmployeeResponse[] = [];
  page: number = 0;
  pageSize: number = DEFAULT_PAGE_SIZE;
  totalElements: number = 0;
  isEmployeeDialogVisible: boolean = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setEmployees(employeesData: EmployeeResponse[]) {
    this.employees = employeesData;
  }

  setTotalElements(totalElementsData: number) {
    this.totalElements = totalElementsData;
  }

  async setPage(page: number) {
    this.page = page;
  }

  async setPageSize(pageSize: number) {
    this.pageSize = pageSize;
    this.page = 0;
  }

  get currentOfficeEmployees() {
    const currentOfficeId = timetableStore.selectedOffice?.id;
    if (!currentOfficeId) return [];
    return this.employees;
  }

  setAddEmployeeDialogVisibility(value: boolean): void {
    this.isEmployeeDialogVisible = value;
  }
  resetStore() {
    this.employees = [];
    this.page = 0;
    this.pageSize = DEFAULT_PAGE_SIZE;
    this.totalElements = 0;
  }
}

export const employeesStore = new EmployeesStore();
