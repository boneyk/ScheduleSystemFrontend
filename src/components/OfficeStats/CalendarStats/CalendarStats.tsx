import { FC } from 'react';

import { Grid2 } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';

import { Formats } from '@/utils/formats';

import styles from './CalendarStats.module.scss';
import DayCard from './DayCard/DayCard';
import type { WeeklyStatsDayDto } from '@/dto/DtoSchedule';

interface CalendarStatsProps {
  weeklyData: WeeklyStatsDayDto[];
  selectedDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
}

const CalendarStats: FC<CalendarStatsProps> = ({ weeklyData, selectedDate, onDateChange }) => {
  return (
    <Grid2 container className={styles.wrapper}>
      <Grid2 container className={styles.filtersWrapper}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
          <DatePicker
            className={styles.dayPicker}
            label="День(Неделя)"
            value={selectedDate}
            onChange={(date) => date?.isValid() && onDateChange(date)}
            slotProps={{
              textField: {
                fullWidth: true,
                InputLabelProps: { shrink: true },
                placeholder: 'DD.MM.YYYY'
              }
            }}
          />
        </LocalizationProvider>
      </Grid2>
      <Grid2 container className={styles.weekView}>
        {(() => {
          const d = selectedDate.day();
          const weekMonday = selectedDate.subtract(d === 0 ? 6 : d - 1, 'day');
          return Array.from({ length: 7 }, (_, i) => {
            const day = weekMonday.add(i, 'day');
            const dayStr = day.format(Formats.DATE_API);
            const dayEntry = weeklyData.find((entry) => (entry.date ?? entry.reportDate) === dayStr);
            return (
              <DayCard
                key={dayStr}
                date={day}
                isSelected={day.isSame(selectedDate, 'day')}
                roles={dayEntry?.dateData ?? dayEntry?.positions ?? []}
              />
            );
          });
        })()}
      </Grid2>
    </Grid2>
  );
};

export default CalendarStats;
