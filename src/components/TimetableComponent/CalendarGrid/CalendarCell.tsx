import { FC } from 'react';

import { Grid2, TableCell } from '@mui/material';
import classNames from 'classnames';

import { shortWeekdays } from '@/constants/calendar';
import { useCurrentDay } from '@/hooks/useCurrentDay';

import styles from './CalendarGrid.module.scss';
import { formatShiftLabel, getOfficeColor, getShiftClassName } from '@/lib/schedule';
import type { CalendarCell as CalendarCellType } from '@/types/schedule';

interface CalendarCellProps {
  cell: CalendarCellType;
  cellIndex: number;
  currentMonth: number;
  year: number;
  isMySchedulePage: boolean;
}

export const CalendarCell: FC<CalendarCellProps> = ({ cell, cellIndex, currentMonth, year, isMySchedulePage }) => {
  const { isCurrentDay, isWeekend, isPast } = useCurrentDay({
    cellDay: cell.day,
    cellMonth: cell.month,
    year
  });

  const isNotCurrentMonth = cell.month !== currentMonth;

  return (
    <TableCell
      colSpan={1}
      rowSpan={1}
      className={classNames(styles.gridCell, {
        [styles.notCurrentMonthCell]: isNotCurrentMonth,
        [styles.currentDay]: isCurrentDay,
        [styles.weekend]: isWeekend,
        [styles.past]: isPast
      })}
    >
      <Grid2 container className={styles.wrapper}>
        <Grid2 container className={styles.dateWeekday}>
          <span className={styles.date}>{cell.day}</span>
          <span className={styles.weekday}>{shortWeekdays[cellIndex]}</span>
        </Grid2>
        <Grid2 className={styles.myShifts}>
          {isMySchedulePage &&
            cell.myShifts.map((shift, shiftIndex) => (
              <span
                key={shiftIndex}
                className={styles[getShiftClassName(shift.type)]}
                style={shift.type === 'work' ? getOfficeColor(shift.officeId) : undefined}
              >
                {formatShiftLabel(shift)}
              </span>
            ))}
        </Grid2>
      </Grid2>
    </TableCell>
  );
};
