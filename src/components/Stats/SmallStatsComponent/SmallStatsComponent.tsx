import { FC } from 'react';

import { Box, Typography } from '@mui/material';

import styles from './SmallStatsComponent.module.scss';

interface SmallStatsComponentProps {
  widgetName: string;
  description?: string;
  value: number | string;
  measurement: string;
}

const formatValue = (value: number | string, measurement: string): string => {
  if (typeof value === 'string' && /^\d+:\d{2}$/.test(value)) {
    const [h, m] = value.split(':').map(Number);
    return `${h} ч. ${String(m).padStart(2, '0')} мин.`;
  }
  return `${value} ${measurement}`;
};

const SmallStatsComponent: FC<SmallStatsComponentProps> = ({ widgetName, description, value, measurement }) => {
  return (
    <Box className={styles.wrapper}>
      <Typography variant="h6" className={styles.widgetName}>
        {widgetName}
      </Typography>
      <Typography className={styles.description}> {description} </Typography>
      <Typography variant="h3" className={styles.value}>
        {formatValue(value, measurement)}
      </Typography>
      <div className={styles.progressbar} />
    </Box>
  );
};

export default SmallStatsComponent;
