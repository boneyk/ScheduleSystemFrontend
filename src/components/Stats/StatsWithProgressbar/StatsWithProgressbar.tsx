import { FC } from 'react';

import { Grid2, Typography } from '@mui/material';

import styles from './StatsWithProgressbar.module.scss';

interface StatsWithProgressbarProps {
  widgetName: string;
  date: string;
  goal: string;
  completed: string;
  measurement: string;
}

const parseMinutes = (hoursStr: string): number => {
  const [h, m] = hoursStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const formatHoursLabel = (hoursStr: string): string => {
  const [h, m] = hoursStr.split(':').map(Number);
  return `${h || 0} ч. ${String(m || 0).padStart(2, '0')} мин.`;
};

const StatsWithProgressbar: FC<StatsWithProgressbarProps> = ({ widgetName, date, goal, completed }) => {
  const goalMinutes = parseMinutes(goal);
  const completedMinutes = parseMinutes(completed);
  const widthPercent = goalMinutes > 0 ? Math.min((completedMinutes / goalMinutes) * 100, 100) : 0;

  return (
    <Grid2 container className={styles.wrapper}>
      <Typography variant="h6" className={styles.widgetName}>
        {widgetName}
      </Typography>
      <Typography className={styles.description}> {date} </Typography>
      <Typography variant="h3" className={styles.value}>
        {formatHoursLabel(completed)} / {formatHoursLabel(goal)}
      </Typography>
      <div className={styles.progressbar}>
        <div className={styles.progress} style={{ width: `${widthPercent}%` }} />
      </div>
    </Grid2>
  );
};

export default StatsWithProgressbar;
