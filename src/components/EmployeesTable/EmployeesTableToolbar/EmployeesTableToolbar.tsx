import { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Grid2 } from '@mui/material';

import styles from '../EmployeesTable.module.scss';
import PositionFilter from '../PositionFilter';

import { PositionsDTO } from '@/api/employees_service';

interface EmployeesTableToolbarProps {
  address: string;
  positions?: PositionsDTO[];
  selectedPositionId: number | undefined;
  isSmallDisplay: boolean;
  isLoading?: boolean;
  onPositionChange: (positionId: number | undefined) => void;
  onAddEmployee: () => void;
  onDeleteEmployee: () => void;
}

const EmployeesTableToolbar: FC<EmployeesTableToolbarProps> = ({
  address,
  positions = [],
  selectedPositionId,
  isSmallDisplay,
  isLoading = false,
  onPositionChange,
  onAddEmployee,
  onDeleteEmployee
}) => (
  <Grid2 container className={styles.infoButtons}>
    <Box className={styles.officeAddress}>{address}</Box>
    <Grid2 className={styles.actionButtons}>
      <Button
        startIcon={isSmallDisplay ? null : <DeleteIcon />}
        variant="outlined"
        color="secondary"
        className={styles.outlinedSpecial}
        disableRipple
        onClick={onDeleteEmployee}
      >
        {isSmallDisplay ? <DeleteIcon /> : 'Удалить'}
      </Button>
      <PositionFilter
        positions={positions}
        selectedPositionId={selectedPositionId}
        isSmallDisplay={isSmallDisplay}
        onChange={onPositionChange}
      />
      <Button
        startIcon={isSmallDisplay ? null : <AddIcon />}
        variant="contained"
        color="primary"
        className={styles.containedSpecial}
        disabled={isLoading}
        onClick={onAddEmployee}
      >
        {isSmallDisplay ? <AddIcon /> : 'Добавить сотрудника в офис'}
      </Button>
    </Grid2>
  </Grid2>
);

export default EmployeesTableToolbar;
