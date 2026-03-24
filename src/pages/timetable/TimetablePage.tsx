import { useEffect } from 'react';

import TimetableWidget from '../../components/TimetableComponent';

import { useEmployeeOffices } from '@/hooks/useEmployeeOffices';
import { isUserAdmin, isUserManager } from '@/utils/auth';

import { modalCreateAbsenceStore } from '@/stores/modalCreateAbsence.store';
import { modalCreateSubstitutionGroupCreateShift } from '@/stores/modalCreateSubstitutionGroupCreateShift.store';
import { timetableStore } from '@/stores/timetable.store';

const TimetablePage = () => {
  const { employeeQuery, officesQuery, absenceTypeQuery } = useEmployeeOffices();

  useEffect(() => {
    const isAllLoaded =
      employeeQuery.isSuccess &&
      (isUserManager() || officesQuery.isSuccess) &&
      ((!isUserAdmin() && !isUserManager()) || absenceTypeQuery.isSuccess);

    if (!isAllLoaded) return;
    if (!employeeQuery.data) return;
    timetableStore.setEmployee(employeeQuery.data);
    modalCreateSubstitutionGroupCreateShift.setEmployees(employeeQuery.data);
    timetableStore.setRegionId(employeeQuery.data.regionId);
    timetableStore.setPositionId(employeeQuery.data.position.id);
    if (!isUserManager()) {
      const firstOffice = officesQuery.data?.[0];
      if (!firstOffice || !officesQuery.data) return;
      timetableStore.setSelectedOffice(firstOffice);
      timetableStore.setOffices(officesQuery.data);
      timetableStore.setOfficeTimetable(officesQuery.data);
    }
    if (!absenceTypeQuery.data) return;
    modalCreateAbsenceStore.setAbsenceTypes(absenceTypeQuery.data);
  }, [
    employeeQuery.isSuccess,
    employeeQuery.data,
    officesQuery.isSuccess,
    officesQuery.data,
    absenceTypeQuery.isSuccess,
    absenceTypeQuery.data
  ]);

  return <TimetableWidget />;
};

export default TimetablePage;
