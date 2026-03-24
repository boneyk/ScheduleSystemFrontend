import { AxiosResponse } from 'axios';

import { instance_application } from './config';
import {
  ApplicationsRequest,
  ApplicationsResponse,
  ApplicationStatuses,
  EditApplicationRequest
} from '@/dto/DtoApplications';

export const postApplication = (dto: ApplicationsRequest): Promise<AxiosResponse<void>> => {
  return instance_application.post('applications', dto);
};

export const getApplication = (
  year: number,
  month: number,
  regionId?: number,
  officeId?: number
): Promise<AxiosResponse<ApplicationsResponse>> => {
  return instance_application.get('applications', {
    params: {
      regionId,
      officeId,
      year,
      month
    }
  });
};

export const editApplication = (applicationId: number, dto: EditApplicationRequest): Promise<AxiosResponse<void>> => {
  return instance_application.patch(`applications/${applicationId}/status`, dto);
};

export const getApplicationStatuses = (): Promise<AxiosResponse<ApplicationStatuses[]>> => {
  return instance_application.get(`statuses`);
};
