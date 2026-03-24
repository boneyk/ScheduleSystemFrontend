import { FC, useState } from 'react';

import { Grid2, MenuItem, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { observer } from 'mobx-react-lite';

import styles from '@/components/Modals/ModalCreateSubstitution/ModalCreateSubtitution.module.scss';

import { useModalCreateSubsititutionDatePeriod } from '@/hooks/useModalCreateSubsititutionDatePeriod';

import { PositionsDTO } from '@/dto/DtoEmployeesService';
import { modalCreateApplicationStore } from '@/stores/modalCreateApplication.store';

interface SlotCardProps {
  roles: PositionsDTO[];
}

export const SlotCard: FC<SlotCardProps> = observer(({ roles }) => {
  const { datePickerConfig, timePickerConfig } = useModalCreateSubsititutionDatePeriod({
    date: modalCreateApplicationStore.date
  });

  const [touched, setTouched] = useState({
    date: false,
    startAt: false,
    endAt: false,
    role: false
  });

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTouched((prev) => ({ ...prev, role: true }));
    modalCreateApplicationStore.setRole(Number(e.target.value));
  };

  const handleDateChange = (newDate: Dayjs | null) => {
    if (!newDate || !newDate.isValid()) {
      modalCreateApplicationStore.setDate(null);
      return;
    }
    modalCreateApplicationStore.setDate(newDate.startOf('day'));
  };

  const handleStartTimeChange = (newTime: Dayjs | null) => {
    if (!newTime || !newTime.isValid()) {
      modalCreateApplicationStore.setStartTime(null);
      return;
    }
    modalCreateApplicationStore.setStartTime(newTime);
  };

  const handleEndTimeChange = (newTime: Dayjs | null) => {
    if (!newTime || !newTime.isValid()) {
      modalCreateApplicationStore.setEndTime(null);
      return;
    }
    modalCreateApplicationStore.setEndTime(newTime);
  };

  const handleDateBlur = () => {
    setTouched((prev) => ({ ...prev, date: true }));
    if (modalCreateApplicationStore.date && !modalCreateApplicationStore.date.isValid()) {
      modalCreateApplicationStore.setDate(null);
    }
  };

  const handleStartTimeBlur = () => {
    setTouched((prev) => ({ ...prev, startAt: true }));
    if (!modalCreateApplicationStore.startAt?.isValid() || !modalCreateApplicationStore.endAt?.isValid()) return;
    if (modalCreateApplicationStore.startAt.isAfter(modalCreateApplicationStore.endAt, 'minute')) {
      modalCreateApplicationStore.setEndTime(modalCreateApplicationStore.startAt);
    }
  };

  const handleEndTimeBlur = () => {
    setTouched((prev) => ({ ...prev, endAt: true }));
    if (!modalCreateApplicationStore.startAt?.isValid() || !modalCreateApplicationStore.endAt?.isValid()) return;
    if (modalCreateApplicationStore.endAt.isBefore(modalCreateApplicationStore.startAt, 'minute')) {
      modalCreateApplicationStore.setStartTime(modalCreateApplicationStore.endAt);
    }
  };
  return (
    <Grid2>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <Grid2 container className={styles.wrapperTime}>
          <DatePicker
            label="Дата"
            value={modalCreateApplicationStore.date}
            onChange={handleDateChange}
            onAccept={handleDateBlur}
            {...datePickerConfig}
            slotProps={{
              textField: {
                error: touched.date && !!modalCreateApplicationStore.errors.date,
                onBlur: handleDateBlur
              }
            }}
          />

          <TimePicker
            label="Время начала"
            value={modalCreateApplicationStore.startAt}
            onChange={handleStartTimeChange}
            onAccept={handleStartTimeBlur}
            {...timePickerConfig}
            slotProps={{
              textField: {
                error: touched.startAt && !!modalCreateApplicationStore.errors.startAt,
                onBlur: handleStartTimeBlur
              }
            }}
          />

          <TimePicker
            label="Время конца"
            value={modalCreateApplicationStore.endAt}
            onChange={handleEndTimeChange}
            onAccept={handleEndTimeBlur}
            {...timePickerConfig}
            slotProps={{
              textField: {
                error: touched.endAt && !!modalCreateApplicationStore.errors.endAt,
                onBlur: handleEndTimeBlur
              }
            }}
          />
        </Grid2>
      </LocalizationProvider>

      <Grid2 spacing={2} className={styles.containerRoleAndQuantity}>
        <TextField
          select
          label="Должность"
          value={modalCreateApplicationStore.role ?? ''}
          onChange={handleRoleChange}
          error={touched.role && !!modalCreateApplicationStore.errors.role}
          fullWidth
          className={styles.picker}
        >
          {roles.length > 0 ? (
            roles.map((roleName) => (
              <MenuItem key={roleName.id} value={roleName.id}>
                {roleName.name}
              </MenuItem>
            ))
          ) : (
            <Typography>Нет информации о должностях</Typography>
          )}
        </TextField>
      </Grid2>
    </Grid2>
  );
});
