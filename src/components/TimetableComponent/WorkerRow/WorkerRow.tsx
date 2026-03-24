import { FC, useState } from 'react';

import { AddCircleOutline } from '@mui/icons-material';
import { Grid2, TableCell, TableRow } from '@mui/material';
import profileLogo from 'assets/profilePicture.svg';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { useCellClick } from '@/hooks/useCellClick';
import { useEmployeeOffices } from '@/hooks/useEmployeeOffices';
import { isUserAdmin, isUserManager } from '@/utils/auth';
import { getCellConfig } from '@/utils/cellConfig';

import styles from './WorkerRow.module.scss';
import { getKey, getShiftTimePercent, isEnd, isMid, isSolo, isStart } from '@/lib/schedule';
import { useStores } from '@/stores/useStores';

interface WorkerRowProps {
  employeeId: number;
  role: string;
  measureRef?: (node: HTMLElement | null) => void;
  virtualIndex?: number;
}

const WorkerRow: FC<WorkerRowProps> = observer(({ role, employeeId, measureRef, virtualIndex }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const { timetableStore } = useStores();
  const { days, daysInMonth, todayIndex, year, month, shifts, viewType } = timetableStore;
  const workerData = shifts[role]?.[employeeId];
  const {
    daysShiftsList,
    handleCellClick,
    canAddShiftAdmin,
    canAddShiftManager,
    isOfficeWorkingDay,
    isSubstitutionEmployee,
    isUnattachedEmployee
  } = useCellClick({
    role,
    employeeId,
    days,
    daysInMonth,
    year,
    month
  });
  const { employeeQuery } = useEmployeeOffices();
  const isSubstitution = employeeQuery.data?.substitutionGroup;

  const renderSubstitutionLabel = () => {
    if (!workerData) return null;
    if (isUserAdmin()) {
      return 'Группа подмены';
    }
    if (isUserManager()) {
      return workerData.city.name ? workerData.city.name : 'Неизвестный город';
    }
    if (isSubstitution) {
      return workerData.city?.name ? workerData.city.name : 'Неизвестный город';
    } else {
      return 'Группа подмены';
    }
  };

  return (
    <TableRow ref={measureRef} data-index={virtualIndex} className={styles.hoverRow}>
      <TableCell className={classNames(styles.workerData, styles.stickyFirstCol)}>
        <Grid2 container className={styles.wrapper}>
          <img alt={''} src={profileLogo} className={styles.logo} />
          <div className={styles.textBlock}>
            <span className={styles.fullName}>{workerData.fullName}</span>
            {workerData.substitutionGroup && (
              <span className={styles.substitutionLabel}>{renderSubstitutionLabel()}</span>
            )}
            {!workerData.substitutionGroup && !workerData.attachedToOffice && (
              <span className={styles.substitutionLabel}>Сотрудник не привязан к офису</span>
            )}
          </div>
        </Grid2>
      </TableCell>

      {viewType === 'month'
        ? days.map((day, index) => {
            const info = daysShiftsList[index + 1];
            const isStartOrSolo = isStart(daysShiftsList, index) || isSolo(daysShiftsList, index);
            const { isNotEmpty, isHoliday, clickable, isRestricted } = getCellConfig({
              index,
              day,
              year: timetableStore.year,
              month: timetableStore.month,
              info,
              isSubstitutionEmployee,
              isUnattachedEmployee,
              isOfficeWorkingDay
            });
            const clickToCreateShift =
              (isUserAdmin() || isUserManager()) &&
              !isNotEmpty &&
              (canAddShiftAdmin(index) || canAddShiftManager(index));

            return (
              <TableCell
                key={`worker-${employeeId}-day-${day}`}
                className={classNames(styles.workerDayCell, {
                  [styles.holiday]: isHoliday,
                  [styles.restrictedCell]: isRestricted,
                  [styles.clickable]: clickable,
                  [styles.notClickable]: !clickable,
                  [styles.hasShift]: isNotEmpty
                })}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCellClick(index);
                }}
                onMouseEnter={() => info && setHoveredKey(getKey(info))}
                onMouseLeave={() => setHoveredKey(null)}
              >
                {info && (
                  <span
                    className={classNames(styles[info.type], styles.shift, {
                      [styles.startShift]: isStart(daysShiftsList, index),
                      [styles.endShift]: isEnd(daysShiftsList, index),
                      [styles.midShift]: isMid(daysShiftsList, index),
                      [styles.soloShift]: isSolo(daysShiftsList, index),
                      [styles.highlighted]: hoveredKey === getKey(info)
                    })}
                  >
                    {isStartOrSolo && info.title}
                  </span>
                )}
                {clickToCreateShift && (
                  <Grid2 className={styles.iconWrapper}>
                    <AddCircleOutline className={styles.addIcon} fontSize="small" />
                  </Grid2>
                )}
                {day === todayIndex && <div className={styles.pointer}></div>}
              </TableCell>
            );
          })
        : (() => {
            const dayIndex = timetableStore.day - 1;
            const info = daysShiftsList[dayIndex + 1];
            const { isNotEmpty, isHoliday, clickable, isRestricted } = getCellConfig({
              index: dayIndex,
              day: timetableStore.day - 1,
              year: timetableStore.year,
              month: timetableStore.month,
              info,
              isSubstitutionEmployee,
              isUnattachedEmployee,
              isOfficeWorkingDay
            });
            const clickToCreateShift =
              (isUserAdmin() || isUserManager()) &&
              !isNotEmpty &&
              (canAddShiftAdmin(dayIndex) || canAddShiftManager(dayIndex));
            return (
              <TableCell
                className={classNames(styles.workerDayCell, styles.dayViewCell, {
                  [styles.holiday]: isHoliday,
                  [styles.restrictedCell]: isRestricted,
                  [styles.clickable]: clickable,
                  [styles.notClickable]: !clickable,
                  [styles.hasShift]: isNotEmpty
                })}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCellClick(dayIndex);
                }}
              >
                {info &&
                  (() => {
                    if (info.isCombined && info.shiftsForCombined?.length) {
                      return (
                        <>
                          {info.shiftsForCombined.map((combined) => {
                            const timePos = getShiftTimePercent(combined as unknown as typeof info);
                            return (
                              <span
                                key={combined.id}
                                className={classNames(styles[info.type], styles.shift, styles.dayViewShift)}
                                style={
                                  timePos
                                    ? { left: `${timePos.left}%`, width: `${timePos.width}%` }
                                    : { left: 0, width: '100%' }
                                }
                              >
                                {combined.startTime}-{combined.endTime}
                              </span>
                            );
                          })}
                        </>
                      );
                    }
                    const isWork = info.type === 'work';
                    const timePos = isWork ? getShiftTimePercent(info) : null;
                    return (
                      <span
                        className={classNames(styles[info.type], styles.shift, styles.dayViewShift, {
                          [styles.dayViewShiftFull]: !isWork
                        })}
                        style={timePos ? { left: `${timePos.left}%`, width: `${timePos.width}%` } : undefined}
                      >
                        {info.title}
                      </span>
                    );
                  })()}
                {clickToCreateShift && (
                  <Grid2 className={styles.iconWrapper}>
                    <AddCircleOutline className={styles.addIcon} fontSize="small" />
                  </Grid2>
                )}
              </TableCell>
            );
          })()}
    </TableRow>
  );
});

export default WorkerRow;
