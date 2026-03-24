import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { shortWeekdays } from '@/constants/calendar';
import { isUserManager } from '@/utils/auth';

import TimesheetWorkerRow from '../TimesheetWorkerRow/TimesheetWorkerRow';

import TimesheetJobRow from './TimesheetJobRow';
import styles from './TimesheetTable.module.scss';
import TimesheetTableHead from './TimesheetTableHead';
import { fetchWorkingHours, workingHoursKey } from '@/api/queries';
import { useStores } from '@/stores/useStores';

export interface DayInfo {
  weekdayLabel: string;
  isCalendarWeekend: boolean;
  isOfficeNonWorkingDay: boolean;
  isCurrentDay: boolean;
  isFuture: boolean;
}

type VirtualRow = { type: 'jobHeader'; position: string } | { type: 'worker'; rowIdx: number };

interface TimesheetTableProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

const SKELETON_ROWS = 1;

const DOW_TO_JS: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
};

function getOfficeNonWorkingDays(workingHours: { dayOfWeek: string | number }[] | undefined): Set<number> {
  if (!workingHours || workingHours.length === 0) return new Set();
  const workingJsDays = new Set<number>();
  for (const wh of workingHours) {
    const dow = wh.dayOfWeek;
    if (typeof dow === 'string') {
      const jsDay = DOW_TO_JS[dow.toUpperCase()];
      if (jsDay !== undefined) workingJsDays.add(jsDay);
    } else {
      const jsDay = dow === 7 ? 0 : dow;
      workingJsDays.add(jsDay);
    }
  }
  const nonWorking = new Set<number>();
  for (let d = 0; d <= 6; d++) {
    if (!workingJsDays.has(d)) nonWorking.add(d);
  }
  return nonWorking;
}

const TimesheetTable = observer(({ containerRef }: TimesheetTableProps) => {
  const { timesheetStore, timetableStore } = useStores();
  const { month, year, daysInMonth, rows, isLoading } = timesheetStore;

  const firstHeaderRowRef = useRef<HTMLTableRowElement>(null);
  const [firstRowHeight, setFirstRowHeight] = useState(0);

  const subGroup = isUserManager();
  const officeId = subGroup ? undefined : timetableStore.selectedOffice?.id;

  const workingHoursQuery = useQuery({
    queryKey: officeId ? workingHoursKey(officeId) : ['workingHours-disabled'],
    queryFn: fetchWorkingHours,
    enabled: !!officeId && !subGroup
  });

  const officeNonWorkingDays = useMemo(
    () => (!subGroup ? getOfficeNonWorkingDays(workingHoursQuery.data) : new Set<number>()),
    [workingHoursQuery.data, subGroup]
  );

  useEffect(() => {
    if (firstHeaderRowRef.current) {
      setFirstRowHeight(firstHeaderRowRef.current.getBoundingClientRect().height);
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [month, containerRef]);

  const dayInfos = useMemo<DayInfo[]>(() => {
    const today = new Date();
    const ty = today.getFullYear();
    const tm = today.getMonth();
    const td = today.getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const dow = date.getDay();
      const weekdayIndex = (dow + 6) % 7;
      const isFuture = year > ty || (year === ty && month > tm) || (year === ty && month === tm && i + 1 > td);
      const isCalendarWeekend = dow === 0 || dow === 6;
      const isOfficeNonWorkingDay = !subGroup && officeNonWorkingDays.has(dow);
      return {
        weekdayLabel: shortWeekdays[weekdayIndex],
        isCalendarWeekend,
        isOfficeNonWorkingDay,
        isCurrentDay: year === ty && month === tm && i + 1 === td,
        isFuture
      };
    });
  }, [daysInMonth, month, year, officeNonWorkingDays, subGroup]);

  const allDaysEmpty =
    rows.length > 0 && rows.every((row) => row.dayTypes.slice(0, daysInMonth).every((dt) => dt === 'empty'));

  const flatRows = useMemo<VirtualRow[]>(() => {
    if (allDaysEmpty) return [];
    const grouped = new Map<string, number[]>();
    rows.forEach((row, idx) => {
      if (!grouped.has(row.position)) grouped.set(row.position, []);
      grouped.get(row.position)?.push(idx);
    });
    const result: VirtualRow[] = [];
    for (const [position, indices] of grouped) {
      result.push({ type: 'jobHeader', position });
      indices.forEach((idx) => result.push({ type: 'worker', rowIdx: idx }));
    }
    return result;
  }, [rows, allDaysEmpty]);

  const rowVirtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 30,
    overscan: 3,
    measureElement: (el) => el.getBoundingClientRect().height
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1].end : 0;

  return (
    <Box className={styles.wrapper}>
      <TableContainer ref={containerRef} component={Paper} className={styles.tableContainer}>
        <Table stickyHeader className={styles.table} style={{ minWidth: 220 + daysInMonth * 70 + 150 * 3 }}>
          <TimesheetTableHead
            dayInfos={dayInfos}
            daysInMonth={daysInMonth}
            month={month}
            firstRowHeight={firstRowHeight}
            firstRowRef={firstHeaderRowRef}
          />
          <TableBody>
            {isLoading &&
              Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <TableRow key={`skeleton-${i}`} className={styles.skeletonRow}>
                  <TableCell className={classNames(styles.skeletonCell, styles.skeletonFirstCol)}>
                    <Skeleton animation="pulse" className={styles.skeleton} />
                  </TableCell>
                  <TableCell colSpan={daysInMonth} className={styles.skeletonCell}>
                    <Skeleton animation="pulse" className={styles.skeleton} />
                  </TableCell>
                  <TableCell colSpan={3} className={styles.skeletonCell}>
                    <Skeleton animation="pulse" className={styles.skeleton} />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && flatRows.length > 0 && (
              <>
                {paddingTop > 0 && (
                  <TableRow>
                    {/* eslint-disable-next-line no-inline-styles/no-inline-styles */}
                    <TableCell style={{ height: paddingTop, padding: 0, border: 0 }} colSpan={daysInMonth + 4} />
                  </TableRow>
                )}
                {virtualItems.map((virtualRow) => {
                  const row = flatRows[virtualRow.index];
                  if (row.type === 'jobHeader') {
                    return (
                      <TimesheetJobRow
                        key={`job-${row.position}`}
                        position={row.position}
                        dayInfos={dayInfos}
                        virtualIndex={virtualRow.index}
                        measureRef={rowVirtualizer.measureElement}
                      />
                    );
                  }
                  return (
                    <TimesheetWorkerRow
                      key={`${rows[row.rowIdx].employeeId}-${rows[row.rowIdx].name}-${year}-${month}`}
                      fullname={rows[row.rowIdx].name}
                      rowIdx={row.rowIdx}
                      dayInfos={dayInfos}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                    />
                  );
                })}
                {paddingBottom > 0 && (
                  <TableRow>
                    {/* eslint-disable-next-line no-inline-styles/no-inline-styles */}
                    <TableCell style={{ height: paddingBottom, padding: 0, border: 0 }} colSpan={daysInMonth + 4} />
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});

export default TimesheetTable;
