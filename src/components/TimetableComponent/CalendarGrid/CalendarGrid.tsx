import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { Box, Grid2, Table, TableBody, TableRow } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';

import SpinCentered from '@/components/spin-centered/SpinCentered';

import { useEmployeeOffices } from '@/hooks/useEmployeeOffices';

import { CalendarCell } from './CalendarCell';
import styles from './CalendarGrid.module.scss';
import { fetchMySchedule, myScheduleKey } from '@/api/queries';
import { getCalendarMatrix } from '@/lib/schedule';
import { useStores } from '@/stores/useStores';

const CalendarGrid = observer(() => {
  const { timetableStore } = useStores();
  const { myScheduleMatrix, month, year } = timetableStore;
  const { pathname } = useLocation();
  const { employeeQuery } = useEmployeeOffices();
  const isMySchedulePage = pathname === '/schedule/my';
  const emptyCalendarMatrix = useMemo(() => {
    return getCalendarMatrix(year, month).map((week) =>
      week.map((cell) => {
        const [day, cellMonth] = cell.split('|').map(Number);
        return { day, month: cellMonth, myShifts: [] };
      })
    );
  }, [year, month]);

  const calendarMatrix = isMySchedulePage ? myScheduleMatrix : emptyCalendarMatrix;

  const myScheduleQuery = useQuery({
    queryKey: employeeQuery.data ? myScheduleKey(employeeQuery.data.id, year, month) : ['mySchedule', 'disabled'],
    queryFn: fetchMySchedule,
    enabled: !!employeeQuery.data
  });

  useEffect(() => {
    if (myScheduleQuery.data) {
      timetableStore.setMySchedule(myScheduleQuery.data);
    }
  }, [myScheduleQuery.data, timetableStore]);

  const isMyScheduleLoading = myScheduleQuery.isLoading || !myScheduleQuery.data;
  if (isMySchedulePage && isMyScheduleLoading) {
    return <SpinCentered overlay />;
  }
  return (
    <>
      <Grid2 container className={styles.weekDays}>
        <Box className={styles.weekDay}>Понедельник</Box>
        <Box className={styles.weekDay}>Вторник</Box>
        <Box className={styles.weekDay}>Среда</Box>
        <Box className={styles.weekDay}>Четверг</Box>
        <Box className={styles.weekDay}>Пятница</Box>
        <Box className={styles.weekDay}>Суббота</Box>
        <Box className={styles.weekDay}>Воскресенье</Box>
      </Grid2>

      <Table className={styles.calendarGrid}>
        <TableBody>
          {calendarMatrix.map((calendarRow, rowIndex) => (
            <TableRow key={rowIndex}>
              {calendarRow.map((cell, cellIndex) => (
                <CalendarCell
                  key={cellIndex}
                  cell={cell}
                  cellIndex={cellIndex}
                  currentMonth={month}
                  year={year}
                  isMySchedulePage={isMySchedulePage}
                />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
});

export default CalendarGrid;
