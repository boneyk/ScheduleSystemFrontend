import { FC, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Dayjs } from 'dayjs';
import { observer } from 'mobx-react-lite';

import styles from '@/components/Modals/ModalCreateSubstitution/ModalCreateSubtitution.module.scss';

import { isUserAdmin } from '@/utils/auth';
import { handleNetworkError } from '@/utils/errorHandlers';

import { SlotCard } from './SlotCard';
import { postApplication } from '@/api/application_service';
import { applicationsKey, fetchPositions, positionsKey, queryClient } from '@/api/queries';
import { baseLayoutStore } from '@/stores/baseLayout.store';
import { modalCreateApplicationStore } from '@/stores/modalCreateApplication.store';
import { timetableStore } from '@/stores/timetable.store';

interface ModalCreateSubstitutionProps {
  isOpen: boolean;
  onClose: () => void;
  isRoleSelectionDisabled?: boolean;
  defaultStartDate?: Dayjs | null;
}

const ModalCreateSubstitution: FC<ModalCreateSubstitutionProps> = observer(({ isOpen, onClose }) => {
  const { createApplicationDto, errors } = modalCreateApplicationStore;
  const { year, month, selectedOffice } = timetableStore;
  const { data, isLoading } = useQuery({
    queryKey: positionsKey(),
    queryFn: fetchPositions,
    enabled: isOpen
  });
  const [loadingRequest, setLoadingRequest] = useState(false);
  const positions = data ?? [];

  const onSubmit = async () => {
    const errorsList = Object.values(errors);
    if (errorsList.length > 0) {
      baseLayoutStore.showWarning(errorsList[0]);
      return;
    }
    setLoadingRequest(true);
    try {
      if (!createApplicationDto) return;
      await postApplication(createApplicationDto);
      if (selectedOffice?.id != null && year != null && month != null && isUserAdmin()) {
        queryClient.invalidateQueries({
          queryKey: applicationsKey(undefined, selectedOffice?.id, year, month)
        });
      }
      onClose();
      baseLayoutStore.showSuccess('Заявка на подмену успешно создана');
    } catch (err: unknown) {
      let message = 'Ошибка при сохранении смены или отсутствия';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.detail ?? message;
      }
      baseLayoutStore.showWarning(message);
      handleNetworkError(err);
    } finally {
      setLoadingRequest(false);
    }
  };

  const isDisabled = isLoading || loadingRequest;
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onTransitionExited={() => modalCreateApplicationStore.reset()}
      className={styles.wrapper}
    >
      <DialogTitle>
        <Grid2 className={styles.header}>
          <Typography variant="h5">Создание заявки на подмену</Typography>
          <IconButton aria-label="close" onClick={onClose} className={styles.icons}>
            <CloseIcon />
          </IconButton>
        </Grid2>
      </DialogTitle>

      <DialogContent dividers>
        <Grid2 className={styles.content}>
          <SlotCard roles={positions} />
        </Grid2>
      </DialogContent>

      <DialogActions>
        <Grid2 container className={styles.wrapper}>
          <Button
            variant="text"
            color="secondary"
            onClick={onClose}
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
      </DialogActions>
    </Dialog>
  );
});

export default ModalCreateSubstitution;
