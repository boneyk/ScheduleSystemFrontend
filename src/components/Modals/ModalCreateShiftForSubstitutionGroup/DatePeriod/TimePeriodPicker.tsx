import { FC } from 'react';

import { Grid2 } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Dayjs } from 'dayjs';
import { observer } from 'mobx-react-lite';

import { useModalSubsititutionGroupDatePeriod } from '@/hooks/useModalSubtitutionGroupDatePeriod';

import styles from '../DatePeriod/DatePeriod.scss';

import { modalCreateSubstitutionGroupCreateShift } from '@/stores/modalCreateSubstitutionGroupCreateShift.store';

type ModalCreateTimePeriodProps = {
  defaultStartDate?: Dayjs | null;
};

const handleCreateShiftStartChange = (newTime: Dayjs | null) => {
  if (newTime?.isValid()) {
    modalCreateSubstitutionGroupCreateShift.setShiftStartTime(newTime);
  } else {
    modalCreateSubstitutionGroupCreateShift.setShiftStartTime(null);
  }
};

const handleCreateShiftEndChange = (newTime: Dayjs | null) => {
  if (newTime?.isValid()) {
    modalCreateSubstitutionGroupCreateShift.setShiftEndTime(newTime);
  } else {
    modalCreateSubstitutionGroupCreateShift.setShiftEndTime(null);
  }
};

const handleStartBlur = () => {
  const { startAt, endAt } = modalCreateSubstitutionGroupCreateShift;
  if (startAt?.isValid() && endAt?.isValid() && startAt.isAfter(endAt, 'minute')) {
    modalCreateSubstitutionGroupCreateShift.setShiftEndTime(startAt);
  }
};

const handleEndBlur = () => {
  const { startAt, endAt } = modalCreateSubstitutionGroupCreateShift;
  if (startAt?.isValid() && endAt?.isValid() && endAt.isBefore(startAt, 'minute')) {
    modalCreateSubstitutionGroupCreateShift.setShiftStartTime(endAt);
  }
};

export const TimePeriodPicker: FC<ModalCreateTimePeriodProps> = observer(() => {
  const startPickerProps = useModalSubsititutionGroupDatePeriod({
    date: modalCreateSubstitutionGroupCreateShift.startOn,
    error: modalCreateSubstitutionGroupCreateShift.errors.startAt,
    workingHoursBySelectedOffice: modalCreateSubstitutionGroupCreateShift.workingHoursBySelectedOffice,
    selectedOffice: modalCreateSubstitutionGroupCreateShift.selectedOffice
  });

  const endPickerProps = useModalSubsititutionGroupDatePeriod({
    date: modalCreateSubstitutionGroupCreateShift.endOn,
    error: modalCreateSubstitutionGroupCreateShift.errors.endAt,
    workingHoursBySelectedOffice: modalCreateSubstitutionGroupCreateShift.workingHoursBySelectedOffice,
    selectedOffice: modalCreateSubstitutionGroupCreateShift.selectedOffice
  });

  return (
    <Grid2 direction="row" className={styles.wrapperTime}>
      <TimePicker
        label="Время начала смены"
        value={modalCreateSubstitutionGroupCreateShift.startAt}
        onChange={handleCreateShiftStartChange}
        onAccept={handleStartBlur}
        {...startPickerProps}
        slotProps={{
          textField: {
            error: !!modalCreateSubstitutionGroupCreateShift.errors.startAt,
            fullWidth: true,
            onBlur: handleStartBlur
          }
        }}
      />

      <TimePicker
        label="Время конца смены"
        value={modalCreateSubstitutionGroupCreateShift.endAt}
        onChange={handleCreateShiftEndChange}
        onAccept={handleEndBlur}
        {...endPickerProps}
        slotProps={{
          textField: {
            error: !!modalCreateSubstitutionGroupCreateShift.errors.endAt,
            fullWidth: true,
            onBlur: handleEndBlur
          }
        }}
      />
    </Grid2>
  );
});
