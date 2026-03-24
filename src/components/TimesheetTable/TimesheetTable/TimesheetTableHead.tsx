import { RefObject } from 'react';

import { Box, TableCell, TableHead, TableRow } from '@mui/material';
import classNames from 'classnames';

import type { DayInfo } from './TimesheetTable';
import styles from './TimesheetTable.module.scss';

interface TimesheetTableHeadProps {
  dayInfos: DayInfo[];
  daysInMonth: number;
  month: number;
  firstRowHeight: number;
  firstRowRef: RefObject<HTMLTableRowElement | null>;
}

const TimesheetTableHead = ({ dayInfos, daysInMonth, month, firstRowHeight, firstRowRef }: TimesheetTableHeadProps) => (
  <TableHead className={styles.header}>
    <TableRow ref={firstRowRef}>
      <TableCell rowSpan={2} className={classNames(styles.headerCell, styles.headerFullname)}>
        <Box className={styles.cellBox}>ФИО сотрудника</Box>
      </TableCell>
      <TableCell colSpan={daysInMonth} className={classNames(styles.headerCell, styles.groupCell)}>
        <Box className={styles.cellBox}>Количество отработанного времени за день (ЧЧ:ММ)</Box>
      </TableCell>
      <TableCell rowSpan={2} className={classNames(styles.headerCell, styles.specialCell)}>
        <Box className={styles.cellBox}>Месячная норма</Box>
      </TableCell>
      <TableCell rowSpan={2} className={classNames(styles.headerCell, styles.specialCell)}>
        <Box className={styles.cellBox}>Итоговое время</Box>
      </TableCell>
      <TableCell rowSpan={2} className={classNames(styles.headerCell, styles.specialCell)}>
        <Box className={styles.cellBox}>Баланс часов</Box>
      </TableCell>
    </TableRow>
    <TableRow>
      {dayInfos.map((info, index) => (
        <TableCell
          key={`timesheet-head-${month}-${index}`}
          className={classNames(styles.headerCell, styles.dayCell, {
            [styles.weekendHeaderCell]: info.isCalendarWeekend,
            [styles.currentDayHeaderCell]: info.isCurrentDay
          })}
          style={{ top: firstRowHeight }}
        >
          <Box className={classNames(styles.cellBox, styles.dayCellBox)}>
            <span className={styles.dayNumber}>{index + 1}</span>
            <span className={styles.weekdayLabel}>{info.weekdayLabel}</span>
          </Box>
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
);

export default TimesheetTableHead;
