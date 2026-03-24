import { FC } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';

import styles from './ModalDeleteEmployee.module.scss';

interface ModalDeleteEmployeeProps {
  open: boolean;
  employeeNames: string[];
  onClose: () => void;
  onConfirm: () => void;
}

const ModalDeleteEmployee: FC<ModalDeleteEmployeeProps> = ({ open, employeeNames, onClose, onConfirm }) => {
  const text =
    employeeNames.length === 1
      ? `Вы уверены, что хотите удалить сотрудника ${employeeNames[0]} из офиса? При удалении будут удалены все смены сотрудников, запланированные в будущем в данном офисе.`
      : `Вы уверены, что хотите удалить сотрудников (${employeeNames.length}) из офиса? При удалении будут удалены все смены сотрудников, запланированные в будущем в данном офисе.`;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={styles.title}>
        Подтверждение удаления
        <IconButton onClick={onClose} className={styles.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={styles.content}>{text}</DialogContent>
      <DialogActions className={styles.actions}>
        <Button onClick={onClose} color="secondary" className={styles.cancel}>
          Отмена
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDeleteEmployee;
