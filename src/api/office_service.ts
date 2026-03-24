import { AxiosResponse } from 'axios';

import { instance_office } from './config';
import { CreateEmployeeRequest, OfficesIdsByEmployeeResponse } from './employees_service';
import { Office, PaginatedResponse, WorkingHoursDto } from '@/dto/DtoOffice';

export const addEmployeeToOffice = (
  officeId: number,
  dto: CreateEmployeeRequest
): Promise<AxiosResponse<CreateEmployeeRequest>> => {
  return instance_office.post(`offices/${officeId}/employee`, dto);
};

export const deleteEmployees = async (officeId: number, employeeIds: number[]): Promise<AxiosResponse<void>> => {
  return instance_office.delete(`offices/${officeId}/employees`, { data: { employeeIds } });
};

export const getOfficesIdsByEmployeeHead = (
  employeeId: number
): Promise<AxiosResponse<OfficesIdsByEmployeeResponse>> => {
  return instance_office.get(`offices/by-head/${employeeId}`);
};

export const getOfficesIdsByEmployee = (employeeId: number): Promise<AxiosResponse<OfficesIdsByEmployeeResponse[]>> => {
  return instance_office.get(`offices/by-employee/${employeeId}`);
};

export const getEmployeeIdsByOffices = (officeId: number): Promise<AxiosResponse<number[]>> => {
  return instance_office.get(`offices/${officeId}/employees`);
};
export const addEmployees = async (officeId: number, employeeIds: number[]): Promise<AxiosResponse<void>> => {
  return instance_office.post(`offices/${officeId}/employees`, { employeeIds });
};
export const getOffices = (
  cityId: number,
  pages?: number,
  size?: number
): Promise<AxiosResponse<PaginatedResponse<Office[]>>> =>
  instance_office.get('offices', { params: { cityId, pages, size } });

export const getWorkingHoursByOffice = (officeId: number): Promise<AxiosResponse<WorkingHoursDto[]>> =>
  instance_office.get(`working-hours/by-office/${officeId}`);
