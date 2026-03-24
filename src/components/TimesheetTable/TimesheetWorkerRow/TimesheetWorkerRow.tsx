import React, { forwardRef, useRef } from 'react';

import { TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { isUserManager } from '@/utils/auth';

import type { DayInfo } from '../TimesheetTable/TimesheetTable';

import TimeInput, { TimeInputHandle } from './TimeInput';
import styles from './TimesheetWorkerRow.module.scss';
import { formatMinutes, getColor } from '@/lib/timesheet';
import { useStores } from '@/stores/useStores';

const ABSENCE_CODE_LABEL: Record<string, string> = {
  VACATION: 'Отп.',
  SICK: 'Болн.',
  MATERNITY: 'Дек.',
  UNPAID: 'Без.оп.',
  BUSINESS_TRIP: 'Ком.',
  OTHER: 'Отс.'
};

interface TimesheetWorkerRowProps {
  fullname: string;
  rowIdx: number;
  dayInfos: DayInfo[];
  'data-index'?: number;
}

const TimesheetWorkerRow = observer(
  forwardRef<HTMLTableRowElement, TimesheetWorkerRowProps>(({ fullname, rowIdx, dayInfos, ...rest }, ref) => {
    const { timesheetStore } = useStores();
    const { month, rows } = timesheetStore;
    const row = rows[rowIdx];
    const days = row?.days ?? [];
    const isDraftDays = row?.isDraftDays ?? [];
    const dayTypes = row?.dayTypes ?? [];
    const absenceCodes = row?.absenceCodes ?? [];

    const total = timesheetStore.getTotalMinutes(rowIdx);
    const norm = timesheetStore.getNormMinutes(rowIdx);
    const balance = total - norm;

    const subGroup = isUserManager();
    const timeInputRefs = useRef<(TimeInputHandle | null)[]>([]);

    const isCellDisabled = (index: number, info: DayInfo): boolean => {
      if (info.isFuture) return true;
      const type = dayTypes[index] ?? 'empty';
      if (type === 'absence') return true;
      if (type === 'empty') return true;
      return !subGroup && info.isOfficeNonWorkingDay;
    };

    const getTooltip = (index: number, info: DayInfo): string => {
      if (info.isFuture) return 'День ещё не наступил';
      const type = dayTypes[index] ?? 'empty';
      if (type === 'empty') return 'В этот день не назначена смена';
      if (type === 'absence') return 'День отсутствия';
      if (!subGroup && info.isOfficeNonWorkingDay) return 'Нерабочий день офиса';
      return '';
    };

    const handleCellClick = (index: number, info: DayInfo) => (e: React.MouseEvent) => {
      if (isCellDisabled(index, info)) return;
      if ((e.target as HTMLElement).tagName !== 'INPUT') {
        timeInputRefs.current[index]?.focus();
      }
    };

    return (
      <TableRow ref={ref} className={styles.row} {...rest}>
        <TableCell className={styles.fullnameCell}>{fullname}</TableCell>
        {dayInfos.map((info, index) => {
          const type = dayTypes[index] ?? 'empty';
          const disabled = isCellDisabled(index, info);
          const tooltip = getTooltip(index, info);

          return (
            <TableCell
              key={`timesheet-table-${fullname}-${month}-${index}`}
              className={classNames(styles.cell, {
                [styles.weekendCell]: info.isCalendarWeekend,
                [styles.currentDayCell]: info.isCurrentDay
              })}
              onClick={handleCellClick(index, info)}
            >
              <Tooltip title={tooltip}>
                <span>
                  {type === 'absence' ? (
                    <Typography className={styles.absenceLabel}>
                      {ABSENCE_CODE_LABEL[(absenceCodes[index] ?? '').toUpperCase()] ?? absenceCodes[index] ?? 'Отс.'}
                    </Typography>
                  ) : type === 'empty' ? (
                    <Typography className={styles.emptyLabel}>—</Typography>
                  ) : (
                    <TimeInput
                      ref={(el) => {
                        timeInputRefs.current[index] = el;
                      }}
                      value={days[index] ?? 0}
                      isDraft={isDraftDays[index] ?? false}
                      disabled={disabled}
                      onChange={(minutes) => timesheetStore.setDayValue(rowIdx, index, minutes)}
                    />
                  )}
                </span>
              </Tooltip>
            </TableCell>
          );
        })}
        <TableCell className={styles.special}>{formatMinutes(norm)}</TableCell>
        <TableCell className={styles.special}>{formatMinutes(total)}</TableCell>
        <TableCell className={styles.special} style={{ color: getColor(balance) }}>
          {formatMinutes(balance, true)}
        </TableCell>
      </TableRow>
    );
  })
);

export default TimesheetWorkerRow;
