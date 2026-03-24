import { Office } from '@/dto/DtoSchedule';

export type ShiftType = 'work' | 'vacation' | 'sick';
export type ModalCreateMode = 'edit' | 'shift' | 'absence' | 'application';

export interface Shift {
  id: number;
  startTime: string;
  endTime: string;
  date: string;
  type: ShiftType;
  label?: string;
  office?: Office;
}

export interface myScheduleItem {
  officeName: string;
  officeId: number;
  startTime: string;
  endTime: string;
  type: string;
}

export interface DayShiftInfo {
  id: number;
  type: ShiftType;
  shiftKey: string;
  title: string;
  startTime: string;
  endTime: string;
  blockStartDate: string;
  blockEndDate: string;
  office?: Office;
  isCombined?: boolean;
  shiftsForCombined?: CombinedShifts[];
}
export interface CombinedShifts {
  id: number;
  startTime: string;
  endTime: string;
  office: Office;
}

export interface CalendarCell {
  day: number;
  month: number;
  myShifts: myScheduleItem[];
}
