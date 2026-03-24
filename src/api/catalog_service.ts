import { AxiosResponse } from 'axios';

import { instance_catalog } from './config';
import { Cities, PaginatedResponse } from '@/dto/DtoCatalog';

export const getCitiesByRegion = (
  regionIds: number[],
  page?: number,
  size?: number
): Promise<AxiosResponse<PaginatedResponse<Cities[]>>> => {
  const query = regionIds.map((id) => `regionId=${id}`).join('&');
  return instance_catalog.get(`cities?${query}`, {
    params: {
      page,
      size
    }
  });
};
