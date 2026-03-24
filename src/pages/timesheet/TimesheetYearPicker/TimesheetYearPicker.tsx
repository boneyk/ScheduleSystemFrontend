import { Button, Grid2 } from '@mui/material';
import arrowBack from 'assets/move-back-arrow.svg';
import arrowForward from 'assets/move-forward-arrow.svg';
import { observer } from 'mobx-react-lite';

import styles from './TimesheetYearPicker.module.scss';
import { useStores } from '@/stores/useStores';

const TimesheetYearPicker = observer(() => {
  const { timesheetStore } = useStores();
  const { year, incYear, decYear } = timesheetStore;

  return (
    <Grid2 container className={styles.wrapper}>
      <Grid2 container className={styles.dateSection}>
        <Button variant="outlined" color="secondary" className={styles.yearButton} onClick={decYear}>
          <img src={arrowBack} alt="-" />
        </Button>
        <span className={styles.year}>{year}</span>
        <Button variant="outlined" color="secondary" className={styles.yearButton} onClick={incYear}>
          <img src={arrowForward} alt="+" />
        </Button>
      </Grid2>
    </Grid2>
  );
});

export default TimesheetYearPicker;
