import { FC } from 'react';

import { Button, Grid2 } from '@mui/material';
import arrowBack from 'assets/move-back-arrow.svg';
import arrowForward from 'assets/move-forward-arrow.svg';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { stepPx } from '@/constants/timetable';

import styles from './TimetableControls.module.scss';
import { useStores } from '@/stores/useStores';

interface TimetableControlsProps {
  className?: string;
}

const TimetableControls: FC<TimetableControlsProps> = observer(({ className }) => {
  const { timetableStore } = useStores();
  const { moveCalendarLeft, moveCalendarRight } = timetableStore;

  const isEmpty = Object.keys(timetableStore.shifts).length === 0;
  return (
    <>
      {!isEmpty && (
        <Grid2 container className={classNames(styles.timetableFooter, className)}>
          <Grid2 className={classNames(styles['timetable-control-buttons'])}>
            <Button
              variant="outlined"
              color="secondary"
              className={styles['move-button']}
              onClick={() => moveCalendarLeft(stepPx)}
            >
              <img src={arrowBack} alt="назад" />
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              className={styles['move-button']}
              onClick={() => moveCalendarRight(stepPx)}
            >
              <img src={arrowForward} alt="вперёд" />
            </Button>
          </Grid2>
        </Grid2>
      )}
    </>
  );
});

export default TimetableControls;
