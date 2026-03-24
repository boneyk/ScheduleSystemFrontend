import { Button, FormControl, Grid2, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { monthList } from '@/constants/timetable';

import styles from './TimesheetMonthPicker.module.scss';
import { useStores } from '@/stores/useStores';

const TimesheetMonthPicker = observer(() => {
  const { timesheetStore } = useStores();
  const { month, changeMonth } = timesheetStore;

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
        <InputLabel id="timesheet-month-select-id">Месяц</InputLabel>
        <Select<number>
          labelId={'timesheet-month-select-id'}
          label={'Месяц'}
          value={month}
          onChange={changeSelectMonth}
          className={styles.selectMonth}
        >
          {monthList.map((monthName, idx) => (
            <MenuItem key={`select-${monthName}-${idx}`} value={idx}>
              {monthName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid2>
  );
});

export default TimesheetMonthPicker;
