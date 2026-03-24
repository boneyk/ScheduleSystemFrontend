import { FC } from 'react';

import { Grid2 } from '@mui/material';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import TimetableCurrentDateYear from '../TimetableCurrentDateYear';
import TimetableMonthPicker from '../TimetableMonthPicker';

import styles from './TimetableToolbar.module.scss';
import { useStores } from '@/stores/useStores';

interface TimetableToolbarProps {
  showDropdown?: boolean;
  forceMonthView?: boolean;
}

const TimetableToolbar: FC<TimetableToolbarProps> = observer(({ showDropdown = true, forceMonthView = false }) => {
  const { timetableStore } = useStores();
  const { viewType: storeViewType } = timetableStore;
  const viewType = forceMonthView ? 'month' : storeViewType;

  return (
    <Grid2
      container
      className={classNames(styles['timetable-header'], { [styles.noPaddingBottom]: viewType !== 'month' })}
    >
      <TimetableCurrentDateYear showDropdown={showDropdown} forceMonthView={forceMonthView} />
      {viewType === 'month' && <TimetableMonthPicker />}
    </Grid2>
  );
});

export default TimetableToolbar;
