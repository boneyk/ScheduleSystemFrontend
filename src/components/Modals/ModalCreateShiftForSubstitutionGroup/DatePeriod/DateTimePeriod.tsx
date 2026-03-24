import { FC, useEffect } from 'react';

import { Grid2 } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { observer } from 'mobx-react-lite';

import { DatePeriodPicker } from './DatePeiodPicker';
import { TimePeriodPicker } from './TimePeriodPicker';
import { fetchWorkingHours, workingHoursKey } from '@/api/queries';
import { modalCreateSubstitutionGroupCreateShift } from '@/stores/modalCreateSubstitutionGroupCreateShift.store';

dayjs.locale('ru');

type ModalCreateDateTimePeriodProps = {
  defaultStartDate?: dayjs.Dayjs | null;
};

export const DateTimePeriod: FC<ModalCreateDateTimePeriodProps> = observer(() => {
  const { selectedOffice } = modalCreateSubstitutionGroupCreateShift;

  const officeTimetable = useQuery({
    queryKey: selectedOffice?.id ? workingHoursKey(selectedOffice?.id) : ['officesWorkingHours-disabled'],
    queryFn: fetchWorkingHours,
    enabled: !!selectedOffice
  });

  useEffect(() => {
    if (officeTimetable.data) modalCreateSubstitutionGroupCreateShift.setWorkingHours(officeTimetable.data);
  }, [officeTimetable.data, officeTimetable.isSuccess]);

  useEffect(() => {
    if (!selectedOffice) {
      modalCreateSubstitutionGroupCreateShift.setStartDate(null);
      modalCreateSubstitutionGroupCreateShift.setEndDate(null);
      modalCreateSubstitutionGroupCreateShift.setWorkingHours(null);
    }
  }, [selectedOffice]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Grid2 container direction="column" spacing={2}>
        <DatePeriodPicker />
        <TimePeriodPicker />
      </Grid2>
    </LocalizationProvider>
  );
});
