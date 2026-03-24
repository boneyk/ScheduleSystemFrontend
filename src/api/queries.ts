import { QueryClient, QueryFunctionContext } from '@tanstack/react-query';

import { isUserAdmin } from '@/utils/auth';

import { getApplication, getApplicationStatuses } from './application_service';
import { getCitiesByRegion } from './catalog_service';
import { getEmployeeEntity, getEmployees, getPositions } from './employees_service';
import {
  getEmployeeIdsByOffices,
  getOffices,
  getOfficesIdsByEmployee,
  getOfficesIdsByEmployeeHead,
  getWorkingHoursByOffice
} from './office_service';
import {
  getAbsenceTypes,
  getEmployeeStats,
  getMonthlyStats,
  getMySchedule,
  getSchedule,
  getScheduleByRegion,
  getWeeklyStats
} from './shedule_service';
import { baseLayoutStore } from '@/stores/baseLayout.store';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 10 * 60 * 1000,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  }
});

export const employeeEntityKey = (userId: number) => ['employeeEntity', userId] as const;
export const officesKey = (employeeId: number) => ['offices', employeeId] as const;
export const employeeIdsByOfficeKey = (officeId: number) => ['employeeIdsByOffice', officeId] as const;
export const employeesByIdsKey = (employeeIds: number[], page: number, size: number, positionId?: number) =>
  ['employeesByIds', employeeIds, page, size, positionId] as const;
export const employeesByCityKey = (cityId: number, page?: number, size?: number) =>
  ['employeesByCity', cityId, page, size] as const;
export const scheduleKey = (
  isSubstitutionGroup: boolean | undefined,
  regionId: number | undefined,
  officeId: number,
  year: number,
  month: number
) => ['schedule', isSubstitutionGroup, regionId, officeId, year, month] as const;
export const myScheduleKey = (employeeId: number, year: number, month: number) =>
  ['mySchedule', employeeId, year, month] as const;
export const scheduleByOfficeKey = (positionId: number | undefined, officeId: number, year: number, month: number) =>
  ['schedule', positionId, officeId, year, month] as const;
export const scheduleByRegionKey = (
  regionId?: number,
  year?: number,
  month?: number,
  positionId?: number | undefined
) => ['scheduleByRegion', regionId, year, month, positionId] as const;
export const applicationsKey = (
  regionId: number | undefined,
  officeId: number | undefined,
  year: number,
  month: number
) => ['applications', regionId, officeId, year, month] as const;
export const positionsKey = () => ['positions'] as const;
export const absenceTypesKey = () => ['absence-types'] as const;
export const citiesByRegionKey = (regionId: number[], size: number) => ['citiesByRegion', regionId, size] as const;
export const officesByCityKey = (cityId: number, size: number) => ['officesByCity', cityId, size] as const;
export const workingHoursKey = (officeId: number) => ['workingHours', officeId] as const;
export const monthlyStatsKey = (
  officeId: number | undefined,
  regionId: number | undefined,
  month: number,
  year: number
) => ['monthlyStats', officeId, regionId, month, year] as const;
export const weeklyStatsKey = (officeId: number | undefined, regionId: number | undefined, weekStart: string) =>
  ['weeklyStats', officeId, regionId, weekStart] as const;
export const employeeStatsKey = (officeId: number | undefined, regionId: number | undefined, weekStart: string) =>
  ['employeeStats', officeId, regionId, weekStart] as const;

export const fetchEmployeeEntity = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, userId] = queryKey as ReturnType<typeof employeeEntityKey>;
    const { data } = await getEmployeeEntity(userId);
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Ошибка загрузки данных');
    throw error;
  }
};

export const fetchOffices = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, employeeId] = queryKey as ReturnType<typeof officesKey>;
    const { data } = await (isUserAdmin()
      ? getOfficesIdsByEmployeeHead(employeeId)
      : getOfficesIdsByEmployee(employeeId));
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    baseLayoutStore.showWarning('Ошибка загрузки данных');
    throw error;
  }
};

export const fetchEmployeeIdsByOffice = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, officeId] = queryKey as ReturnType<typeof employeeIdsByOfficeKey>;
    const { data } = await getEmployeeIdsByOffices(officeId);
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Ошибка загрузки данных');
    throw error;
  }
};

export const fetchEmployeesByIds = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, employeeIds, page, size, positionId] = queryKey as ReturnType<typeof employeesByIdsKey>;
    if (employeeIds.length === 0) return;
    const { data } = await getEmployees({ id: employeeIds, page, size, positionId });
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось получить данные сотрудников');
    throw error;
  }
};

export const fetchEmployeesByCity = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, cityId, page, size] = queryKey as ReturnType<typeof employeesByCityKey>;
    const { data } = await getEmployees({ cityId, page, size });
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось получить данные сотрудников');
    throw error;
  }
};

export const fetchScheduleByOffice = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, positionId, officeId, year, month] = queryKey as ReturnType<typeof scheduleByOfficeKey>;
    const {
      data: { data: schedule }
    } = await getSchedule(positionId, officeId, year, month + 1);
    return schedule;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось получить расписание');
    throw error;
  }
};

export const fetchScheduleByRegion = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, regionId, year, month, positionId] = queryKey as ReturnType<typeof scheduleByRegionKey>;
    if (regionId == null || year == null || month == null) return;
    const {
      data: { data: schedule }
    } = await getScheduleByRegion(regionId, year, month + 1, positionId);
    return schedule;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось получить расписание');
    throw error;
  }
};

export const fetchMySchedule = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, employeeId, year, month] = queryKey as ReturnType<typeof myScheduleKey>;
    const { data } = await getMySchedule(employeeId, year, month + 1);
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось получить ваше расписание');
    throw error;
  }
};

export const fetchAbsenceTypes = async () => {
  try {
    const { data } = await getAbsenceTypes();
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось загрузить типы отсутствий');
    throw error;
  }
};

export const fetchPositions = async () => {
  try {
    const { data } = await getPositions();
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось получить список позиций');
    throw error;
  }
};

export const fetchApplicationStatuses = async () => {
  try {
    const { data } = await getApplicationStatuses();
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось получить статусы заявок');
    throw error;
  }
};

export const fetchApplications = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, regionId, officeId, year, month] = queryKey as ReturnType<typeof applicationsKey>;
    const { data } = await getApplication(year, month + 1, regionId, officeId);
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось получить список заявок');
    throw error;
  }
};

export const fetchCitiesByRegion = async ({ queryKey, pageParam = 0 }: QueryFunctionContext) => {
  try {
    const [, regionId, size] = queryKey as ReturnType<typeof citiesByRegionKey>;
    const { data } = await getCitiesByRegion(regionId, pageParam as number, size);
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось получить список городов');
    throw error;
  }
};

export const fetchOfficeByRegion = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, cityId, size] = queryKey as ReturnType<typeof officesByCityKey>;
    const { data } = await getOffices(cityId, size);
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось получить список офисов');
    throw error;
  }
};

export const fetchMonthlyStats = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, officeId, regionId, month, year] = queryKey as ReturnType<typeof monthlyStatsKey>;
    const { data } = await getMonthlyStats(month, year, officeId, regionId);
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось загрузить статистику за месяц');
    throw error;
  }
};

export const fetchWeeklyStats = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, officeId, regionId, weekStart] = queryKey as ReturnType<typeof weeklyStatsKey>;
    const { data } = await getWeeklyStats(weekStart, officeId, regionId);
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось загрузить статистику за неделю');
    throw error;
  }
};

export const fetchEmployeeStats = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, officeId, regionId, weekStart] = queryKey as ReturnType<typeof employeeStatsKey>;
    const { data } = await getEmployeeStats(weekStart, officeId, regionId);
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось загрузить статистику сотрудников');
    throw error;
  }
};

export const fetchWorkingHours = async ({ queryKey }: QueryFunctionContext) => {
  try {
    const [, officeId] = queryKey as ReturnType<typeof workingHoursKey>;
    const { data } = await getWorkingHoursByOffice(officeId);
    return data;
  } catch (error) {
    baseLayoutStore.showWarning('Не удалось получить расписание офиса');
    throw error;
  }
};
