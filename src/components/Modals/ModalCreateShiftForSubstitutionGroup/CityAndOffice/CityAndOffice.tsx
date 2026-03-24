import { FC, SyntheticEvent, useCallback, useEffect } from 'react';

import { Autocomplete, Grid2, MenuItem, TextField } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';

import styles from '../ModalCreateShiftForSubstitutionGroup.scss';

import { citiesByRegionKey, fetchCitiesByRegion, fetchOfficeByRegion, officesByCityKey } from '@/api/queries';
import { Cities } from '@/dto/DtoCatalog';
import { Office, PaginatedResponse } from '@/dto/DtoOffice';
import { modalCreateSubstitutionGroupCreateShift } from '@/stores/modalCreateSubstitutionGroupCreateShift.store';
import { timetableStore } from '@/stores/timetable.store';

type CityAndOfficeProps = {
  isDisabled: boolean;
  isOpen: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
};

export const CityAndOffice: FC<CityAndOfficeProps> = observer(({ isDisabled, isOpen, onLoadingChange }) => {
  const { regionId } = timetableStore;
  const {
    selectedCityId,
    setSelectedCityId,
    cities,
    officesByCity,
    selectedOffice,
    setSelectedOffice,
    setOfficesByCity
  } = modalCreateSubstitutionGroupCreateShift;

  const citiesByRegionResponse = useInfiniteQuery({
    queryKey: regionId ? citiesByRegionKey([regionId], 20) : ['cities-disabled'],
    queryFn: fetchCitiesByRegion,
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<Cities[]>) => {
      const { number, totalPages } = lastPage.page;
      return number + 1 < totalPages ? number + 1 : undefined;
    },
    enabled: isOpen && !!regionId
  });

  const officesByCityResponse = useInfiniteQuery({
    queryKey: selectedCityId ? officesByCityKey(selectedCityId, 20) : ['offices-disabled'],
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
      modalCreateSubstitutionGroupCreateShift.setCities(allCities);
    }
  }, [citiesByRegionResponse.data]);

  useEffect(() => {
    if (officesByCityResponse.data) {
      const allOffices = officesByCityResponse.data.pages.flatMap((page: PaginatedResponse<Office[]>) => page.content);
      modalCreateSubstitutionGroupCreateShift.setOfficesByCity(allOffices);
    }
  }, [officesByCityResponse.data]);

  const handleCitiesScroll = useCallback(
    (event: React.UIEvent<HTMLUListElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      if (isNearBottom && citiesByRegionResponse.hasNextPage && !citiesByRegionResponse.isFetchingNextPage) {
        citiesByRegionResponse.fetchNextPage();
      }
    },
    [citiesByRegionResponse]
  );

  const getOptionLabel = (option: { id: number; name: string }) => option.name;
  const isOptionEqualToValue = (option: { id: number; name: string }, value: { id: number; name: string }) =>
    option.name === value.name;
  const onCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCityId(Number(event.target.value));
    setSelectedOffice(null);
    setOfficesByCity(null);
  };
  const onOfficeChange = (_event: SyntheticEvent<Element, Event>, value: { id: number; name: string } | null) => {
    setSelectedOffice(value);
  };

  const cityLabel = !isDisabled ? 'Выберите город' : 'Город:';
  const officeLabel = !isDisabled ? 'Выберите офис' : 'Офис:';
  if (!cities) return;
  return (
    <Grid2 container spacing={1} alignItems="center" className={styles.container}>
      <TextField
        select
        label={cityLabel}
        value={selectedCityId}
        onChange={onCityChange}
        fullWidth
        SelectProps={{
          MenuProps: {
            PaperProps: {
              onScroll: handleCitiesScroll
            }
          }
        }}
      >
        {cities.map((city) => (
          <MenuItem key={city.id} value={city.id}>
            {city.name}
          </MenuItem>
        ))}
      </TextField>

      <Autocomplete
        options={officesByCity ?? []}
        value={selectedOffice}
        onChange={onOfficeChange}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        noOptionsText="Нет офисов"
        disabled={!selectedCityId}
        renderInput={(params) => (
          <TextField {...params} label={officeLabel} placeholder="Начните вводить офис" className={styles.picker} />
        )}
        fullWidth
      />
    </Grid2>
  );
});
