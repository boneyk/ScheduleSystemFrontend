import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Grid2 } from '@mui/material';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import styles from './WarningMessage.module.scss';
import { useStores } from '@/stores/useStores';

const WarningMessage = observer(() => {
  const { baseLayoutStore } = useStores();
  const { warningMessage, isWarningVisible, successMessage, isSuccessVisible, cautionMessage, isCautionVisible } =
    baseLayoutStore;

  return (
    <>
      <Grid2 container className={classNames(styles.wrapper, { [styles.hidden]: !isWarningVisible })}>
        <Grid2 container className={styles.warningMessage}>
          <ErrorOutlineIcon />
          <span>{warningMessage}</span>
        </Grid2>
      </Grid2>
      <Grid2 container className={classNames(styles.wrapper, styles.success, { [styles.hidden]: !isSuccessVisible })}>
        <Grid2 container className={styles.warningMessage}>
          <CheckCircleOutlineIcon />
          <span>{successMessage}</span>
        </Grid2>
      </Grid2>
      <Grid2 container className={classNames(styles.wrapper, styles.caution, { [styles.hidden]: !isCautionVisible })}>
        <Grid2 container className={styles.warningMessage}>
          <WarningAmberIcon />
          <span>{cautionMessage}</span>
        </Grid2>
      </Grid2>
    </>
  );
});

export default WarningMessage;
