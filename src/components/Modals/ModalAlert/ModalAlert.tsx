import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { observer } from 'mobx-react-lite';

import styles from '@/components/Modals/ModalDelete/ModalDelete.module.scss';

import { isUserAdmin } from '@/utils/auth';

import { modalAlertStore } from '@/stores/modalAlert.store';
import { modalCreateStore } from '@/stores/modalCreate.store';
import { modalEditSubstitutionGroupStore } from '@/stores/modalEditSubstitutionGroupCreateShift.store';
import { modalViewStore } from '@/stores/modalView.store';

dayjs.locale('ru');

const ModalAlert = observer(() => {
  const { isOpen, shiftData, startOn, endOn, editMode } = modalAlertStore;

  const handleClose = () => {
    if (shiftData) {
      modalViewStore.open(shiftData);
    }
    modalAlertStore.close();
  };

  const getConfirmationText = () => {
    if (!shiftData) return '';
    const employeeSuffix = shiftData.fullname ? ` сотрудника ${shiftData.fullname}` : '';
    const isSingleDate = editMode === 'single' || startOn?.isSame(endOn, 'day');
    const formattedStartDate = startOn?.locale('ru').format('DD MMMM YYYY');
    const formattedEndDate = endOn?.locale('ru').format('DD MMMM YYYY');

    const isHistorical = startOn ? startOn.isBefore(dayjs(), 'day') : true;
    const historicalPrefix = isHistorical ? 'Смена является исторической. ' : '';

    if (isSingleDate) {
      return `${historicalPrefix}Вы уверены, что хотите редактировать смену${employeeSuffix} за ${formattedStartDate}?`;
    }
    return `${historicalPrefix}Вы уверены, что хотите редактировать смены${employeeSuffix} с ${formattedStartDate} по ${formattedEndDate}?`;
  };

  const handleOpenEditModal = () => {
    modalAlertStore.close();
    if (isUserAdmin()) modalCreateStore.open('edit');
    else modalEditSubstitutionGroupStore.open();
  };
  const handleTransitionExited = () => modalAlertStore.reset();

  return (
    <Dialog open={isOpen} onClose={handleClose} onTransitionExited={handleTransitionExited} className={styles.wrapper}>
      <DialogTitle className={styles.title}>Подтверждение редактирования</DialogTitle>
      <DialogContent className={styles.content}>{getConfirmationText()}</DialogContent>
      <DialogActions className={styles.actions}>
        <Button onClick={handleClose} color="secondary">
          Отмена
        </Button>
        <Button onClick={handleOpenEditModal} color="primary" variant="contained">
          Редактировать
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ModalAlert;
