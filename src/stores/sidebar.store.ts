import { makeAutoObservable } from 'mobx';

import { ApplicationsGroupedResponse, ApplicationStatuses, RecordApplication } from '@/dto/DtoApplications';

export class SidebarStore {
  isOpen = false;
  appsByStatus: ApplicationsGroupedResponse | null = null;
  actionType: 'REJECT' | 'CONFIRM' | null = null;
  statuses: ApplicationStatuses[] = [];
  selectedStatusCode: string | null = null;
  selectedApp: RecordApplication | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setAppsByStatus = (data: ApplicationsGroupedResponse) => {
    this.appsByStatus = data;
  };

  get currentApps() {
    if (!this.appsByStatus || !this.selectedStatusCode) return [];
    const selectedStatus = this.statuses.find((s) => s.code === this.selectedStatusCode);
    return this.appsByStatus[selectedStatus?.name ?? ''] ?? [];
  }
  setStatuses = (statuses: ApplicationStatuses[]) => {
    this.statuses = statuses;

    if (!this.selectedStatusCode && statuses.length > 0) {
      this.selectedStatusCode = statuses[0].code;
    }
  };

  getStatusCodeByName = (statusName: string): string | null => {
    const status = this.statuses.find((s) => s.name === statusName);
    return status?.code ?? null;
  };
  setSelectedStatus = (code: string) => {
    this.selectedStatusCode = code;
  };

  setSelectedApp = (app: RecordApplication | null, actionType?: 'REJECT' | 'CONFIRM') => {
    this.selectedApp = app;
    this.actionType = actionType ?? null;
  };

  open = () => {
    this.isOpen = true;
  };

  close = () => {
    this.isOpen = false;
  };
}
export const sidebarStore = new SidebarStore();
