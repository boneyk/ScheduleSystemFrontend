import { Button, FormControl, Grid2, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { monthList } from '@/constants/timetable';

import styles from './TimetableMonthPicker.module.scss';
import { useStores } from '@/stores/useStores';

const TimetableMonthPicker = observer(() => {
  const { timetableStore } = useStores();
  const { month, changeMonth } = timetableStore;

  const changeSelectMonth = (event: SelectChangeEvent<number>) => {
    changeMonth(Number(event.target.value));
  };

  return (
    <Grid2 container className={classNames(styles.wrapper)}>
      <Grid2 container className={classNames(styles.monthSwitcher)}>
        {monthList.map((monthName, idx) => (
          <Button
            key={`${monthName}-${idx}`}
            onClick={() => changeMonth(idx)}
            variant={'contained'}
            color="secondary"
            className={classNames(styles.monthButton, { [styles.selectedMonthBtn]: month === idx })}
          >
            {monthName}
          </Button>
        ))}
      </Grid2>
      <FormControl variant="outlined" className={styles.formControl}>
        <InputLabel id="month-select-id">Месяц</InputLabel>
        <Select<number>
          labelId={'month-select-id'}
          label={'Месяц'}
          value={month}
          onChange={changeSelectMonth}
          className={styles.selectMonth}
        >
          {monthList.map((month, idx) => (
            <MenuItem key={`select-${month}-${idx}`} value={idx}>
              {month}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid2>
  );
});

export default TimetableMonthPicker;
