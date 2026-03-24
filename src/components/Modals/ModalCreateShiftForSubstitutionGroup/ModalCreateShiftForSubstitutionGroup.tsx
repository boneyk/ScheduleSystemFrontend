import { FC, useState } from 'react';

import { Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { Dayjs } from 'dayjs';

import styles from '@/components/Modals/ModalCreate/ModalCreate.module.scss';
import SpinCentered from '@/components/spin-centered/SpinCentered';

import { ActionsButtons } from './ActionButtons/ActionButtons';
import { CityAndOffice } from './CityAndOffice/CityAndOffice';
import { DateTimePeriod } from './DatePeriod/DateTimePeriod';
import { RoleAndPerson } from './RoleAndPerson/RoleAndPerson';
import { Title } from './Title/Title';
import { modalCreateSubstitutionGroupCreateShift } from '@/stores/modalCreateSubstitutionGroupCreateShift.store';

interface ModalCreateProps {
  isOpen: boolean;
  onClose: () => void;
  isRoleSelectionDisabled?: boolean;
  defaultStartDate?: Dayjs | null;
}

const ModalCreateShiftForSubstitutionGroup: FC<ModalCreateProps> = ({
  isOpen,
  onClose,
  isRoleSelectionDisabled = false,
  defaultStartDate = null
}) => {
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className={styles.wrapper}
      TransitionProps={{
        onExited: modalCreateSubstitutionGroupCreateShift.reset
      }}
    >
      <DialogTitle>
        <Title onClose={onClose} />
      </DialogTitle>

      <DialogContent dividers className={styles.content}>
        <Stack direction="column" spacing={2}>
          <CityAndOffice isDisabled={false} isOpen={isOpen} onLoadingChange={setIsCitiesLoading} />
          <DateTimePeriod defaultStartDate={defaultStartDate} />
          <RoleAndPerson isDisabled={isRoleSelectionDisabled} />
        </Stack>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <ActionsButtons onClose={onClose} />
      </DialogActions>
      {isCitiesLoading && <SpinCentered loading={isCitiesLoading} overlay />}
    </Dialog>
  );
};

export default ModalCreateShiftForSubstitutionGroup;
