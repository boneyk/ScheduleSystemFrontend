import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  Grid2,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import ModalAlert from '@/components/Modals/ModalAlert/ModalAlert';
import Modal from '@/components/Modals/ModalCreate/ModalCreate';
import ModalCreateShiftForSubstitutionGroup from '@/components/Modals/ModalCreateShiftForSubstitutionGroup/ModalCreateShiftForSubstitutionGroup';
import ModalDelete from '@/components/Modals/ModalDelete/ModalDelete';
import ModalEditShiftForSubstitutionGroup from '@/components/Modals/ModalEditShiftForSubstitutionGroup/ModalEditShiftForSubstitutionGroup';
import ModalSelectDatesToDelete from '@/components/Modals/ModalSelectDatesToDelete/ModalSelectDatesToDelete';
import ModalView from '@/components/Modals/ModalView/ModalView';

import { useEmployeeOffices } from '@/hooks/useEmployeeOffices';
import { isUserAdmin, isUserEmployee, isUserManager } from '@/utils/auth';

import { JobSectionHeader } from '../JobSection';
import TimetableHeader from '../TimetableHeader';
import WorkerRow from '../WorkerRow';

import styles from './Timetable.module.scss';
import { fetchScheduleByOffice, fetchScheduleByRegion, scheduleByOfficeKey, scheduleByRegionKey } from '@/api/queries';
import { modalCreateStore } from '@/stores/modalCreate.store';
import { modalCreateSubstitutionGroupCreateShift } from '@/stores/modalCreateSubstitutionGroupCreateShift.store';
import { modalEditSubstitutionGroupStore } from '@/stores/modalEditSubstitutionGroupCreateShift.store';
import { useStores } from '@/stores/useStores';

type VirtualRow = { type: 'jobHeader'; jobTitle: string } | { type: 'worker'; employeeId: number; role: string };

const Timetable = observer(() => {
  const { timetableStore } = useStores();
  const { employeeQuery } = useEmployeeOffices();

  const {
    selectedOffice,
    year,
    month,
    calendarTranslatePx,
    setCalendarMaxTranslatePx,
    setCalendarTranslatePx,
    daysInMonth,
    viewType
  } = timetableStore;

  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  const employeeData = employeeQuery.data;
  const positionId = employeeData?.position?.id;
  const regionId = employeeData?.regionId;
  const isSubstitutionGroup = !!employeeData?.substitutionGroup;

  const isSubstitutionEmployee = isUserEmployee() && isSubstitutionGroup;
  const isRegularEmployee = isUserEmployee() && !isSubstitutionGroup;

  const canLoadOfficeSchedule = employeeQuery.isSuccess && !!selectedOffice && (isUserAdmin() || isRegularEmployee);

  const scheduleByOfficeQuery = useQuery({
    queryKey: canLoadOfficeSchedule
      ? scheduleByOfficeKey(isUserAdmin() ? undefined : positionId, selectedOffice.id, year, month)
      : ['schedule-disabled'],
    queryFn: fetchScheduleByOffice,
    enabled: canLoadOfficeSchedule
  });
  const canLoadRegionSchedule = employeeQuery.isSuccess && !!regionId && (isUserManager() || isSubstitutionEmployee);
  const scheduleByRegionQuery = useQuery({
    queryKey: canLoadRegionSchedule
      ? scheduleByRegionKey(regionId, year, month, isUserManager() ? undefined : positionId)
      : ['schedule-region-disabled'],
    queryFn: fetchScheduleByRegion,
    enabled: canLoadRegionSchedule
  });

  const scheduleQuery = isUserManager() || isSubstitutionEmployee ? scheduleByRegionQuery : scheduleByOfficeQuery;

  const jobTitles = Object.keys(scheduleQuery.data ?? {});
  const isLoading = scheduleQuery.isLoading || !scheduleQuery.data;
  const isEmptySchedule = scheduleQuery.isSuccess && jobTitles.length === 0;

  useEffect(() => {
    if (!scheduleQuery.isSuccess || !scheduleQuery.data) return;
    timetableStore.setOfficeSchedule(scheduleQuery.data);
  }, [scheduleQuery.isSuccess, scheduleQuery.data, isEmptySchedule, timetableStore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateMaxScroll = () => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      setCalendarMaxTranslatePx(maxScroll);
    };

    const handleScroll = () => {
      if (isProgrammaticScroll.current) return;
      const scrollLeft = Math.round(container.scrollLeft);
      setCalendarTranslatePx(scrollLeft);
    };

    updateMaxScroll();

    let rafId: number;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateMaxScroll);
    });
    resizeObserver.observe(container);
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [setCalendarMaxTranslatePx, setCalendarTranslatePx]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      setCalendarMaxTranslatePx(maxScroll);
    });
  }, [daysInMonth, setCalendarMaxTranslatePx]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      setCalendarMaxTranslatePx(maxScroll);
    });
  }, [viewType, setCalendarMaxTranslatePx]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const currentScroll = Math.round(container.scrollLeft);
    if (currentScroll === calendarTranslatePx) return;

    isProgrammaticScroll.current = true;

    container.scrollTo({
      left: calendarTranslatePx,
      behavior: 'smooth'
    });

    const timer = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);

    return () => clearTimeout(timer);
  }, [calendarTranslatePx]);

  const { shifts } = timetableStore;

  const flatRows = useMemo<VirtualRow[]>(() => {
    const jobTitles = Object.keys(shifts);
    if (jobTitles.length === 0) return [];

    const rows: VirtualRow[] = [];
    for (const jobTitle of jobTitles) {
      rows.push({ type: 'jobHeader', jobTitle });
      const workerShifts = shifts[jobTitle] ?? {};
      for (const workerId of Object.keys(workerShifts)) {
        rows.push({ type: 'worker', employeeId: Number(workerId), role: jobTitle });
      }
    }
    return rows;
  }, [shifts]);

  const estimateSize = useCallback((index: number) => (flatRows[index]?.type === 'jobHeader' ? 30 : 50), [flatRows]);

  const rowVirtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => containerRef.current,
    estimateSize,
    overscan: 3,
    measureElement: (el) => el.getBoundingClientRect().height
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1].end : 0;

  return (
    <>
      <Grid2 container className={styles.wrapper}>
        <TableContainer ref={containerRef} component={Paper} className={styles.muitimetable}>
          <Table stickyHeader className={classNames({ [styles.dayView]: viewType !== 'month' })}>
            <TimetableHeader />
            <TableBody>
              {isLoading && (
                <TableRow className={styles.loadingRow}>
                  <TableCell className={classNames(styles.stickyFirstCol, styles.cell)}>
                    <Skeleton animation="pulse" className={styles.skeleton} />
                  </TableCell>
                  <TableCell colSpan={daysInMonth} className={styles.cell}>
                    <Skeleton animation="pulse" className={styles.skeleton} />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && (
                <>
                  {paddingTop > 0 && (
                    <tr>
                      <td style={{ height: paddingTop }} />
                    </tr>
                  )}
                  {virtualItems.map((virtualRow) => {
                    const row = flatRows[virtualRow.index];
                    if (row.type === 'jobHeader') {
                      return (
                        <JobSectionHeader
                          key={`job-${row.jobTitle}`}
                          jobTitle={row.jobTitle}
                          measureRef={rowVirtualizer.measureElement}
                          virtualIndex={virtualRow.index}
                        />
                      );
                    }
                    return (
                      <WorkerRow
                        key={`worker-${row.employeeId}-${row.role}`}
                        employeeId={row.employeeId}
                        role={row.role}
                        measureRef={rowVirtualizer.measureElement}
                        virtualIndex={virtualRow.index}
                      />
                    );
                  })}
                  {paddingBottom > 0 && (
                    <tr>
                      <td style={{ height: paddingBottom }} />
                    </tr>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {isEmptySchedule && <Typography className={styles.textHelper}>Нет данных за выбранный период</Typography>}
      </Grid2>

      {(isUserAdmin() || isUserManager()) && (
        <Modal
          isOpen={modalCreateStore.isOpen}
          onClose={modalCreateStore.close}
          isRoleSelectionDisabled={true}
          mode={modalCreateStore.mode}
        />
      )}
      {isUserManager() && (
        <>
          <ModalCreateShiftForSubstitutionGroup
            isOpen={modalCreateSubstitutionGroupCreateShift.isOpen}
            onClose={modalCreateSubstitutionGroupCreateShift.close}
          />
          <ModalEditShiftForSubstitutionGroup
            isOpen={modalEditSubstitutionGroupStore.isOpen}
            onClose={modalEditSubstitutionGroupStore.close}
          />
        </>
      )}
      <ModalDelete />
      <ModalSelectDatesToDelete />
      <ModalView />
      <ModalAlert />
    </>
  );
});

export default Timetable;
