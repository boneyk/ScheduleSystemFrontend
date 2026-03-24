// getSchedule Response
export interface ScheduleResponse {
  data: Record<string, EmployeeSchedule[]>;
}

export interface EmployeeSchedule {
  id: number;
  fullName: string;
  substitutionGroup: boolean;
  attachedToOffice: boolean;
  detachedAt: string | null;
  city: City;
  shifts: ShiftByResponse[];
  absences: Absence[];
}

export interface City {
  id: number;
  name: string;
  regionId: number;
}
export interface ShiftByResponse {
  id: number;
  office: Office;
  employeeId: number;
  scheduledOn: string;
  startAt: string;
  endAt: string;
}
export interface Office {
  id: number;
  code: string;
  name: string;
  address: string;
  cityId: number;
  regionId: number;
  headId: number;
}
export interface Absence {
  id: number;
  employeeId: number;
  absentOn: string;
  absenceType: AbsenceType;
}

export interface AbsenceType {
  id: number;
  code: string;
  name: string;
}

export interface ApiShift {
  id: number;
  officeId: number;
  date: string;
  startTime: string;
  endTime: string;
}

// createShift Response
export interface CreateShiftDto {
  employeeId: number;
  officeId: number;
  startOn: string;
  endOn: string;
  startAt: string;
  endAt: string;
}

// getMySchedule
export interface MyScheduleResponse {
  employeeId: number;
  fullName: string;
  phone: string;
  shifts: ShiftByResponse[];
  absences: Absence[];
}

// editShift
export interface EditShiftRequest {
  startAt: string;
  endAt: string;
}

// getAbsenceTypes
export interface AbsenceType {
  id: number;
  code: string;
  name: string;
}

// createAbsence
export interface CreateAbsenceDto {
  startOn: string;
  endOn: string;
  absenceTypeId: number;
  employeeId: number;
}

export interface DayDto {
  type: 'work' | 'absence' | 'empty';
  dateOn: string;
  workedMinutes?: number;
  isDraft?: boolean;
  officeId?: number;
  absenceType?: { id: number; code: string; name: string };
}

export interface TimesheetSummaryDto {
  totalWorkTime: string;
  totalMinutes: number;
  monthlyNorm: string;
  normMinutes: number;
  balanceTime: string;
  balanceMinutes: number;
}

export interface EmployeeTimesheetDto {
  employeeId: number;
  fullName: string;
  position: { id: number; code: string; name: string };
  days: DayDto[];
  summary: TimesheetSummaryDto;
}

export interface TimesheetApiResponse {
  data: Record<string, EmployeeTimesheetDto[]>;
}

export interface WorkTimeCreateDto {
  employeeId: number;
  officeId: number;
  workedMinutes: number;
  dateOn: string;
}

export interface WorkTimeResponseDto {
  id: number;
  employeeId: number;
  officeId: number;
  workedMinutes: number;
  dateOn: string;
}

// getShiftsByEmployeeIds
export interface ShiftsResponse {
  employeeId: number;
  shifts: ShiftByEmployee[];
}

export interface ShiftByEmployee {
  id: number;
  officeId: number;
  employeeId: number;
  scheduledOn: string;
  startAt: string;
  endAt: string;
}

// GET /statistics/monthly
export interface MonthlyStatsResponse {
  planHours: string;
  actualHours: string;
  overtimeHours: string;
  missingHours: string;
}

// GET /statistics/weekly
export interface WeeklyStatsDayRole {
  name: string;
  workersAmount?: number;
  employeesAmount?: number;
}

export interface WeeklyStatsDayDto {
  date?: string;
  reportDate?: string;
  actualHours: string;
  planHours?: string;
  dateData?: WeeklyStatsDayRole[];
  positions?: WeeklyStatsDayRole[];
}

export interface WeeklyStatsResponse {
  planHours?: string;
  factHours?: string;
  actualHours?: string;
  daylyData?: WeeklyStatsDayDto[];
  dailyStatistics?: WeeklyStatsDayDto[];
}

// GET /statistics/employees
export interface EmployeeStatsItemDto {
  fullName: string;
  normHours?: string;
  factHours?: string;
  planHours?: string;
  actualHours?: string;
}

export type EmployeeStatsResponse = EmployeeStatsItemDto[];
