import { EmployeeStatus } from '@/stores/employees.store';

// getEmployeeEntity
export interface EmployeeEntityResponse {
  id: number;
  userId: number;
  cityId: number;
  regionId: number;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  position: EmployeeEntityPosition;
  status: EmployeeEntityStatus;
  hiredAt: string;
  firedAt: string;
  substitutionGroup: boolean;
}

export interface EmployeeEntityPosition {
  id: number;
  code: string;
  name: string;
}

export interface EmployeeEntityStatus {
  id: number;
  code: string;
  name: string;
}

// getEmployees
export interface EmployeeResponse {
  id: number;
  userId: number;
  cityId: number;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  position: EmployeeEntityPosition;
  status: EmployeeEntityStatus;
  hiredAt: string;
  firedAt: string;
  substitutionGroup: boolean;
}

export interface CreateEmployeeRequest {
  fullName: string;
  phone?: string;
  email?: string;
  officeId: number;
  positionId: number;
  hireAt: string;
}

export interface GetEmployeesParams {
  id?: number[];
  fullName?: string;
  cityId?: number;
  positionId?: number;
  substitutionGroup?: boolean;
  page?: number;
  size?: number;
  status?: EmployeeStatus;
}

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  content: T;
  page: PageInfo;
}

export interface OfficesIdsByEmployeeResponse {
  id: number;
  code: string;
  name: string;
  address: string;
  cityId: number;
  regionId: number;
  headId: number;
  workingHours: WorkingHoursDto[];
}
export interface WorkingHoursDto {
  dayOfWeek: number;
  startsOn: string;
  endsOn: string;
}

// getPositions
export interface PositionsDTO {
  id: number;
  code: string;
  name: string;
}
