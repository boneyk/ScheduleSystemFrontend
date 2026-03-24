import { FC, useEffect } from 'react';

import { Grid2, Typography } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';

import styles from '../ModalEditShiftForSubstitutionGroup.scss';

import { citiesByRegionKey, fetchCitiesByRegion, fetchOfficeByRegion, officesByCityKey } from '@/api/queries';
import { Office } from '@/dto/DtoApplications';
import { Cities, PaginatedResponse } from '@/dto/DtoCatalog';
import { modalEditSubstitutionGroupStore } from '@/stores/modalEditSubstitutionGroupCreateShift.store';
import { timetableStore } from '@/stores/timetable.store';

type CityAndOfficeProps = {
  isDisabled: boolean;
  isOpen: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
};

export const CityAndOffice: FC<CityAndOfficeProps> = observer(({ isOpen, onLoadingChange }) => {
  const { regionId } = timetableStore;
  const { selectedCityId, cities, selectedOffice } = modalEditSubstitutionGroupStore;

  const citiesByRegionResponse = useInfiniteQuery({
    queryKey: regionId ? citiesByRegionKey([regionId], 40) : ['cities-disabled'],
    queryFn: fetchCitiesByRegion,
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<Cities[]>) => {
      const { number, totalPages } = lastPage.page;
      return number + 1 < totalPages ? number + 1 : undefined;
    },
    enabled: isOpen && !!regionId
  });

  const officesByCityResponse = useInfiniteQuery({
    queryKey: selectedCityId ? officesByCityKey(selectedCityId, 40) : ['offices-disabled'],
    queryFn: fetchOfficeByRegion,
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<Cities[]>) => {
      const { number, totalPages } = lastPage.page;
      return number + 1 < totalPages ? number + 1 : undefined;
    },
    enabled: isOpen && !!selectedCityId
  });

  useEffect(() => {
    onLoadingChange?.(citiesByRegionResponse.isLoading || !cities);
  }, [citiesByRegionResponse.isLoading, cities, onLoadingChange]);

  useEffect(() => {
    if (citiesByRegionResponse.data) {
      const allCities = citiesByRegionResponse.data.pages.flatMap((page: PaginatedResponse<Cities[]>) => page.content);
      modalEditSubstitutionGroupStore.setCities(allCities);
    }
  }, [citiesByRegionResponse.data]);

  useEffect(() => {
    if (officesByCityResponse.data) {
      const allOffices = officesByCityResponse.data.pages.flatMap((page: PaginatedResponse<Office[]>) => page.content);
      modalEditSubstitutionGroupStore.setOfficesByCity(allOffices);
    }
  }, [officesByCityResponse.data]);

  const selectedCityName = cities?.find((city) => city.id === selectedCityId)?.name;
  const selectedOfficeName = selectedOffice?.name;

  return (
    <Grid2 container className={styles.containerInfo}>
      <Grid2 className={styles.infoRow}>
        <Typography variant="subtitle2" color="text.secondary">
          Город:
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {selectedCityName || '—'}
        </Typography>
      </Grid2>

      <Grid2 className={styles.infoRow}>
        <Typography variant="subtitle2" color="text.secondary">
          Офис:
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {selectedOfficeName || '—'}
        </Typography>
      </Grid2>
    </Grid2>
  );
});
