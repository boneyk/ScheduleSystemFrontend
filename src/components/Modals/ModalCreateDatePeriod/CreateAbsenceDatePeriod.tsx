import { FC } from 'react';

import { Grid2 } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import { observer } from 'mobx-react-lite';

import { useOfficeDatePicker } from '@/hooks/useModalCreateAbsenceDatePeriod';

import styles from './ModalCreateDatePeriod.module.scss';
import { modalCreateAbsenceStore } from '@/stores/modalCreateAbsence.store';

export const CreateAbsenceDatePeriod: FC = observer(() => {
  const datePickerPropsStart = useOfficeDatePicker(modalCreateAbsenceStore.errors.startOn);
  const datePickerPropsEnd = useOfficeDatePicker(modalCreateAbsenceStore.errors.endOn);

  const handleCreateAbsenceStartChange = (newDate: Dayjs | null) => {
    if (newDate && newDate.isValid()) {
      modalCreateAbsenceStore.setStartDate(newDate);
    } else {
      modalCreateAbsenceStore.setStartDate(null);
    }
  };

  const handleCreateAbsenceEndChange = (newDate: Dayjs | null) => {
    if (newDate && newDate.isValid()) {
      modalCreateAbsenceStore.setEndDate(newDate);
    } else {
      modalCreateAbsenceStore.setEndDate(null);
    }
  };

  const handleAbsenceStartBlur = () => {
    if (
      modalCreateAbsenceStore.startOn?.isValid() &&
      modalCreateAbsenceStore.endOn?.isValid() &&
      modalCreateAbsenceStore.startOn.isAfter(modalCreateAbsenceStore.endOn, 'day')
    ) {
      modalCreateAbsenceStore.setEndDate(modalCreateAbsenceStore.startOn);
    }
  };

  const handleAbsenceEndBlur = () => {
    if (
      modalCreateAbsenceStore.startOn?.isValid() &&
      modalCreateAbsenceStore.endOn?.isValid() &&
      modalCreateAbsenceStore.endOn.isBefore(modalCreateAbsenceStore.startOn, 'day')
    ) {
      modalCreateAbsenceStore.setStartDate(modalCreateAbsenceStore.endOn);
    }
  };
  return (
    <Grid2 container direction="row" className={styles.wrapperTime}>
      <DatePicker
        label="Дата начала"
        value={modalCreateAbsenceStore.startOn}
        onChange={handleCreateAbsenceStartChange}
        onAccept={handleAbsenceStartBlur}
        {...datePickerPropsStart}
        className={styles.datePicker}
        slotProps={{
          textField: {
            error: !!modalCreateAbsenceStore.errors.startOn,
            onBlur: handleAbsenceStartBlur
          }
        }}
      />
      <DatePicker
        label="Дата окончания"
        value={modalCreateAbsenceStore.endOn}
        onChange={handleCreateAbsenceEndChange}
        onAccept={handleAbsenceEndBlur}
        minDate={modalCreateAbsenceStore.startOn ?? undefined}
        {...datePickerPropsEnd}
        className={styles.datePicker}
        slotProps={{
          textField: {
            error: !!modalCreateAbsenceStore.errors.endOn,
            onBlur: handleAbsenceEndBlur
          }
        }}
      />
    </Grid2>
  );
});
