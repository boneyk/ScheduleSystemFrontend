import { FC, useEffect } from 'react';

import { Grid2 } from '@mui/material';

import { useEmployeeOffices } from '@/hooks/useEmployeeOffices';

import CalendarGrid from '../CalendarGrid';
import TimetableToolbar from '../TimetableToolbar';

import styles from './CalendarWidget.module.scss';
import { useStores } from '@/stores/useStores';

interface CalendarWidgetProps {
  title: string;
  showDropdown?: boolean;
}

const CalendarWidget: FC<CalendarWidgetProps> = ({ title, showDropdown = false }) => {
  const { timetableStore } = useStores();
  const { employeeQuery, officesQuery } = useEmployeeOffices();

  useEffect(() => {
    if (!timetableStore.selectedOffice && officesQuery.data?.length && employeeQuery.data) {
      timetableStore.setSelectedOffice(officesQuery.data[0]);
      timetableStore.setOffices(officesQuery.data);
      timetableStore.setEmployee(employeeQuery.data);
    }
  }, [timetableStore, officesQuery.data, employeeQuery.data]);

  return (
    <Grid2 container className={styles.wrapper}>
      <Grid2 container className={styles.sectiolnName}>
        <h1>{title}</h1>
      </Grid2>
      <TimetableToolbar showDropdown={showDropdown} forceMonthView />
      <CalendarGrid />
    </Grid2>
  );
};

export default CalendarWidget;
