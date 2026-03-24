import { FC, ReactNode } from 'react';

import { Box, CircularProgress } from '@mui/material';
import classNames from 'classnames';

import styles from './SpinCentered.module.scss';

interface SpinCenteredProps {
  loading?: boolean;
  size?: number;
  className?: string;
  children?: ReactNode;
  overlay?: boolean;
}

const SpinCentered: FC<SpinCenteredProps> = ({ loading = true, size = 40, className, children, overlay = false }) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <Box className={classNames(overlay ? styles.overlay : styles.spin, className)}>
      <CircularProgress size={size} />
    </Box>
  );
};

export default SpinCentered;
