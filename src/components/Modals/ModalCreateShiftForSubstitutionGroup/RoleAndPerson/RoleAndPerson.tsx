import { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { useStores } from 'stores/useStores';

import { CreateShiftView } from './CreateView';
import { DisabledView } from './DisabledView';
import { modalCreateSubstitutionGroupCreateShift } from '@/stores/modalCreateSubstitutionGroupCreateShift.store';

type ModalCreateRoleAndPersonProps = {
  isDisabled: boolean;
};

export const RoleAndPerson: FC<ModalCreateRoleAndPersonProps> = observer(({ isDisabled }) => {
  const { timetableStore } = useStores();
  const { roles, getEmployeesByRoleWithSubstitutionGroup } = timetableStore;
  const { selectedRole, selectedEmployee, setSelectedRole, setSelectedEmployee } =
    modalCreateSubstitutionGroupCreateShift;
  const employees = selectedRole ? getEmployeesByRoleWithSubstitutionGroup(selectedRole) : [];

  const roleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(event.target.value);
    setSelectedEmployee(null);
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
