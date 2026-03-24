import { FormControlLabel, Grid2, Radio, RadioGroup } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { observer } from 'mobx-react-lite';

import { useEmployeeOffices } from '@/hooks/useEmployeeOffices';
import { isUserEmployee, isUserManager } from '@/utils/auth';

import Timetable from '../Timetable';
import TimetableControls from '../TimetableControls';
import TimetableToolbar from '../TimetableToolbar';

import styles from './TimetableWidget.module.scss';
import { useStores } from '@/stores/useStores';

const TimetableWidget = observer(() => {
  const { timetableStore } = useStores();
  const { employeeQuery } = useEmployeeOffices();

  const changeText = () => {
    const isSubstitution = employeeQuery.data?.substitutionGroup;
    if (isUserManager() || (isUserEmployee() && isSubstitution)) {
      return 'График смен группы подмены';
    }
    return 'График смен по офису';
  };
  return (
    <div>
      <Grid2 container className={styles.sectiolnName}>
        <h1>{changeText()}</h1>
        <FormControl className={styles.formControl}>
          <RadioGroup
            value={timetableStore.viewType}
            onChange={(_, value) => timetableStore.setViewType(value as 'month' | 'day')}
          >
            <Grid2 direction="row" className={styles.radioGroup}>
              <FormControlLabel
                value="month"
                control={<Radio className={styles.radio} />}
                label="на месяц"
                className={styles.radioWrapper}
                classes={{
                  label: styles.label
                }}
              />
              <FormControlLabel
                value="day"
                control={<Radio className={styles.radio} />}
                label="на день"
                className={styles.radioWrapper}
                classes={{
                  label: styles.label
                }}
              />
            </Grid2>
          </RadioGroup>
        </FormControl>
      </Grid2>
      <TimetableToolbar />
      <Timetable />
      <TimetableControls />
    </div>
  );
});

export default TimetableWidget;
