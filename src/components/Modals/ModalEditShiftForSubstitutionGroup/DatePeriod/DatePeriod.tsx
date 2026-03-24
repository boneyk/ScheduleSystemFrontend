import { ChangeEvent, FC, useEffect } from 'react';

import { Box, FormControlLabel, Grid2, MenuItem, Switch, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { observer } from 'mobx-react-lite';

import { useModalEditSubstitutionDatePeriod } from '@/hooks/useModalEditSubstitutionDatePeriod';
import { Formats } from '@/utils/formats';

import styles from '../DatePeriod/DatePeriod.scss';

import { fetchWorkingHours, workingHoursKey } from '@/api/queries';
import { modalEditSubstitutionGroupStore } from '@/stores/modalEditSubstitutionGroupCreateShift.store';

export const DatePeriod: FC = observer(() => {
  const { selectedOffice, workingHoursBySelectedOffice } = modalEditSubstitutionGroupStore;

  const officeTimetable = useQuery({
    queryKey: selectedOffice?.id ? workingHoursKey(selectedOffice.id) : ['officesWorkingHours-disabled'],
    queryFn: fetchWorkingHours,
    enabled: !!selectedOffice
  });

  useEffect(() => {
    if (officeTimetable.data) modalEditSubstitutionGroupStore.setWorkingHours(officeTimetable.data);
  }, [officeTimetable.data, officeTimetable.isSuccess]);

  const handleDateStartBlur = () => {
    const { startOn, endOn, shiftDates } = modalEditSubstitutionGroupStore;
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
      modalEditSubstitutionGroupStore.setStartDate(validDate);
    }
    if (endOn && validDate.isAfter(endOn, 'day')) {
      modalEditSubstitutionGroupStore.setEndDate(validDate);
    }
  };

  const handleDateEndBlur = () => {
    const { startOn, endOn, shiftDates } = modalEditSubstitutionGroupStore;
    if (!endOn || !endOn.isValid()) return;
    const minDate = shiftDates[0];
    const maxDate = shiftDates[shiftDates.length - 1];
    let validDate = endOn;
    if (minDate && endOn.isBefore(minDate, 'day')) {
      validDate = minDate;
    } else if (maxDate && endOn.isAfter(maxDate, 'day')) {
      validDate = maxDate;
    }
    if (!validDate.isSame(endOn, 'day')) {
      modalEditSubstitutionGroupStore.setEndDate(validDate);
    }
    if (startOn && validDate.isBefore(startOn, 'day')) {
      modalEditSubstitutionGroupStore.setStartDate(validDate);
    }
  };

  const handleTimeStartBlur = () => {
    const { startAt, endAt } = modalEditSubstitutionGroupStore;
    if (startAt?.isValid() && endAt?.isValid() && startAt.isAfter(endAt)) {
      modalEditSubstitutionGroupStore.setShiftEndTime(startAt);
    }
  };

  const handleTimeEndBlur = () => {
    const { startAt, endAt } = modalEditSubstitutionGroupStore;
    if (startAt?.isValid() && endAt?.isValid() && endAt.isBefore(startAt)) {
      modalEditSubstitutionGroupStore.setShiftStartTime(endAt);
    }
  };

  const handleStartTimeChange = (newTime: Dayjs | null) => {
    if (!newTime) {
      modalEditSubstitutionGroupStore.setShiftStartTime(null);
      return;
    }
    const base = modalEditSubstitutionGroupStore.startOn ?? dayjs();
    modalEditSubstitutionGroupStore.setShiftStartTime(
      base.hour(newTime.hour()).minute(newTime.minute()).second(0).millisecond(0)
    );
  };

  const handleEndTimeChange = (newTime: Dayjs | null) => {
    if (!newTime) {
      modalEditSubstitutionGroupStore.setShiftEndTime(null);
      return;
    }
    const base = modalEditSubstitutionGroupStore.endOn ?? dayjs();
    modalEditSubstitutionGroupStore.setShiftEndTime(base.hour(newTime.hour()).minute(newTime.minute()).second(0));
  };

  const handlePeriodStartChange = (newDate: Dayjs | null) => {
    if (newDate) modalEditSubstitutionGroupStore.setStartDate(newDate);
  };

  const handlePeriodEndChange = (newDate: Dayjs | null) => {
    if (newDate) modalEditSubstitutionGroupStore.setEndDate(newDate);
  };

  const { timePickerProps: startTimePickerProps, datePickerProps: startDatePickerProps } =
    useModalEditSubstitutionDatePeriod({
      date: modalEditSubstitutionGroupStore.startOn,
      error: modalEditSubstitutionGroupStore.errors.startOn,
      workingHoursBySelectedOffice
    });

  const { timePickerProps: endTimePickerProps, datePickerProps: endDatePickerProps } =
    useModalEditSubstitutionDatePeriod({
      date: modalEditSubstitutionGroupStore.endOn,
      error: modalEditSubstitutionGroupStore.errors.endOn,
      workingHoursBySelectedOffice
    });

  const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const mode = event.target.checked ? 'period' : 'single';
    modalEditSubstitutionGroupStore.setEditMode(mode);
    if (mode === 'period' && modalEditSubstitutionGroupStore.shiftDates.length > 0) {
      const firstDate = modalEditSubstitutionGroupStore.shiftDates[0];
      const lastDate =
        modalEditSubstitutionGroupStore.shiftDates[modalEditSubstitutionGroupStore.shiftDates.length - 1];
      const startTime = modalEditSubstitutionGroupStore.startOn;
      const endTime = modalEditSubstitutionGroupStore.endOn;
      modalEditSubstitutionGroupStore.setStartDate(
        startTime ? firstDate.hour(startTime.hour()).minute(startTime.minute()).second(0) : firstDate
      );
      modalEditSubstitutionGroupStore.setEndDate(
        endTime ? lastDate.hour(endTime.hour()).minute(endTime.minute()).second(0) : lastDate
      );
    }
  };

  const handleDateSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (!shiftData?.isCombined) {
      const selectedDate = modalEditSubstitutionGroupStore.shiftIdsForSingle.find(
        ({ id }) => id === Number(event.target.value)
      );
      if (selectedDate) {
        modalEditSubstitutionGroupStore.setShiftId(selectedDate.id);
        modalEditSubstitutionGroupStore.selectShiftDate(selectedDate.date);
      }
    }
  };

  const { startAt, endAt, startOn, endOn, shiftDates, editMode, shiftData, shiftId } = modalEditSubstitutionGroupStore;
  const needPeriod = shiftDates.length > 1;
  const minDate = shiftDates.length > 0 ? shiftDates[0] : undefined;
  const maxDate = shiftDates.length > 0 ? shiftDates[shiftDates.length - 1] : undefined;
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      {needPeriod && (
        <FormControlLabel
          control={<Switch checked={editMode === 'period'} onChange={handleModeChange} size="small" />}
          label="Редактировать период смен"
          className={styles.editModeControl}
        />
      )}
      <Grid2 container direction="column" spacing={2} className={styles.contentWrapper}>
        {editMode === 'single' ? (
          <Box className={styles.info}>
            <TextField
              select
              fullWidth
              label="Дата редактируемой смены"
              value={shiftId}
              onChange={handleDateSelect}
              className={styles.shiftPicker}
            >
              {shiftData?.isCombined === undefined ? (
                modalEditSubstitutionGroupStore.shiftIdsForSingle.map(({ id, date }) => (
                  <MenuItem key={id} value={id}>
                    {date.locale('ru').format(Formats.DATE_LONG)}
                  </MenuItem>
                ))
              ) : (
                <MenuItem key={`CombinedShift-${shiftId}`} value={shiftId ?? ''}>
                  {dayjs(shiftData?.startOn, Formats.DATE_SHORT).locale('ru').format(Formats.DATE_LONG)}
                </MenuItem>
              )}
            </TextField>
          </Box>
        ) : (
          <Grid2 container direction="row" className={styles.periodDatePickers}>
            <DatePicker
              label="Дата начала периода"
              value={startOn}
              onChange={handlePeriodStartChange}
              onAccept={handleDateStartBlur}
              minDate={minDate}
              maxDate={endOn && endOn.isBefore(maxDate, 'day') ? endOn : maxDate}
              {...startDatePickerProps}
              slotProps={{
                textField: {
                  error: !!modalEditSubstitutionGroupStore.errors.startOn,
                  onBlur: handleDateStartBlur
                }
              }}
            />
            <DatePicker
              label="Дата конца периода"
              value={endOn}
              onChange={handlePeriodEndChange}
              onAccept={handleDateEndBlur}
              minDate={startOn && startOn.isAfter(minDate, 'day') ? startOn : minDate}
              maxDate={maxDate}
              {...endDatePickerProps}
              slotProps={{
                textField: {
                  error: !!modalEditSubstitutionGroupStore.errors.endOn,
                  onBlur: handleDateEndBlur
                }
              }}
            />
          </Grid2>
        )}

        <Grid2 container direction="row" className={styles.wrapper}>
          <TimePicker
            label="Время начала"
            value={startAt}
            onChange={handleStartTimeChange}
            onAccept={handleTimeStartBlur}
            {...startTimePickerProps}
            className={styles.timePicker}
            slotProps={{
              textField: {
                onBlur: handleTimeStartBlur,
                error: !!modalEditSubstitutionGroupStore.errors.startAt
              }
            }}
          />
          <TimePicker
            label="Время конца"
            value={endAt}
            onChange={handleEndTimeChange}
            onAccept={handleTimeEndBlur}
            {...endTimePickerProps}
            className={styles.timePicker}
            slotProps={{
              textField: {
                onBlur: handleTimeEndBlur,
                error: !!modalEditSubstitutionGroupStore.errors.endAt
              }
            }}
          />
        </Grid2>
      </Grid2>
    </LocalizationProvider>
  );
});
