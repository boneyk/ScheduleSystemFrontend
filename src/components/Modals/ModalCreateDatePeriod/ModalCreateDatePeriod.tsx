import { ChangeEvent, FC, useEffect } from 'react';

import { FormControlLabel, Grid2, Switch } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import { observer } from 'mobx-react-lite';
import { modalCreateStore } from 'stores/modalCreate.store';

import { CreateAbsenceDatePeriod } from '@/components/Modals/ModalCreateDatePeriod/CreateAbsenceDatePeriod';

import { CreateShiftDatePeriod } from './CreateShiftDatePeriod';
import { EditShiftDatePeriod } from './EditShiftDatePeriod';
import styles from './ModalCreateDatePeriod.module.scss';
import { ModalCreateMode } from '@/types/schedule';

dayjs.locale('ru');

type ModalCreateDatePeriodProps = {
  mode: ModalCreateMode;
  defaultStartDate?: Dayjs | null;
};

export const ModalCreateDatePeriod: FC<ModalCreateDatePeriodProps> = observer(
  ({ mode = 'shift', defaultStartDate = null }) => {
    const editMode = modalCreateStore.editMode;

    useEffect(() => {
      if (defaultStartDate) {
        modalCreateStore.setStartDate(defaultStartDate);
        modalCreateStore.setEndDate(defaultStartDate);
      }
    }, [defaultStartDate]);

    const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
      const mode = event.target.checked ? 'period' : 'single';
      modalCreateStore.setEditMode(mode);
      if (mode === 'period' && modalCreateStore.shiftDates.length > 0) {
        const firstDate = modalCreateStore.shiftDates[0];
        const lastDate = modalCreateStore.shiftDates[modalCreateStore.shiftDates.length - 1];
        const startTime = modalCreateStore.startOn;
        const endTime = modalCreateStore.endOn;
        modalCreateStore.setStartDate(
          startTime ? firstDate.hour(startTime.hour()).minute(startTime.minute()).second(0) : firstDate
        );
        modalCreateStore.setEndDate(
          endTime ? lastDate.hour(endTime.hour()).minute(endTime.minute()).second(0) : lastDate
        );
      }
    };

    const needPeriod = mode === 'edit' && modalCreateStore.shiftDates.length > 1;
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        {needPeriod && (
          <FormControlLabel
            control={<Switch checked={editMode === 'period'} onChange={handleModeChange} size="small" />}
            label="Редактировать период смен"
            className={styles.editModeControl}
          />
        )}
        <Grid2 spacing={2} className={styles.datePeriod}>
          {mode === 'absence' ? (
            <CreateAbsenceDatePeriod />
          ) : mode === 'edit' ? (
            <EditShiftDatePeriod />
          ) : (
            <CreateShiftDatePeriod />
          )}
        </Grid2>
      </LocalizationProvider>
    );
  }
);
