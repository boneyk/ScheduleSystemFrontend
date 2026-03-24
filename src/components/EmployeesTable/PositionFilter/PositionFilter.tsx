import { FC, useCallback, useEffect, useRef, useState } from 'react';

import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import styles from '../EmployeesTable.module.scss';

import { PositionsDTO } from '@/api/employees_service';

interface PositionFilterProps {
  positions: PositionsDTO[];
  selectedPositionId: number | undefined;
  isSmallDisplay: boolean;
  onChange: (positionId: number | undefined) => void;
}

const FilterButton: FC<{ isSmallDisplay: boolean }> = ({ isSmallDisplay }) => (
  <Box className={styles.filterButton}>
    <FilterListIcon />
    {!isSmallDisplay && 'Фильтр'}
  </Box>
);

const PositionFilter: FC<PositionFilterProps> = ({ positions, selectedPositionId, isSmallDisplay, onChange }) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [open, handleScroll]);

  const handleChange = (event: SelectChangeEvent<number | ''>) => {
    const val = event.target.value;
    onChange(val === '' ? undefined : (val as number));
  };

  return (
    <FormControl size="small" className={styles.filterSelect}>
      <Select
        ref={selectRef}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={selectedPositionId ?? ''}
        onChange={handleChange}
        displayEmpty
        IconComponent={() => null}
        disabled={positions.length === 0}
        renderValue={() => <FilterButton isSmallDisplay={isSmallDisplay} />}
        className={styles.filterSelect}
        MenuProps={{
          disableScrollLock: true
        }}
      >
        <MenuItem value="">Все должности</MenuItem>
        {positions.map((position) => (
          <MenuItem key={position.id} value={position.id}>
            {position.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default PositionFilter;
