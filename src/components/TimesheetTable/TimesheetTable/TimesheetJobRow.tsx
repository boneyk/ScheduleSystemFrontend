import { TableCell, TableRow } from '@mui/material';
import classNames from 'classnames';

import type { DayInfo } from './TimesheetTable';
import styles from './TimesheetTable.module.scss';

interface TimesheetJobRowProps {
  position: string;
  dayInfos: DayInfo[];
  virtualIndex: number;
  measureRef: (node: HTMLElement | null) => void;
}

const TimesheetJobRow = ({ position, dayInfos, virtualIndex, measureRef }: TimesheetJobRowProps) => (
  <TableRow data-index={virtualIndex} ref={measureRef} className={styles.jobHeaderRow}>
    <TableCell className={classNames(styles.jobHeaderCell, styles.headerFullname)}>{position}</TableCell>
    {dayInfos.map((info, i) => (
      <TableCell
        key={`job-${position}-day-${i}`}
        className={classNames(styles.jobHeaderBlank, {
          [styles.weekendJobCell]: info.isCalendarWeekend,
          [styles.currentDayJobCell]: info.isCurrentDay
        })}
      />
    ))}
    <TableCell className={styles.jobHeaderBlank} colSpan={3} />
  </TableRow>
);

export default TimesheetJobRow;
