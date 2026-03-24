import { useEffect, useMemo } from 'react';

import { Grid2, Typography } from '@mui/material';
import { Grid } from '@mui/system';
import { useQuery } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';

import CalendarStats from '@/components/OfficeStats/CalendarStats';
import WorkerStats from '@/components/OfficeStats/WorkerStats';
import SmallStatsComponent from '@/components/Stats/SmallStatsComponent';
import StatsWithProgressbar from '@/components/Stats/StatsWithProgressbar';

import { decodeAuthToken, isUserManager } from '@/utils/auth';
import { Formats } from '@/utils/formats';

import styles from './StatsPage.module.scss';
import {
  employeeEntityKey,
  fetchEmployeeEntity,
  fetchMonthlyStats,
  fetchOffices,
  fetchWeeklyStats,
  monthlyStatsKey,
  officesKey,
  weeklyStatsKey
} from '@/api/queries';
import type { WeeklyStatsDayDto, WeeklyStatsResponse } from '@/dto/DtoSchedule';
import { useStores } from '@/stores/useStores';

const addHoursStrings = (a: string, b: string): string => {
  const parseMin = (s: string) => {
    const [h, m] = s.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const total = parseMin(a) + parseMin(b);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const StatsPage = observer(() => {
  const { timetableStore, statsStore } = useStores();
  const { selectedDate } = statsStore;

  const isSubGroup = isUserManager();

  const { userId } = decodeAuthToken(localStorage.getItem('accessToken'));
  const employeeQuery = useQuery({
    queryKey: userId ? employeeEntityKey(userId) : ['employee-disabled'],
    queryFn: fetchEmployeeEntity,
    enabled: !!userId
  });

  const officesQuery = useQuery({
    queryKey: employeeQuery.data && !isSubGroup ? officesKey(employeeQuery.data.id) : ['offices-disabled'],
    queryFn: fetchOffices,
    enabled: !!employeeQuery.data && !isSubGroup
  });

  useEffect(() => {
    if (!isSubGroup && !timetableStore.selectedOffice && officesQuery.data?.length && employeeQuery.data) {
      timetableStore.setSelectedOffice(officesQuery.data[0]);
    }
  }, [isSubGroup, timetableStore, officesQuery.data, employeeQuery.data]);

  const regionId = isSubGroup ? employeeQuery.data?.regionId : undefined;
  const officeId = isSubGroup ? undefined : (timetableStore.selectedOffice?.id ?? officesQuery.data?.[0]?.id);

  const hasParams = !!(officeId || regionId);

  const month = selectedDate.month() + 1;
  const year = selectedDate.year();
  const weekStartDate = useMemo(() => {
    const d = selectedDate.day();
    return selectedDate.subtract(d === 0 ? 6 : d - 1, 'day');
  }, [selectedDate]);
  const weekStart = weekStartDate.format(Formats.DATE_API);

  const monthlyStatsQuery = useQuery({
    queryKey: hasParams ? monthlyStatsKey(officeId, regionId, month, year) : ['monthlyStats-disabled'],
    queryFn: fetchMonthlyStats,
    enabled: hasParams
  });

  const weeklyStatsQuery = useQuery({
    queryKey: hasParams ? weeklyStatsKey(officeId, regionId, weekStart) : ['weeklyStats-disabled'],
    queryFn: fetchWeeklyStats,
    enabled: hasParams
  });

  const monthlyStats = monthlyStatsQuery.data;

  // Нормализация: поддержка старого формата (массив) и нового (объект с daylyData/dailyStatistics)
  const weeklyRaw = weeklyStatsQuery.data as unknown as WeeklyStatsResponse | WeeklyStatsDayDto[] | undefined;
  const weeklyDaylyData = useMemo<WeeklyStatsDayDto[]>(() => {
    if (!weeklyRaw) return [];
    return Array.isArray(weeklyRaw) ? weeklyRaw : (weeklyRaw?.daylyData ?? weeklyRaw?.dailyStatistics ?? []);
  }, [weeklyRaw]);
  const weeklyPlanHours = useMemo(() => {
    if (!weeklyRaw) return '0:00';
    if (Array.isArray(weeklyRaw))
      return weeklyRaw.reduce((acc, d) => addHoursStrings(acc, d.planHours ?? '0:00'), '0:00');
    return weeklyRaw.planHours ?? '0:00';
  }, [weeklyRaw]);
  const weeklyFactHours = useMemo(() => {
    if (!weeklyRaw) return '0:00';
    if (Array.isArray(weeklyRaw))
      return weeklyRaw.reduce((acc, d) => addHoursStrings(acc, d.actualHours ?? '0:00'), '0:00');
    return weeklyRaw.factHours ?? weeklyRaw.actualHours ?? '0:00';
  }, [weeklyRaw]);

  const selectedDayStr = selectedDate.format(Formats.DATE_API);
  const dayEntry = weeklyDaylyData.find((d) => (d.date ?? d.reportDate) === selectedDayStr);

  const weekEnd = weekStartDate.add(6, 'day');
  const weekRangeLabel = `${weekStartDate.format(Formats.DATE_SHORT)} - ${weekEnd.format(Formats.DATE_SHORT)}`;

  return (
    <div className={styles.pageContainer}>
      <Typography variant="h1" className={styles.pageName}>
        Статистика по офису
      </Typography>

      <Grid container className={styles.wrapper}>
        <Grid2 container className={styles.topWidgetsWrapper}>
          <Grid2 container className={styles.smallWidgetWrapper}>
            <Grid2 className={styles.smallWidgetsColumnWrapper}>
              <SmallStatsComponent
                widgetName="План часов в месяц"
                value={monthlyStats?.planHours ?? '—'}
                measurement={'ч.'}
              />
              <SmallStatsComponent
                widgetName="Переработки в месяц"
                description={'Общее время переработок для всех сотрудников за месяц'}
                value={monthlyStats?.overtimeHours ?? '—'}
                measurement={'ч.'}
              />
            </Grid2>
            <Grid2 className={styles.smallWidgetsColumnWrapper}>
              <SmallStatsComponent
                widgetName="Фактически часов в месяц"
                value={monthlyStats?.actualHours ?? '—'}
                measurement={'ч.'}
              />
              <SmallStatsComponent
                widgetName="Недоработки в месяц"
                description={'Общее время недоработок для всех сотрудников за месяц'}
                value={monthlyStats?.missingHours ?? '—'}
                measurement={'ч.'}
              />
            </Grid2>
          </Grid2>
          <Grid2 container className={styles.wideWidgetsWrapper}>
            <SmallStatsComponent
              widgetName={'Итоги дня'}
              description={selectedDate.format(Formats.DATE_SHORT)}
              value={dayEntry?.actualHours ?? '0:00'}
              measurement={'ч.'}
            />
            <StatsWithProgressbar
              widgetName={'Итоги недели'}
              date={weekRangeLabel}
              goal={weeklyPlanHours}
              completed={weeklyFactHours}
              measurement={'ч.'}
            />
          </Grid2>
        </Grid2>
        <Grid2 container className={styles.bigWidgetsWrapper}>
          <CalendarStats
            weeklyData={weeklyDaylyData}
            selectedDate={selectedDate}
            onDateChange={statsStore.setSelectedDate}
          />
          <WorkerStats officeId={officeId} regionId={regionId} weekStart={weekStart} />
        </Grid2>
      </Grid>
    </div>
  );
});

export default StatsPage;
