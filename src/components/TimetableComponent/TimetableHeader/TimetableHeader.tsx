import { useCallback, useEffect, useRef, useState } from 'react';

import { Grid2, TableCell, TableHead, TableRow } from '@mui/material';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import styles from './TimetableHeader.module.scss';
import { getWeekdayByDate } from '@/lib/schedule';
import { useStores } from '@/stores/useStores';

function useCurrentTime(enabled: boolean) {
  const getTime = () => new Date();
  const [now, setNow] = useState(getTime);

  useEffect(() => {
    if (!enabled) return;

    const immediateId = setTimeout(() => setNow(getTime), 0);
    const msUntilNextMinute = (60 - getTime().getSeconds()) * 1000;
    let intervalId: ReturnType<typeof setInterval>;

    const syncId = setTimeout(() => {
      setNow(getTime);
      intervalId = setInterval(() => setNow(getTime), 60_000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(immediateId);
      clearTimeout(syncId);
      clearInterval(intervalId);
    };
  }, [enabled]);

  return now;
}

const TimetableHeader = observer(() => {
  const { timetableStore } = useStores();
  const { shifts, year, month, day, days, changeMonth, todayIndex, viewType } = timetableStore;

  const isDayView = viewType === 'day';
  const now = useCurrentTime(isDayView);
  const isToday = isDayView && now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
  const halfTickPercent = 100 / 144 / 2;
  const timeLeftPercent = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100 + halfTickPercent;
  const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const timelineRef = useRef<HTMLDivElement>(null);
  const ellipseRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  const updateLineHeight = useCallback(() => {
    const el = timelineRef.current;
    if (!el) return;
    const container = el.closest('.MuiTableContainer-root');
    if (!container) return;
    const table = container.querySelector('table') as HTMLElement | null;
    if (!table) return;
    const ellipseHeight = ellipseRef.current?.offsetHeight ?? 0;
    setLineHeight(table.offsetHeight - ellipseHeight);
  }, []);

  useEffect(() => {
    if (!isDayView) return;
    updateLineHeight();
    let rafId: number;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateLineHeight);
    });
    const container = timelineRef.current?.closest('.MuiTableContainer-root');
    if (container) {
      observer.observe(container);
      const table = container.querySelector('table');
      if (table) observer.observe(table);
    }
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [isDayView, updateLineHeight]);

  const totalWorkers = Object.values(shifts).reduce((sum, workersByRole) => sum + Object.keys(workersByRole).length, 0);

  useEffect(() => {
    changeMonth(month);
  }, [year, month, changeMonth]);

  return (
    <TableHead>
      <TableRow className={styles.headRow}>
        <TableCell className={classNames(styles.fullnameCountCell, styles.stickyFirstColHead)}>
          <Grid2 container direction="row" className={styles.fullnameCount}>
            {'ФИО сотрудника'}
            <div className={styles.counter}>{totalWorkers}</div>
          </Grid2>
        </TableCell>
        {viewType === 'month' ? (
          days.map((index) => (
            <TableCell
              key={`${year}-${month}-${index}`}
              className={classNames(styles.monthDate, {
                [styles.lastCell]: index === days.length - 1,
                [styles.currentCell]: index === todayIndex
              })}
            >
              <Grid2 container direction="column" className={styles.wrapper}>
                <div className={styles.dateNum}>{index + 1}</div>
                <div className={classNames(styles.weekDay, { [styles.currentText]: index === todayIndex })}>
                  {getWeekdayByDate(year, month, index + 1)}
                </div>
              </Grid2>
            </TableCell>
          ))
        ) : (
          <TableCell className={styles.dayViewCell}>
            <div ref={timelineRef} className={styles.timeline}>
              {isToday && (
                <div className={styles.timeIndicator} style={{ left: `${timeLeftPercent}%` }}>
                  <div ref={ellipseRef} className={styles.timeIndicatorEllipse}>
                    <span className={styles.timeIndicatorLabel}>{timeLabel}</span>
                  </div>
                  <div className={styles.timeIndicatorLine} style={{ height: lineHeight }} />
                </div>
              )}
              {Array.from({ length: 144 }, (_, i) => {
                const minutes = i * 10;
                const isHour = minutes % 60 === 0;
                const isHalf = minutes % 60 === 30;
                return (
                  <div
                    key={i}
                    className={classNames(styles.tick, {
                      [styles.tickHour]: isHour,
                      [styles.tickHalf]: isHalf,
                      [styles.tickSmall]: !isHour && !isHalf
                    })}
                  >
                    {isHour && (
                      <span className={styles.tickLabel}>{String(Math.floor(minutes / 60)).padStart(2, '0')}:00</span>
                    )}
                    <div className={styles.tickLine} />
                  </div>
                );
              })}
            </div>
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
});

export default TimetableHeader;
