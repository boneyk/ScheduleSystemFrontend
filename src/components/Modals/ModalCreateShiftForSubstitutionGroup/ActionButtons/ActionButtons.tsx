import { FC, useState } from 'react';

import { Backdrop, Button, CircularProgress, Grid2 } from '@mui/material';
import axios from 'axios';
import { observer } from 'mobx-react-lite';

import { handleNetworkError } from '@/utils/errorHandlers';

import styles from '../ActionButtons/ActionsButtons.module.scss';

import { queryClient } from '@/api/queries';
import { createShift } from '@/api/shedule_service';
import { baseLayoutStore } from '@/stores/baseLayout.store';
import { modalCreateSubstitutionGroupCreateShift } from '@/stores/modalCreateSubstitutionGroupCreateShift.store';

interface ModalCreateActionsButtonsProps {
  onClose: () => void;
}

export const ActionsButtons: FC<ModalCreateActionsButtonsProps> = observer(({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { errors, createShiftDTO } = modalCreateSubstitutionGroupCreateShift;
  const isDisabled = isLoading;
  const handleClose = () => {
    modalCreateSubstitutionGroupCreateShift.close();
  };
  const onSubmit = async () => {
    const errorsList = Object.values(errors);
    if (errorsList.length > 0) {
      baseLayoutStore.showWarning(errorsList[0]);
      return;
    }
    setIsLoading(true);
    try {
      if (!createShiftDTO) return;
      await createShift(createShiftDTO);
      queryClient.invalidateQueries({
        queryKey: ['scheduleByRegion']
      });
      onClose();
      baseLayoutStore.showSuccess('Смена успешно создана');
    } catch (err: unknown) {
      let message = 'Ошибка при сохранении смены';
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
        onClick={handleClose}
        disabled={isLoading}
        className={styles.cancelButton}
      >
        Отмена
      </Button>
      <Button variant="contained" onClick={onSubmit} disabled={isDisabled} className={styles.actionButton}>
        Создать
      </Button>
      <Backdrop open={isLoading} className={styles.overlay}>
        <CircularProgress />
      </Backdrop>
    </Grid2>
  );
});
