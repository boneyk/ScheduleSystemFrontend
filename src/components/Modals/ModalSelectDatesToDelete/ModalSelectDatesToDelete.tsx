import { ChangeEvent } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid2,
  MenuItem,
  Switch,
  TextField
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import { observer } from 'mobx-react-lite';

import { Formats } from '@/utils/formats';

import styles from '../ModalCreate/ModalCreate.module.scss';

import { modalDeleteStore } from '@/stores/modalDelete.store';
import { modalSelectDatesToDeleteStore } from '@/stores/modalSelectDatesToDelete.store';
import { modalViewStore } from '@/stores/modalView.store';

dayjs.locale('ru');

const ModalSelectDatesToDelete = observer(() => {
  const { isOpen, deleteMode, startOn, endOn, shiftDates, shiftData, shiftId, shiftIdsForSingle } =
    modalSelectDatesToDeleteStore;
  const handleClose = () => {
    if (shiftData) {
      modalViewStore.open(shiftData);
    }
    modalSelectDatesToDeleteStore.close();
  };

  const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
    modalSelectDatesToDeleteStore.setDeleteMode(event.target.checked ? 'period' : 'single');
  };

  const handleDateSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = shiftIdsForSingle.find((d) => d.date.format(Formats.DATE_API) === event.target.value);
    if (selectedDate) {
      modalSelectDatesToDeleteStore.setStartDate(selectedDate.date);
      modalSelectDatesToDeleteStore.setEndDate(selectedDate.date);
      modalSelectDatesToDeleteStore.setShiftId(selectedDate.id);
    }
  };

  const handlePeriodStartChange = (newDate: Dayjs | null) => {
    if (!newDate || !newDate.isValid()) return;
    modalSelectDatesToDeleteStore.setStartDate(newDate);
  };

  const handlePeriodEndChange = (newDate: Dayjs | null) => {
    if (!newDate || !newDate.isValid()) return;
    modalSelectDatesToDeleteStore.setEndDate(newDate);
  };

  const handlePeriodStartBlur = () => {
    if (!startOn || !startOn.isValid()) return;

    const minDate = shiftDates[0]?.date;
    const maxDate = shiftDates[shiftDates.length - 1]?.date;

    let validDate = startOn;
    if (minDate && startOn.isBefore(minDate, 'day')) {
      validDate = minDate;
    } else if (maxDate && startOn.isAfter(maxDate, 'day')) {
      validDate = maxDate;
    }

    if (!validDate.isSame(startOn, 'day')) {
      modalSelectDatesToDeleteStore.setStartDate(validDate);
    }

    if (endOn && validDate.isAfter(endOn, 'day')) {
      modalSelectDatesToDeleteStore.setEndDate(validDate);
    }
  };

  const handlePeriodEndBlur = () => {
    if (!endOn || !endOn.isValid()) return;

    const minDate = shiftDates[0]?.date;
    const maxDate = shiftDates[shiftDates.length - 1]?.date;

    let validDate = endOn;
    if (minDate && endOn.isBefore(minDate, 'day')) {
      validDate = minDate;
    } else if (maxDate && endOn.isAfter(maxDate, 'day')) {
      validDate = maxDate;
    }

    if (!validDate.isSame(endOn, 'day')) {
      modalSelectDatesToDeleteStore.setEndDate(validDate);
    }

    if (startOn && validDate.isBefore(startOn, 'day')) {
      modalSelectDatesToDeleteStore.setStartDate(validDate);
    }
  };

  const handleConfirm = () => {
    if (!shiftData) return;
    const idToDelete = shiftId ?? shiftData.id;
    modalSelectDatesToDeleteStore.close();
    modalDeleteStore.open(idToDelete, shiftData, startOn, endOn, deleteMode);
  };
  const minDate = shiftDates[0]?.date || null;
  const maxDate = shiftDates[shiftDates.length - 1]?.date || null;

  const isValidDates =
    deleteMode === 'single' ||
    (startOn &&
      endOn &&
      startOn.isValid() &&
      endOn.isValid() &&
      !startOn.isAfter(endOn, 'day') &&
      (!minDate || !startOn.isBefore(minDate, 'day')) &&
      (!maxDate || !startOn.isAfter(maxDate, 'day')) &&
      (!minDate || !endOn.isBefore(minDate, 'day')) &&
      (!maxDate || !endOn.isAfter(maxDate, 'day')));
  const canConfirm = startOn && endOn && isValidDates;
  const deletePeriodLabel = shiftData?.type === 'work' ? 'Удалить период смен' : 'Удалить период отсутствий';
  const deleteDateLabel = shiftData?.type === 'work' ? 'Дата удаляемой смены' : 'Дата удаляемой отсутствия';
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      onTransitionEnd={() => !isOpen && modalSelectDatesToDeleteStore.reset()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className={styles.deleteTitle}>Выбор дат для удаления</DialogTitle>
      <DialogContent className={styles.contentToDelete}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
          {shiftDates.length > 1 && (
            <FormControlLabel
              control={
                <Switch
                  checked={deleteMode === 'period'}
                  className={styles.switcher}
                  onChange={handleModeChange}
                  size="small"
                />
              }
              label={deletePeriodLabel}
              className={styles.editModeControl}
            />
          )}

          {deleteMode === 'single' ? (
            <Box className={styles.info}>
              <TextField
                select
                fullWidth
                label={deleteDateLabel}
                value={startOn?.format(Formats.DATE_API)}
                onChange={handleDateSelect}
                className={styles.picker}
              >
                {shiftIdsForSingle.map((date) => (
                  <MenuItem key={date.date.format(Formats.DATE_API)} value={date.date.format(Formats.DATE_API)}>
                    {date.date.locale('ru').format('dd, DD MMMM YYYY')}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          ) : (
            <Grid2 container className={styles.datePickers}>
              <Grid2 className={styles.datePicker}>
                <DatePicker
                  label="Дата начала периода"
                  value={startOn}
                  onChange={handlePeriodStartChange}
                  onAccept={handlePeriodStartBlur}
                  minDate={minDate}
                  maxDate={endOn && endOn.isBefore(maxDate, 'day') ? endOn : maxDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        (startOn && endOn && startOn.isAfter(endOn, 'day')) ||
                        (startOn && minDate && startOn.isBefore(minDate, 'day')) ||
                        (startOn && maxDate && startOn.isAfter(maxDate, 'day')) ||
                        false,
                      onBlur: handlePeriodStartBlur
                    }
                  }}
                />
              </Grid2>
              <Grid2 className={styles.datePicker}>
                <DatePicker
                  label="Дата конца периода"
                  value={endOn}
                  onChange={handlePeriodEndChange}
                  onAccept={handlePeriodEndBlur}
                  minDate={startOn && startOn.isAfter(minDate, 'day') ? startOn : minDate}
                  maxDate={maxDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        (startOn && endOn && endOn.isBefore(startOn, 'day')) ||
                        (endOn && minDate && endOn.isBefore(minDate, 'day')) ||
                        (endOn && maxDate && endOn.isAfter(maxDate, 'day')) ||
                        false,
                      onBlur: handlePeriodEndBlur
                    }
                  }}
                />
              </Grid2>
            </Grid2>
          )}
        </LocalizationProvider>
      </DialogContent>
      <DialogActions className={styles.deleteActions}>
        <Button onClick={handleClose} color="secondary">
          Отмена
        </Button>
        <Button onClick={handleConfirm} color="primary" variant="contained" disabled={!canConfirm}>
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ModalSelectDatesToDelete;
