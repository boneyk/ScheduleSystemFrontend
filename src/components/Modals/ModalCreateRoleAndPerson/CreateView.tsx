import { FC } from 'react';

import { Autocomplete, Grid2, MenuItem, TextField } from '@mui/material';

import styles from '../ModalCreate/ModalCreate.module.scss';

type Employee = { id: number; name: string };

type CreateShiftViewProps = {
  roles: string[];
  selectedRole?: string | null;
  selectedEmployee: Employee | null;
  employees: Employee[];
  roleLabel: string;
  employeeLabel: string;
  onRoleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmployeeChange: (_: unknown, value: Employee | null) => void;
  getOptionLabel: (option: Employee) => string;
  isOptionEqualToValue: (option: Employee, value: Employee) => boolean;
};

export const CreateShiftView: FC<CreateShiftViewProps> = ({
  roles,
  selectedRole,
  selectedEmployee,
  employees,
  roleLabel,
  employeeLabel,
  onRoleChange,
  onEmployeeChange,
  getOptionLabel,
  isOptionEqualToValue
}) => {
  return (
    <Grid2 container spacing={2} alignItems="center" className={styles.container}>
      <TextField
        select
        label={roleLabel}
        value={selectedRole || ''}
        onChange={onRoleChange}
        fullWidth
        className={styles.picker}
      >
        {roles.map((roleName) => (
          <MenuItem key={roleName} value={roleName}>
            {roleName}
          </MenuItem>
        ))}
      </TextField>

      <Autocomplete
        options={employees}
        value={selectedEmployee}
        onChange={onEmployeeChange}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        noOptionsText="Нет сотрудников"
        disabled={!selectedRole}
        renderInput={(params) => (
          <TextField {...params} label={employeeLabel} placeholder="Начните вводить ФИО" className={styles.picker} />
        )}
        fullWidth
      />
    </Grid2>
  );
};
