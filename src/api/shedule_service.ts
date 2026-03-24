import { AxiosResponse } from 'axios';

import { instance_schedule } from './config';
import type {
  AbsenceType,
  CreateAbsenceDto,
  CreateShiftDto,
  DayDto,
  EditShiftRequest,
  EmployeeStatsResponse,
  EmployeeTimesheetDto,
  MonthlyStatsResponse,
  MyScheduleResponse,
  ScheduleResponse,
  ShiftByResponse,
  ShiftsResponse,
  TimesheetApiResponse,
  WeeklyStatsResponse,
  WorkTimeCreateDto,
  WorkTimeResponseDto
} from '@/dto/DtoSchedule';

export type { DayDto, EmployeeTimesheetDto, TimesheetApiResponse, WorkTimeCreateDto, WorkTimeResponseDto };

export const getSchedule = (
  positionId: number | undefined,
  officeId: number,
  year: number,
  month: number
): Promise<AxiosResponse<ScheduleResponse>> => {
  return instance_schedule.get(`schedules/by-office/${officeId}`, {
    params: {
      positionId,
      year,
      month
    }
  });
};

export const getScheduleByRegion = (
  regionId: number,
  year: number,
  month: number,
  positionId?: number
): Promise<AxiosResponse<ScheduleResponse>> => {
  return instance_schedule.get(`schedules/by-region/${regionId}`, {
    params: { positionId, year, month }
  });
};

export const getMySchedule = (
  employeeId: number,
  year: number,
  month: number
): Promise<AxiosResponse<MyScheduleResponse>> => {
  return instance_schedule.get(`schedules/by-employee/${employeeId}`, {
    params: {
      year,
      month
    }
  });
};

export const createShift = (dto: CreateShiftDto): Promise<AxiosResponse<ShiftByResponse[]>> => {
  return instance_schedule.post('shifts', dto);
};

export const deleteShifts = (shiftIds: number[]): Promise<AxiosResponse<void>> => {
  const query = shiftIds.map((id) => `id=${id}`).join('&');
  return instance_schedule.delete(`shifts?${query}`);
};

export const editShifts = (shiftIds: number[], dto: EditShiftRequest): Promise<AxiosResponse<void>> => {
  const query = shiftIds.map((id) => `id=${id}`).join('&');
  return instance_schedule.put(`shifts?${query}`, dto);
};

export const getAbsenceTypes = (): Promise<AxiosResponse<AbsenceType[]>> =>
  instance_schedule.get<AbsenceType[]>(`absence-types`);

export const createAbsence = (createAbsenceDto: CreateAbsenceDto): Promise<AxiosResponse<CreateAbsenceDto>> =>
  instance_schedule.post<CreateAbsenceDto>(`absences`, createAbsenceDto);

export const deleteAbsence = (absenceIds: number[]): Promise<AxiosResponse<void>> => {
  const query = absenceIds.map((id) => `id=${id}`).join('&');
  return instance_schedule.delete(`absences?${query}`);
};

export const getTimesheet = (
  officeId: number,
  year: number,
  month: number,
  positionId?: number
): Promise<AxiosResponse<TimesheetApiResponse>> => {
  return instance_schedule.get(`timesheets/by-office/${officeId}`, {
    params: { year, month, positionId }
  });
};

export const getTimesheetByRegion = (
  regionId: number,
  year: number,
  month: number
): Promise<AxiosResponse<TimesheetApiResponse>> => {
  return instance_schedule.get(`timesheets/by-region/${regionId}`, {
    params: { year, month }
  });
};

export const saveWorktimes = (items: WorkTimeCreateDto[]): Promise<AxiosResponse<WorkTimeResponseDto[]>> => {
  return instance_schedule.post('worktimes', { items });
};

export const getMonthlyStats = (
  month: number,
  year: number,
  officeId?: number,
  regionId?: number
): Promise<AxiosResponse<MonthlyStatsResponse>> =>
  instance_schedule.get('statistics/monthly', { params: { officeId, regionId, month, year } });

export const getWeeklyStats = (
  date: string,
  officeId?: number,
  regionId?: number
): Promise<AxiosResponse<WeeklyStatsResponse>> =>
  instance_schedule.get('statistics/weekly', { params: { officeId, regionId, date } });

export const getEmployeeStats = (
  date: string,
  officeId?: number,
  regionId?: number
): Promise<AxiosResponse<EmployeeStatsResponse>> =>
  instance_schedule.get('statistics/employees', { params: { officeId, regionId, date } });

export const getShiftsByEmployeeIds = (
  officeId: number,
  employeeIds: number[],
  currentDate?: string
): Promise<AxiosResponse<ShiftsResponse[]>> => {
  const query = employeeIds.map((id) => `employeeId=${id}`).join('&');
  return instance_schedule.get(`shifts?${query}`, {
    params: {
      officeId,
      currentDate
    }
  });
};
