import { FC, useState } from 'react';

import { Backdrop, Button, CircularProgress, Grid2 } from '@mui/material';
import axios from 'axios';
import { observer } from 'mobx-react-lite';

import { handleNetworkError } from '@/utils/errorHandlers';

import styles from '../ActionButtons/ActionsButtons.module.scss';

import { queryClient } from '@/api/queries';
import { editShifts } from '@/api/shedule_service';
import { baseLayoutStore } from '@/stores/baseLayout.store';
import { modalEditSubstitutionGroupStore } from '@/stores/modalEditSubstitutionGroupCreateShift.store';
import { modalViewStore } from '@/stores/modalView.store';

interface ActionsButtonsProps {
  onClose: () => void;
}

export const ActionsButtons: FC<ActionsButtonsProps> = observer(({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { editMode, shiftIdsForPeriod, errors, editShiftDto, shiftId } = modalEditSubstitutionGroupStore;
  const isDisabled = isLoading;

  const onSubmit = async () => {
    const errorsList = Object.values(errors);
    if (errorsList.length > 0) {
      baseLayoutStore.showWarning(errorsList[0]);
      return;
    }
    setIsLoading(true);
    try {
      if (!editShiftDto) {
        baseLayoutStore.showWarning('Ошибка при редактировании смены');
        return;
      }
      if (editMode === 'period') {
        if (shiftIdsForPeriod.length === 0) return;
        await editShifts(shiftIdsForPeriod, editShiftDto);
      } else {
        if (!shiftId) {
          baseLayoutStore.showWarning('Ошибка при редактировании смены');
          return;
        }
        setIsLoading(true);
        await editShifts([shiftId], editShiftDto);
      }
      onClose();
      queryClient.invalidateQueries({
        queryKey: ['scheduleByRegion']
      });
      baseLayoutStore.showSuccess('Смена успешно отредактирована');
      modalViewStore.close();
    } catch (err: unknown) {
      let message = 'Ошибка при редактировании смены';
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
      <Button variant="text" color="secondary" onClick={onClose} disabled={isLoading} className={styles.cancelButton}>
        Отмена
      </Button>
      <Button variant="contained" onClick={onSubmit} disabled={isDisabled} className={styles.actionButton}>
        Сохранить
      </Button>
      <Backdrop open={isLoading} className={styles.overlay}>
        <CircularProgress />
      </Backdrop>
    </Grid2>
  );
});
