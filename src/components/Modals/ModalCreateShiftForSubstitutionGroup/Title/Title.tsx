import { FC } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Stack, Typography } from '@mui/material';

import styles from '../Title/Title.scss';

interface ModalCreateProps {
  onClose: () => void;
}
export const Title: FC<ModalCreateProps> = ({ onClose }) => {
  return (
    <Stack direction="row" spacing={1} className={styles.container}>
      <Typography variant="h5">Создание смены</Typography>
      <IconButton aria-label="close" onClick={onClose} className={styles.icons}>
        <CloseIcon />
      </IconButton>
    </Stack>
  );
};
