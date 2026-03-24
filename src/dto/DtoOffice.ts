// getOffices
export interface OfficeDto {
  id: number;
  code: string;
  name: string;
  address: string;
  cityId: number;
}

export interface OfficesResponse {
  offices: OfficeDto[];
}

// getOfficesTimetable
export interface OfficeTimetableDto {
  id: number;
  cityId: number;
  headId: number;
  code: string;
  name: string;
  address: string;
  workingHours: WorkingHoursDto[];
}

export interface WorkingHoursDto {
  dayOfWeek: string | number;
  startsOn: string;
  endsOn: string;
}

export interface PaginatedResponse<T> {
  content: T;
  page: PageInfo;
}
export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
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
