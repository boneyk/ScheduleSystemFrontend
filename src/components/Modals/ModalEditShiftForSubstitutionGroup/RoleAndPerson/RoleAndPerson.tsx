import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { DisabledView } from './DisabledView';
import { modalEditSubstitutionGroupStore } from '@/stores/modalEditSubstitutionGroupCreateShift.store';

type RoleAndPersonProps = {
  isDisabled: boolean;
};

export const RoleAndPerson: FC<RoleAndPersonProps> = observer(({ isDisabled }) => {
  const { selectedRole, selectedEmployee } = modalEditSubstitutionGroupStore;

  const roleLabel = !isDisabled ? 'Выберите должность' : 'Должность:';
  const employeeLabel = !isDisabled ? 'Выберите сотрудника' : 'Сотрудник:';
  return (
    <DisabledView
      roleLabel={roleLabel}
      employeeLabel={employeeLabel}
      selectedRole={selectedRole}
      selectedEmployeeName={selectedEmployee?.name}
    />
  );
});
