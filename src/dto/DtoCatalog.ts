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

export interface Cities {
  id: number;
  name: string;
  regionId: number;
}
