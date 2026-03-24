import { useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { observer } from 'mobx-react-lite';

import SpinCentered from '@/components/spin-centered/SpinCentered';

import { isUserAdmin, isUserManager } from '@/utils/auth';
import { handleNetworkError } from '@/utils/errorHandlers';

import styles from './ModalDelete.module.scss';
import { queryClient } from '@/api/queries';
import { deleteAbsence, deleteShifts } from '@/api/shedule_service';
import { baseLayoutStore } from '@/stores/baseLayout.store';
import { modalCreateAbsenceStore } from '@/stores/modalCreateAbsence.store';
import { modalDeleteStore } from '@/stores/modalDelete.store';
import { modalViewStore } from '@/stores/modalView.store';
import { useStores } from '@/stores/useStores';

dayjs.locale('ru');

const ModalDelete = observer(() => {
  const { timetableStore } = useStores();
  const { isOpen, shiftId, shiftData, startOn, endOn, deleteMode } = modalDeleteStore;
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    if (shiftData) {
      modalViewStore.open(shiftData);
    }
    modalDeleteStore.close();
  };

  const isWorkShift = shiftData?.type === 'work';
  const absenceTypeName = !isWorkShift
    ? modalCreateAbsenceStore.absenceTypes.find((type) => type.code === shiftData?.type)?.name.toLowerCase()
    : null;
  const getConfirmationText = () => {
    if (!shiftData) return '';
    const employeeSuffix = shiftData.fullname ? ` сотрудника ${shiftData.fullname}` : '';
    const isSingleDate = deleteMode === 'single' || startOn?.isSame(endOn, 'day');
    const formattedStartDate = startOn?.locale('ru').format('DD MMMM YYYY');
    const formattedEndDate = endOn?.locale('ru').format('DD MMMM YYYY');
    const clickedDay = shiftData.dayIndex + 1;
    const clickedDate = dayjs().year(timetableStore.year).month(timetableStore.month).date(clickedDay);
    const isHistorical = clickedDate.isBefore(dayjs(), 'day');

    const historicalPrefix = isHistorical ? 'Удаление исторических записей необратимо. ' : '';
    if (isSingleDate) {
      return isWorkShift
        ? `${historicalPrefix}Вы уверены, что хотите удалить смену${employeeSuffix} за ${formattedStartDate}?`
        : `${historicalPrefix}Вы уверены, что хотите удалить ${absenceTypeName}${employeeSuffix} за ${formattedStartDate}?`;
    }
    return isWorkShift
      ? `${historicalPrefix}Вы уверены, что хотите удалить смены${employeeSuffix} с ${formattedStartDate} по ${formattedEndDate}?`
      : `${historicalPrefix}Вы уверены, что хотите удалить ${absenceTypeName}${employeeSuffix} с ${formattedStartDate} по ${formattedEndDate}?`;
  };
  const queryKeysConfig = [
    { condition: isUserAdmin(), queryKey: ['schedule'] },
    { condition: isUserManager(), queryKey: ['scheduleByRegion'] }
  ];

  const handleDelete = async () => {
    if (!shiftId || !shiftData) return;
    setIsLoading(true);
    try {
      let shiftIds: number[];

      if (deleteMode === 'period' && startOn && endOn) {
        shiftIds = [];

        if (isWorkShift) {
          Object.values(timetableStore.shifts).forEach((employeeSchedules) => {
            employeeSchedules.forEach((employeeSchedule) => {
              if (employeeSchedule.id === shiftData.employeeId) {
                employeeSchedule.shifts.forEach((shift) => {
                  const shiftDate = dayjs(shift.scheduledOn);
                  if (
                    (shiftDate.isAfter(startOn, 'day') || shiftDate.isSame(startOn, 'day')) &&
                    (shiftDate.isBefore(endOn, 'day') || shiftDate.isSame(endOn, 'day'))
                  ) {
                    shiftIds.push(shift.id);
                  }
                });
              }
            });
          });
          await deleteShifts(shiftIds);
        } else {
          Object.values(timetableStore.shifts).forEach((employeeSchedules) => {
            employeeSchedules.forEach((employeeSchedule) => {
              if (employeeSchedule.id === shiftData.employeeId) {
                employeeSchedule.absences.forEach((absence) => {
                  const shiftDate = dayjs(absence.absentOn);
                  if (
                    (shiftDate.isAfter(startOn, 'day') || shiftDate.isSame(startOn, 'day')) &&
                    (shiftDate.isBefore(endOn, 'day') || shiftDate.isSame(endOn, 'day'))
                  ) {
                    shiftIds.push(absence.id);
                  }
                });
              }
            });
          });
          await deleteAbsence(shiftIds);
        }
        baseLayoutStore.showSuccess(`Успешно удалено ${isWorkShift ? 'смен' : 'отсутствий'}: ${shiftIds.length}`);
      } else if (startOn && shiftData.employeeId) {
        let targetShiftId = shiftId;
        if (isWorkShift) {
          Object.values(timetableStore.shifts).forEach((employeeSchedules) => {
            employeeSchedules.forEach((employeeSchedule) => {
              if (employeeSchedule.id === shiftData.employeeId) {
                employeeSchedule.shifts.forEach((shift) => {
                  if (shift.id === shiftId) {
                    targetShiftId = shift.id;
                  }
                });
              }
            });
          });
          await deleteShifts([targetShiftId]);
        } else {
          Object.values(timetableStore.shifts).forEach((employeeSchedules) => {
            employeeSchedules.forEach((employeeSchedule) => {
              if (employeeSchedule.id === shiftData.employeeId) {
                employeeSchedule.absences.forEach((absence) => {
                  if (absence.id === shiftId) {
                    targetShiftId = absence.id;
                  }
                });
              }
            });
          });
          await deleteAbsence([targetShiftId]);
        }
      } else {
        if (isWorkShift) {
          await deleteShifts([shiftId]);
        } else {
          await deleteAbsence([shiftId]);
        }
      }
      queryKeysConfig
        .filter(({ condition }) => condition)
        .forEach(({ queryKey }) => queryClient.invalidateQueries({ queryKey }));
      baseLayoutStore.showSuccess(isWorkShift ? 'Смена успешно удалена' : `${absenceTypeName} успешно удален`);
      modalDeleteStore.close();
    } catch (error: unknown) {
      let message = 'Ошибка при удалении смены';
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400) {
          message = 'Неверные данные запроса';
        } else if (status === 403) {
          message = 'Недостаточно прав для удаления смены';
        } else if (status === 404) {
          message = 'Смена не найдена';
        } else {
          message = error.response?.data?.detail ?? message;
        }
      }
      baseLayoutStore.showWarning(message);
      handleNetworkError(error);
      modalDeleteStore.close();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      onTransitionEnd={() => !isOpen && modalDeleteStore.reset()}
      className={styles.wrapper}
    >
      <DialogTitle className={styles.title}>Подтверждение удаления</DialogTitle>
      <DialogContent className={styles.content}>{getConfirmationText()}</DialogContent>
      <DialogActions className={styles.actions}>
        <Button onClick={handleClose} color="secondary" disabled={isLoading}>
          Отмена
        </Button>
        <Button onClick={handleDelete} color="primary" variant="contained" disabled={isLoading}>
          Удалить
        </Button>
      </DialogActions>
      <SpinCentered loading={isLoading} overlay />
    </Dialog>
  );
});

export default ModalDelete;
