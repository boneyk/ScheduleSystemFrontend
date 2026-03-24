import { FC, useState } from 'react';

import { Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { Dayjs } from 'dayjs';

import styles from '@/components/Modals/ModalEditShiftForSubstitutionGroup/ModalEditShiftForSubstitutionGroup.scss';
import SpinCentered from '@/components/spin-centered/SpinCentered';

import { ActionsButtons } from '../ModalEditShiftForSubstitutionGroup/ActionButtons/ActionButtons';
import { CityAndOffice } from '../ModalEditShiftForSubstitutionGroup/CityAndOffice/CityAndOffice';
import { DatePeriod } from '../ModalEditShiftForSubstitutionGroup/DatePeriod/DatePeriod';
import { RoleAndPerson } from '../ModalEditShiftForSubstitutionGroup/RoleAndPerson/RoleAndPerson';
import { Title } from '../ModalEditShiftForSubstitutionGroup/Title/Title';

import { modalEditSubstitutionGroupStore } from '@/stores/modalEditSubstitutionGroupCreateShift.store';
import { modalViewStore } from '@/stores/modalView.store';

interface ModalEditShiftForSubstitutionGroupProps {
  isOpen: boolean;
  onClose: () => void;
  isRoleSelectionDisabled?: boolean;
  defaultStartDate?: Dayjs | null;
}

const ModalEditShiftForSubstitutionGroup: FC<ModalEditShiftForSubstitutionGroupProps> = ({ isOpen, onClose }) => {
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const { shiftData } = modalViewStore;

  const handleClose = () => {
    if (shiftData && shiftData.isCombined === true) {
      modalViewStore.open(shiftData);
    }
    onClose();
  };
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className={styles.wrapper}
      TransitionProps={{
        onExited: modalEditSubstitutionGroupStore.reset
      }}
    >
      <DialogTitle>
        <Title onClose={handleClose} />
      </DialogTitle>

      <DialogContent dividers className={styles.content}>
        <Stack direction="column" spacing={2}>
          <CityAndOffice isDisabled={false} isOpen={isOpen} onLoadingChange={setIsCitiesLoading} />
          <DatePeriod />
          <RoleAndPerson isDisabled={true} />
        </Stack>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <ActionsButtons onClose={handleClose} />
      </DialogActions>
      {isCitiesLoading && <SpinCentered loading={isCitiesLoading} overlay />}
    </Dialog>
  );
};

export default ModalEditShiftForSubstitutionGroup;
