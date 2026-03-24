import { FC } from 'react';

import { Grid2 } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import { observer } from 'mobx-react-lite';

import { useModalCreateDatePeriod, useModalCreateTimePeriod } from '@/hooks/useModalCreateDatePeriod';

import styles from './ModalCreateDatePeriod.module.scss';
import { modalCreateStore } from '@/stores/modalCreate.store';

const handleCreateShiftStartDateChange = (newDate: Dayjs | null) => {
  if (newDate && newDate.isValid()) {
    const updated = modalCreateStore.startOn
      ? modalCreateStore.startOn.year(newDate.year()).month(newDate.month()).date(newDate.date())
      : newDate;
    modalCreateStore.setStartDate(updated);
  } else {
    modalCreateStore.setStartDate(null);
  }
};

const handleCreateShiftStartTimeChange = (newTime: Dayjs | null) => {
  if (newTime && newTime.isValid()) {
    const updated = modalCreateStore.startOn
      ? modalCreateStore.startOn.hour(newTime.hour()).minute(newTime.minute()).second(0)
      : newTime;
    modalCreateStore.setShiftStartTime(updated);
  } else {
    modalCreateStore.setShiftStartTime(null);
  }
};

const handleCreateShiftEndDateChange = (newDate: Dayjs | null) => {
  if (newDate && newDate.isValid()) {
    const updated = modalCreateStore.endOn
      ? modalCreateStore.endOn.year(newDate.year()).month(newDate.month()).date(newDate.date())
      : newDate;
    modalCreateStore.setEndDate(updated);
  } else {
    modalCreateStore.setEndDate(null);
  }
};

const handleCreateShiftEndTimeChange = (newTime: Dayjs | null) => {
  if (newTime && newTime.isValid()) {
    const updated = modalCreateStore.endOn
      ? modalCreateStore.endOn.hour(newTime.hour()).minute(newTime.minute()).second(0)
      : newTime;
    modalCreateStore.setShiftEndTime(updated);
  } else {
    modalCreateStore.setShiftEndTime(null);
  }
};

const handleCreateShiftStartBlur = () => {
  if (
    modalCreateStore.startOn?.isValid() &&
    modalCreateStore.endOn?.isValid() &&
    modalCreateStore.startOn.isAfter(modalCreateStore.endOn)
  ) {
    modalCreateStore.setEndDate(modalCreateStore.startOn);
  }
};

const handleCreateShiftEndBlur = () => {
  if (
    modalCreateStore.startOn?.isValid() &&
    modalCreateStore.endOn?.isValid() &&
    modalCreateStore.endOn.isBefore(modalCreateStore.startOn)
  ) {
    modalCreateStore.setStartDate(modalCreateStore.endOn);
  }
};

const handleCreateShiftStartTimeBlur = () => {
  const start = modalCreateStore.startAt;
  const end = modalCreateStore.endAt;
  if (!start?.isValid() || !end?.isValid()) return;
  const startMinutes = start.hour() * 60 + start.minute();
  const endMinutes = end.hour() * 60 + end.minute();
  if (startMinutes >= endMinutes) {
    const correctedEnd = end.hour(start.hour()).minute(start.minute()).second(0);
    modalCreateStore.setShiftEndTime(correctedEnd);
  }
};

const handleCreateShiftEndTimeBlur = () => {
  const start = modalCreateStore.startAt;
  const end = modalCreateStore.endAt;
  if (!start?.isValid() || !end?.isValid()) return;
  const startMinutes = start.hour() * 60 + start.minute();
  const endMinutes = end.hour() * 60 + end.minute();
  if (endMinutes <= startMinutes) {
    const correctedStart = start.hour(end.hour()).minute(end.minute()).second(0);
    modalCreateStore.setShiftStartTime(correctedStart);
  }
};

export const CreateShiftDatePeriod: FC = observer(() => {
  const startDatePickerProps = useModalCreateDatePeriod({
    date: modalCreateStore.startOn,
    error: modalCreateStore.errors.startOn
  });

  const endDatePickerProps = useModalCreateDatePeriod({
    date: modalCreateStore.endOn,
    error: modalCreateStore.errors.endOn
  });

  const startTimePickerProps = useModalCreateTimePeriod({
    date: modalCreateStore.startOn,
    time: modalCreateStore.startAt,
    error: modalCreateStore.errors.startAt
  });

  const endTimePickerProps = useModalCreateTimePeriod({
    date: modalCreateStore.endOn,
    time: modalCreateStore.endAt,
    error: modalCreateStore.errors.endAt
  });
  return (
    <Grid2 container direction="row" className={styles.wrapperTime}>
      <DatePicker
        label="Дата начала"
        value={modalCreateStore.startOn}
        onChange={handleCreateShiftStartDateChange}
        {...startDatePickerProps}
        className={styles.datePicker}
        slotProps={{
          textField: {
            error: !!modalCreateStore.errors.startOn,
            onBlur: handleCreateShiftStartBlur
          }
        }}
      />

      <DatePicker
        label="Дата конца"
        value={modalCreateStore.endOn}
        onChange={handleCreateShiftEndDateChange}
        minDate={modalCreateStore.startOn || undefined}
        {...endDatePickerProps}
        className={styles.datePicker}
        slotProps={{
          textField: {
            error: !!modalCreateStore.errors.endOn,
            onBlur: handleCreateShiftEndBlur
          }
        }}
      />

      <TimePicker
        label="Время начала"
        value={modalCreateStore.startAt}
        onChange={handleCreateShiftStartTimeChange}
        className={styles.datePicker}
        {...startTimePickerProps}
        slotProps={{
          textField: {
            error: !!modalCreateStore.errors.startAt,
            onBlur: handleCreateShiftStartTimeBlur
          }
        }}
      />

      <TimePicker
        label="Время конца"
        value={modalCreateStore.endAt}
        onChange={handleCreateShiftEndTimeChange}
        className={styles.datePicker}
        {...endTimePickerProps}
        slotProps={{
          textField: {
            error: !!modalCreateStore.errors.endAt,
            onBlur: handleCreateShiftEndTimeBlur
          }
        }}
      />
    </Grid2>
  );
});
