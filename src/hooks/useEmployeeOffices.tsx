import { useQuery } from '@tanstack/react-query';

import { decodeAuthToken, isUserAdmin, isUserManager } from '@/utils/auth';

import {
  absenceTypesKey,
  employeeEntityKey,
  fetchAbsenceTypes,
  fetchEmployeeEntity,
  fetchOffices,
  officesKey
} from '@/api/queries';

export const useEmployeeOffices = () => {
  const { userId } = decodeAuthToken(localStorage.getItem('accessToken'));

  const employeeQuery = useQuery({
    queryKey: userId ? employeeEntityKey(userId) : ['employee-disabled'],
    queryFn: fetchEmployeeEntity,
    enabled: !!userId
  });

  const employeeId = employeeQuery.data?.id;

  const officesQuery = useQuery({
    queryKey: employeeId ? officesKey(employeeId) : ['offices-disabled'],
    queryFn: fetchOffices,
    enabled: !!employeeId && !isUserManager()
  });
  const absenceTypeQuery = useQuery({
    queryKey: absenceTypesKey(),
    queryFn: fetchAbsenceTypes,
    enabled: isUserAdmin() || isUserManager()
  });

  return {
    employeeQuery,
    officesQuery,
    absenceTypeQuery
  };
};
