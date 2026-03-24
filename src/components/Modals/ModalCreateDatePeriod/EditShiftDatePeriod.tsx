import { ChangeEvent, FC } from 'react';

import { Box, Grid2, MenuItem, TextField } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { observer } from 'mobx-react-lite';

import { useModalEditDatePeriod } from '@/hooks/useModalEditDatePeriod';
import { Formats } from '@/utils/formats';

import styles from './ModalCreateDatePeriod.module.scss';
import { modalCreateStore } from '@/stores/modalCreate.store';

export const EditShiftDatePeriod: FC = observer(() => {
  const editMode = modalCreateStore.editMode;

  const handlePeriodStartChange = (newDate: Dayjs | null) => {
    if (!newDate || !newDate.isValid()) {
      modalCreateStore.setStartDate(null);
      return;
    }
    const base = modalCreateStore.startAt ?? newDate;
    const updated = newDate.hour(base.hour()).minute(base.minute()).second(0);
    modalCreateStore.setStartDate(updated);
  };

  const handlePeriodEndChange = (newDate: Dayjs | null) => {
    if (!newDate || !newDate.isValid()) {
      modalCreateStore.setEndDate(null);
      return;
    }
    const base = modalCreateStore.endAt ?? newDate;
    const updated = newDate.hour(base.hour()).minute(base.minute()).second(0);
    modalCreateStore.setEndDate(updated);
  };

  const handleDateSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = modalCreateStore.shiftIdsForSingle.find(
      ({ date }) => date.format(Formats.DATE_API) === event.target.value
    );
    if (selectedDate) {
      modalCreateStore.setShiftId(selectedDate.id);
      modalCreateStore.selectShiftDate(selectedDate.date);
    }
  };

  const handleTimeStartBlur = () => {
    if (
      modalCreateStore.startAt?.isValid() &&
      modalCreateStore.endAt?.isValid() &&
      modalCreateStore.startAt.isAfter(modalCreateStore.endAt, 'minute')
    ) {
      modalCreateStore.setShiftEndTime(modalCreateStore.startAt);
    }
  };

  const handleTimeEndBlur = () => {
    if (
      modalCreateStore.startAt?.isValid() &&
      modalCreateStore.endAt?.isValid() &&
      modalCreateStore.endAt.isBefore(modalCreateStore.startAt, 'minute')
    ) {
      modalCreateStore.setShiftStartTime(modalCreateStore.endAt);
    }
  };

  const handleStartTimeChange = (newTime: Dayjs | null) => {
    if (!newTime || !newTime.isValid()) {
      modalCreateStore.setShiftStartTime(null);
      return;
    }
    const base = modalCreateStore.startOn ?? dayjs();
    modalCreateStore.setShiftStartTime(base.hour(newTime.hour()).minute(newTime.minute()).second(0).millisecond(0));
  };

  const handleEndTimeChange = (newTime: Dayjs | null) => {
    if (!newTime || !newTime.isValid()) {
      modalCreateStore.setShiftEndTime(null);
      return;
    }
    const base = modalCreateStore.endOn ?? dayjs();
    modalCreateStore.setShiftEndTime(base.hour(newTime.hour()).minute(newTime.minute()).second(0).millisecond(0));
  };

  const handlePeriodStartBlur = () => {
    const { startOn, endOn, shiftDates } = modalCreateStore;
    if (!startOn || !startOn.isValid()) return;
    const minDate = shiftDates[0];
    const maxDate = shiftDates[shiftDates.length - 1];
    let validDate = startOn;
    if (minDate && startOn.isBefore(minDate, 'day')) {
      validDate = minDate;
    } else if (maxDate && startOn.isAfter(maxDate, 'day')) {
      validDate = maxDate;
    }
    if (!validDate.isSame(startOn, 'day')) {
      modalCreateStore.setStartDate(validDate);
    }
    if (endOn && validDate.isAfter(endOn, 'day')) {
      modalCreateStore.setEndDate(validDate);
    }
  };

  const handlePeriodEndBlur = () => {
    const { startOn, endOn, shiftDates } = modalCreateStore;
    if (!endOn || !endOn.isValid()) return;
    const minDate = shiftDates[0];
    const maxDate = shiftDates[shiftDates.length - 1];
    console.log(minDate, maxDate);
    let validDate = endOn;
    if (minDate && endOn.isBefore(minDate, 'day')) {
      validDate = minDate;
    } else if (maxDate && endOn.isAfter(maxDate, 'day')) {
      validDate = maxDate;
    }
    if (!validDate.isSame(endOn, 'day')) {
      modalCreateStore.setEndDate(validDate);
    }
    if (startOn && validDate.isBefore(startOn, 'day')) {
      modalCreateStore.setStartDate(validDate);
    }
  };

  const { datePickerProps: startPickerProps, timePickerProps: startTimePickerProps } = useModalEditDatePeriod({
    date: modalCreateStore.startOn,
    error: modalCreateStore.errors.startOn
  });

  const { datePickerProps: endPickerProps, timePickerProps: endTimePickerProps } = useModalEditDatePeriod({
    date: modalCreateStore.endOn,
    error: modalCreateStore.errors.endOn
  });

  const minDate = modalCreateStore.shiftDates[0] || null;
  const maxDate = modalCreateStore.shiftDates[modalCreateStore.shiftDates.length - 1] || null;
  return (
    <Grid2 container direction="column" spacing={2} className={styles.contentWrapper}>
      {editMode === 'single' ? (
        <Box className={styles.info}>
          <TextField
            select
            fullWidth
            label="Дата редактируемой смены"
            value={modalCreateStore.startOn?.format(Formats.DATE_API)}
            onChange={handleDateSelect}
            className={styles.shiftPicker}
          >
            {modalCreateStore.shiftIdsForSingle.map(({ date }) => (
              <MenuItem key={date.format(Formats.DATE_API)} value={date.format(Formats.DATE_API)}>
                {date.locale('ru').format(Formats.DATE_LONG)}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      ) : (
        <Grid2 container direction="row" className={styles.periodDatePickers}>
          <DatePicker
            label="Дата начала периода"
            value={modalCreateStore.startOn}
            onChange={handlePeriodStartChange}
            onAccept={handlePeriodStartBlur}
            minDate={minDate}
            maxDate={
              maxDate
                ? modalCreateStore.endOn?.isBefore(maxDate, 'day')
                  ? modalCreateStore.endOn
                  : maxDate
                : undefined
            }
            {...startPickerProps}
            slotProps={{
              ...startPickerProps.slotProps,
              textField: {
                ...startPickerProps.slotProps?.textField,
                error: !!modalCreateStore.errors.startOn,
                onBlur: handlePeriodStartBlur
              }
            }}
          />
          <DatePicker
            label="Дата конца периода"
            value={modalCreateStore.endOn}
            onChange={handlePeriodEndChange}
            onAccept={handlePeriodEndBlur}
            minDate={
              minDate
                ? modalCreateStore.startOn?.isAfter(minDate, 'day')
                  ? modalCreateStore.startOn
                  : minDate
                : undefined
            }
            maxDate={maxDate}
            {...endPickerProps}
            slotProps={{
              ...endPickerProps.slotProps,
              textField: {
                ...endPickerProps.slotProps?.textField,
                error: !!modalCreateStore.errors.endOn,
                onBlur: handlePeriodEndBlur
              }
            }}
          />
        </Grid2>
      )}
      <Grid2 container direction="row" className={styles.wrapper}>
        <TimePicker
          label="Время начала"
          value={modalCreateStore.startAt}
          onChange={handleStartTimeChange}
          onAccept={handleTimeStartBlur}
          {...startTimePickerProps}
          className={styles.timePicker}
          slotProps={{
            textField: {
              error: !!modalCreateStore.errors.startAt,
              onBlur: handleTimeStartBlur
            }
          }}
        />
        <TimePicker
          label="Время конца"
          value={modalCreateStore.endAt}
          onChange={handleEndTimeChange}
          onAccept={handleTimeEndBlur}
          {...endTimePickerProps}
          className={styles.timePicker}
          slotProps={{
            textField: {
              error: !!modalCreateStore.errors.endAt,
              onBlur: handleTimeEndBlur
            }
          }}
        />
      </Grid2>
    </Grid2>
  );
});
