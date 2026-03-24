import { FC } from 'react';

import { Stack, Typography } from '@mui/material';

import { ShiftModalData } from '@/hooks/useViewModal';

import styles from './ModalViewShiftTitle.module.scss';

interface ModalViewShiftInfoProps {
  shiftData: ShiftModalData;
}

export const ModalViewShiftTitle: FC<ModalViewShiftInfoProps> = ({ shiftData }) => {
  return (
    <Stack direction="column" className={styles.info}>
      <Typography variant="h6" className={styles.infoText}>
        {shiftData.job}
      </Typography>
      <Typography variant="subtitle1" className={styles.infoText}>
        {shiftData.text}
      </Typography>
    </Stack>
  );
};
