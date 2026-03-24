import { FC } from 'react';

import { Grid2, Typography } from '@mui/material';

import styles from '../ModalCreate/ModalCreate.module.scss';

type DisabledViewProps = {
  roleLabel: string;
  employeeLabel: string;
  selectedRole?: string | null;
  selectedEmployeeName?: string;
};

export const DisabledView: FC<DisabledViewProps> = ({
  roleLabel,
  employeeLabel,
  selectedRole,
  selectedEmployeeName
}) => {
  return (
    <Grid2 container className={styles.containerInfo}>
      <Grid2 className={styles.infoRow}>
        <Typography variant="subtitle2" color="text.secondary">
          {roleLabel}
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {selectedRole || '—'}
        </Typography>
      </Grid2>

      <Grid2 className={styles.infoRow}>
        <Typography variant="subtitle2" color="text.secondary">
          {employeeLabel}
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {selectedEmployeeName || '—'}
        </Typography>
      </Grid2>
    </Grid2>
  );
};
