import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

import styles from '@/components/Sidebar/Slidebar.module.scss';

import { isUserAdmin, isUserManager } from '@/utils/auth';

import { editApplication } from '@/api/application_service';
import { applicationsKey, queryClient } from '@/api/queries';
import { sidebarStore } from '@/stores/sidebar.store';
import { timetableStore } from '@/stores/timetable.store';

export const SliderConfirmMessage = observer(() => {
  const { selectedApp, actionType, setSelectedApp } = sidebarStore;
  const { regionId, year, month, selectedOffice } = timetableStore;
  const buttonColor = actionType === 'REJECT' ? 'error' : 'primary';
  const handleClose = () => {
    setSelectedApp(null);
  };

  const handleConfirm = async () => {
    if (!selectedApp || !actionType) return;
    const statusCode = actionType === 'REJECT' ? 'REJECTED' : 'CLOSED';
    await editApplication(selectedApp.applicationId, { statusCode });
    if (regionId != null && year != null && month != null && isUserManager()) {
      queryClient.invalidateQueries({
        queryKey: applicationsKey(regionId, undefined, year, month)
      });
    } else if (selectedOffice?.id != null && year != null && month != null && isUserAdmin()) {
      queryClient.invalidateQueries({
        queryKey: applicationsKey(undefined, selectedOffice?.id, year, month)
      });
    }
    handleClose();
  };

  if (!selectedApp || !actionType) return null;

  return (
    <Dialog open onClose={handleClose}>
      <DialogTitle>Подтверждение</DialogTitle>

      <DialogContent>
        <Grid2 className={styles.messageModal}>
          <Typography>
            {actionType === 'REJECT'
              ? 'Вы уверены, что хотите отклонить эту заявку?'
              : 'Вы уверены, что хотите подтвердить эту заявку?'}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Должность: {selectedApp.position?.name ?? 'не указана'}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Количество: {selectedApp.quantity}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Период: {selectedApp.startOn} — {selectedApp.endOn}
          </Typography>
        </Grid2>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} className={styles.cancelButton} color="secondary">
          Отмена
        </Button>

        <Button onClick={handleConfirm} variant="contained" color={buttonColor}>
          Подтвердить
        </Button>
      </DialogActions>
    </Dialog>
  );
});
