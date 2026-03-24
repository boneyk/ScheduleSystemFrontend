import { FC } from 'react';

import { Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { Dayjs } from 'dayjs';

import { ModalCreateDatePeriod } from '../ModalCreateDatePeriod/ModalCreateDatePeriod';
import { ModalCreatePressets } from '../ModalCreatePressets/ModalCreatePressets';
import { ModalCreateRoleAndPerson } from '../ModalCreateRoleAndPerson/ModalCreateRoleAndPerson';
import { ModalCreateTitle } from '../ModalCreateTitle/ModalCreateTitle';
import { ModalCreateActionsButtons } from '../ModalsCreateActionsButtons/ModalsCreateActionsButtons';

import styles from './ModalCreate.module.scss';
import { modalCreateStore } from '@/stores/modalCreate.store';
import { ModalCreateMode } from '@/types/schedule';

interface ModalCreateProps {
  isOpen: boolean;
  onClose: () => void;
  isRoleSelectionDisabled?: boolean;
  mode: ModalCreateMode;
  defaultStartDate?: Dayjs | null;
}
const ModalCreate: FC<ModalCreateProps> = ({
  isOpen,
  onClose,
  isRoleSelectionDisabled = false,
  mode = 'shift',
  defaultStartDate = null
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onTransitionEnd={() => !isOpen && modalCreateStore.resetAll()}
      className={styles.wrapper}
    >
      <DialogTitle>
        <ModalCreateTitle onClose={onClose} mode={mode} />
      </DialogTitle>

      <DialogContent dividers className={styles.content}>
        <Stack direction="column" spacing={3}>
          <ModalCreatePressets mode={mode} />
          <ModalCreateDatePeriod defaultStartDate={defaultStartDate} mode={mode} />
          <ModalCreateRoleAndPerson isDisabled={isRoleSelectionDisabled} mode={mode} />
        </Stack>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <ModalCreateActionsButtons onClose={onClose} mode={mode} />
      </DialogActions>
    </Dialog>
  );
};

export default ModalCreate;
