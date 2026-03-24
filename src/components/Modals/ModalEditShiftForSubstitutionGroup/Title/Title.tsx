import { FC } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Stack, Typography } from '@mui/material';

import styles from '../Title/Title.scss';

interface TitleProps {
  onClose: () => void;
}
export const Title: FC<TitleProps> = ({ onClose }) => {
  return (
    <Stack direction="row" spacing={1} className={styles.container}>
      <Typography variant="h5">Редактирование смены</Typography>
      <IconButton aria-label="close" onClick={onClose} className={styles.icons}>
        <CloseIcon />
      </IconButton>
    </Stack>
  );
};
