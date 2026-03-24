import { FC, useState } from 'react';

import { Backdrop, Button, CircularProgress, Grid2 } from '@mui/material';
import axios from 'axios';
import { observer } from 'mobx-react-lite';

import { isUserAdmin, isUserManager } from '@/utils/auth';
import { handleNetworkError } from '@/utils/errorHandlers';

import styles from './ModalsCreateActionsButtons.module.scss';
import { queryClient } from '@/api/queries';
import { createAbsence, createShift, editShifts } from '@/api/shedule_service';
import { baseLayoutStore } from '@/stores/baseLayout.store';
import { modalCreateStore } from '@/stores/modalCreate.store';
import { modalCreateAbsenceStore } from '@/stores/modalCreateAbsence.store';
import { modalViewStore } from '@/stores/modalView.store';
import { ModalCreateMode } from '@/types/schedule';

interface ModalCreateActionsButtonsProps {
  onClose: () => void;
  mode: ModalCreateMode;
}

export const ModalCreateActionsButtons: FC<ModalCreateActionsButtonsProps> = observer(({ onClose, mode }) => {
  const { createShiftDto, editShiftDto, shiftId, editMode, shiftIdsForPeriod } = modalCreateStore;
  const { absenceTypes, createAbsenceDto } = modalCreateAbsenceStore;

  const [isLoading, setIsLoading] = useState(false);
  const queryKeysConfig = [
    { condition: isUserAdmin(), queryKey: ['schedule'] },
    { condition: isUserManager(), queryKey: ['scheduleByRegion'] }
  ];
  const onSubmit = async () => {
    const errorsList = Object.values(
      mode === 'shift' || mode === 'edit' ? modalCreateStore.errors : modalCreateAbsenceStore.errors
    );
    if (errorsList.length > 0) {
      baseLayoutStore.showWarning(errorsList[0]);
      return;
    }
    setIsLoading(true);
    try {
      if (mode === 'shift') {
        if (!createShiftDto) return;
        await createShift(createShiftDto);
        baseLayoutStore.showSuccess('Смена успешно создана');
        onClose();
      } else if (mode === 'absence') {
        if (!createAbsenceDto) return;
        await createAbsence(createAbsenceDto);
        const type = absenceTypes.find((t) => t.id === createAbsenceDto.absenceTypeId);
        if (type) baseLayoutStore.showSuccess(`${type.name} успешно создан`);
        onClose();
      } else {
        if (!editShiftDto) return;
        if (editMode === 'period') {
          if (shiftIdsForPeriod.length === 0) return;
          await editShifts(shiftIdsForPeriod, editShiftDto);
          baseLayoutStore.showSuccess(`Успешно отредактировано смен: ${shiftIdsForPeriod.length}`);
        } else {
          if (!shiftId) return;
          await editShifts([shiftId], editShiftDto);
          baseLayoutStore.showSuccess('Смена успешно отредактирована');
        }
        onClose();
      }
      queryKeysConfig
        .filter(({ condition }) => condition)
        .forEach(({ queryKey }) => queryClient.invalidateQueries({ queryKey }));
    } catch (err: unknown) {
      let message = 'Ошибка при сохранении смены или отсутствия';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.detail ?? message;
      }
      baseLayoutStore.showWarning(message);
      handleNetworkError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid2 container className={styles.wrapper}>
      <Button
        variant="text"
        color="secondary"
        onClick={() => {
          if (mode === 'edit') {
            const { shiftData } = modalCreateStore;
            onClose();
            if (shiftData) modalViewStore.open(shiftData);
          } else {
            onClose();
          }
        }}
        disabled={isLoading}
        className={styles.cancelButton}
      >
        Отмена
      </Button>
      <Button variant="contained" onClick={onSubmit} disabled={isLoading} className={styles.actionButton}>
        {mode === 'edit' ? 'Сохранить' : 'Создать'}
      </Button>
      <Backdrop open={isLoading} className={styles.overlay}>
        <CircularProgress />
      </Backdrop>
    </Grid2>
  );
});
