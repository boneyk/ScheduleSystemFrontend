import { FC } from 'react';

import { Grid2 } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import { observer } from 'mobx-react-lite';

import { useModalSubsititutionGroupDatePeriod } from '@/hooks/useModalSubtitutionGroupDatePeriod';

import styles from '../DatePeriod/DatePeriod.scss';

import { modalCreateSubstitutionGroupCreateShift } from '@/stores/modalCreateSubstitutionGroupCreateShift.store';

type ModalCreateDatePeriodProps = {
  defaultStartDate?: Dayjs | null;
};

const handleCreateShiftStartChange = (newDate: Dayjs | null) => {
  if (newDate?.isValid()) {
    modalCreateSubstitutionGroupCreateShift.setStartDate(newDate);
  } else {
    modalCreateSubstitutionGroupCreateShift.setStartDate(null);
  }
};

const handleCreateShiftEndChange = (newDate: Dayjs | null) => {
  if (newDate?.isValid()) {
    modalCreateSubstitutionGroupCreateShift.setEndDate(newDate);
  } else {
    modalCreateSubstitutionGroupCreateShift.setEndDate(null);
  }
};
const handleCreateShiftStartBlur = () => {
  if (
    modalCreateSubstitutionGroupCreateShift.startOn?.isValid() &&
    modalCreateSubstitutionGroupCreateShift.endOn?.isValid() &&
    modalCreateSubstitutionGroupCreateShift.startOn.isAfter(modalCreateSubstitutionGroupCreateShift.endOn)
  ) {
    modalCreateSubstitutionGroupCreateShift.setEndDate(modalCreateSubstitutionGroupCreateShift.startOn);
  }
};

const handleCreateShiftEndBlur = () => {
  if (
    modalCreateSubstitutionGroupCreateShift.startOn?.isValid() &&
    modalCreateSubstitutionGroupCreateShift.endOn?.isValid() &&
    modalCreateSubstitutionGroupCreateShift.endOn.isBefore(modalCreateSubstitutionGroupCreateShift.startOn)
  ) {
    modalCreateSubstitutionGroupCreateShift.setStartDate(modalCreateSubstitutionGroupCreateShift.endOn);
  }
};

export const DatePeriodPicker: FC<ModalCreateDatePeriodProps> = observer(() => {
  const { selectedOffice, workingHoursBySelectedOffice } = modalCreateSubstitutionGroupCreateShift;

  const startPickerProps = useModalSubsititutionGroupDatePeriod({
    date: modalCreateSubstitutionGroupCreateShift.startOn,
    error: modalCreateSubstitutionGroupCreateShift.errors.startOn,
    workingHoursBySelectedOffice,
    selectedOffice
  });

  const endPickerProps = useModalSubsititutionGroupDatePeriod({
    date: modalCreateSubstitutionGroupCreateShift.endOn,
    error: modalCreateSubstitutionGroupCreateShift.errors.endOn,
    workingHoursBySelectedOffice,
    selectedOffice
  });
  return (
    <Grid2 direction="row" className={styles.wrapperTime}>
      <DatePicker
        label="Дата начала смены"
        value={modalCreateSubstitutionGroupCreateShift.startOn}
        onChange={handleCreateShiftStartChange}
        onAccept={handleCreateShiftStartBlur}
        {...startPickerProps}
        slotProps={{
          textField: {
            error: !!modalCreateSubstitutionGroupCreateShift.errors.startOn,
            onBlur: handleCreateShiftStartBlur,
            fullWidth: true
          }
        }}
      />
      <DatePicker
        label="Дата конца смены"
        value={modalCreateSubstitutionGroupCreateShift.endOn}
        onChange={handleCreateShiftEndChange}
        onAccept={handleCreateShiftEndBlur}
        minDate={modalCreateSubstitutionGroupCreateShift.startOn || undefined}
        {...endPickerProps}
        slotProps={{
          textField: {
            error: !!modalCreateSubstitutionGroupCreateShift.errors.endOn,
            onBlur: handleCreateShiftEndBlur,
            fullWidth: true
          }
        }}
      />
    </Grid2>
  );
});
