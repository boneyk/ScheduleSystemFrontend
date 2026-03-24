import { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { useStores } from 'stores/useStores';

import { isUserAdmin } from '@/utils/auth';

import { CreateShiftView } from './CreateView';
import { DisabledView } from './DisabledView';
import { ModalCreateMode } from '@/types/schedule';

type ModalCreateRoleAndPersonProps = {
  isDisabled: boolean;
  mode: ModalCreateMode;
};

export const ModalCreateRoleAndPerson: FC<ModalCreateRoleAndPersonProps> = observer(({ isDisabled }) => {
  const { timetableStore } = useStores();
  const {
    roles,
    selectedRole,
    selectedEmployee,
    getEmployeesByRole,
    getEmployeesByRoleWithSubstitutionGroup,
    setSelectedRole,
    setSelectedEmployee
  } = timetableStore;

  const getEmployees = () => {
    if (!selectedRole) return [];
    if (isUserAdmin()) return getEmployeesByRole(selectedRole);
    return getEmployeesByRoleWithSubstitutionGroup(selectedRole);
  };

  const employees = getEmployees();

  const roleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(event.target.value);
  };

  const changeEmployee = (_: unknown, value: { id: number; name: string } | null) => {
    setSelectedEmployee(value);
  };
  const getOptionLabel = (option: { id: number; name: string }) => option.name;
  const isOptionEqualToValue = (option: { id: number; name: string }, value: { id: number; name: string }) =>
    option.name === value.name;

  const roleLabel = !isDisabled ? 'Выберите должность' : 'Должность:';
  const employeeLabel = !isDisabled ? 'Выберите сотрудника' : 'Сотрудник:';

  return isDisabled ? (
    <DisabledView
      roleLabel={roleLabel}
      employeeLabel={employeeLabel}
      selectedRole={selectedRole}
      selectedEmployeeName={selectedEmployee?.name}
    />
  ) : (
    <CreateShiftView
      roles={roles}
      selectedRole={selectedRole}
      selectedEmployee={selectedEmployee}
      employees={employees}
      roleLabel={roleLabel}
      employeeLabel={employeeLabel}
      onRoleChange={roleChange}
      onEmployeeChange={changeEmployee}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
    />
  );
});
