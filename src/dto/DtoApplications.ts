// post Application
export interface ApplicationsRequest {
  officeId: number;
  regionId: number;
  records: ApplicationRecords[];
}

export interface ApplicationRecords {
  positionId: number;
  quantity: number;
  startOn: string;
  endOn: string;
  startAt: string;
  endAt: string;
}

// get Application
export interface ApplicationsResponse {
  data: ApplicationsGroupedResponse;
}
export type ApplicationsGroupedResponse = Record<string, ApplicationsProp[]>;
export interface ApplicationsProp {
  id: number;
  office: Office;
  regionId: number;
  records: RecordApplication[];
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

export interface RecordApplication {
  id: number;
  applicationId: number;
  position: Position;
  quantity: number;
  startOn: string;
  endOn: string;
  startAt: string;
  endAt: string;
}
export interface Position {
  id: number;
  code: string;
  name: string;
}

// patch Application
export interface EditApplicationRequest {
  statusCode: string;
}

// get ApplicationStatuses
export interface ApplicationStatuses {
  id: number;
  code: string;
  name: string;
}
