import { FC } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Stack, Typography } from '@mui/material';

import styles from '../ModalCreateTitle/ModalCreateTitle.module.scss';

import { ModalCreateMode } from '@/types/schedule';

interface ModalCreateProps {
  onClose: () => void;
  mode: ModalCreateMode;
}
const changeTitle = (mode: ModalCreateMode) => {
  if (mode === 'edit') {
    return 'Редактирование смены';
  } else if (mode === 'absence') {
    return 'Создание отсутствия';
  } else if (mode === 'shift') {
    return 'Создание смены';
  } else {
    return 'Создание заявки на подмену';
  }
};
export const ModalCreateTitle: FC<ModalCreateProps> = ({ onClose, mode }) => {
  return (
    <Stack direction="row" spacing={1} className={styles.container}>
      <Typography variant="h5">{changeTitle(mode)}</Typography>
      <IconButton aria-label="close" onClick={onClose} className={styles.icons}>
        <CloseIcon />
      </IconButton>
    </Stack>
  );
};
