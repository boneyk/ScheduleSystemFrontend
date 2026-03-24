import { AxiosResponse } from 'axios';
import {
  EmployeeEntityResponse,
  EmployeeResponse,
  GetEmployeesParams,
  PaginatedResponse,
  PositionsDTO
} from 'dto/DtoEmployeesService';

import { instance_employee } from './config';

export type * from 'dto/DtoEmployeesService';

export const getEmployeeEntity = (userId: number): Promise<AxiosResponse<EmployeeEntityResponse>> => {
  return instance_employee.get(`employees/by-user/${userId}`);
};

export const getEmployees = (
  params?: GetEmployeesParams
): Promise<AxiosResponse<PaginatedResponse<EmployeeResponse[]>>> => {
  return instance_employee.get('employees', { params });
};

export const getPositions = async (): Promise<AxiosResponse<PositionsDTO[]>> => {
  return instance_employee.get(`positions`);
};
