import { useEffect, useRef } from 'react';

import { Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

import TimesheetControls from '@/components/TimesheetTable/TimesheetControls';
import TimesheetTable from '@/components/TimesheetTable/TimesheetTable';

import { useEmployeeOffices } from '@/hooks/useEmployeeOffices';
import { isUserManager } from '@/utils/auth';

import TimesheetMonthPicker from './TimesheetMonthPicker';
import styles from './TimesheetPage.module.scss';
import TimesheetYearPicker from './TimesheetYearPicker';
import { baseLayoutStore } from '@/stores/baseLayout.store';
import { timetableStore } from '@/stores/timetable.store';
import { useStores } from '@/stores/useStores';

const TimesheetEmptyState = observer(() => {
  const { timesheetStore } = useStores();
  const { isLoading, rows, daysInMonth } = timesheetStore;
  if (isLoading) return null;
  const isEmpty =
    rows.length === 0 || rows.every((row) => row.dayTypes.slice(0, daysInMonth).every((dt) => dt === 'empty'));
  if (!isEmpty) return null;
  return <Typography className={styles.emptyText}>Нет данных за выбранный период</Typography>;
});

const TimesheetPage = observer(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { timesheetStore } = useStores();
  const { employeeQuery, officesQuery } = useEmployeeOffices();

  const subGroup = isUserManager();
  const { month, year, hasChanges } = timesheetStore;

  const hasChangesRef = useRef(hasChanges);
  hasChangesRef.current = hasChanges;

  useEffect(() => {
    return () => {
      if (hasChangesRef.current) {
        timesheetStore.resetChanges();
        baseLayoutStore.showCaution('Несохранённые изменения были сброшены');
      }
    };
  }, [timesheetStore]);

  useEffect(() => {
    timesheetStore.setIsSubGroup(subGroup);
  }, [subGroup, timesheetStore]);

  useEffect(() => {
    if (subGroup) {
      const regionId = employeeQuery.data?.regionId;
      if (regionId !== undefined && regionId !== null) {
        timesheetStore.setRegionId(regionId);
        void timesheetStore.fetchData();
      }
    } else {
      if (!timetableStore.selectedOffice && officesQuery.data?.length && employeeQuery.data) {
        timetableStore.setSelectedOffice(officesQuery.data[0]);
        timetableStore.setOffices(officesQuery.data);
        timetableStore.setEmployee(employeeQuery.data);
      }
      const officeId = timetableStore.selectedOffice?.id;
      if (officeId !== undefined) {
        timesheetStore.setOfficeId(officeId);
        void timesheetStore.fetchData();
      }
    }
  }, [subGroup, employeeQuery.data, officesQuery.data, month, year, timesheetStore]);

  return (
    <div className={styles.pageContainer}>
      <Typography variant="h1" className={styles.pageName}>
        Табель учета рабочих часов
      </Typography>
      <TimesheetYearPicker />
      <TimesheetMonthPicker />
      <TimesheetTable containerRef={containerRef} />
      <TimesheetEmptyState />
      <TimesheetControls containerRef={containerRef} />
    </div>
  );
});

export default TimesheetPage;
