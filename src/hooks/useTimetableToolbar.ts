import { useState } from 'react';

import { SelectChangeEvent } from '@mui/material';
import dayjs from 'dayjs';

import { isUserAdmin, isUserManager } from '@/utils/auth';

import { modalCreateStore } from '@/stores/modalCreate.store';
import { modalCreateAbsenceStore } from '@/stores/modalCreateAbsence.store';
import { modalCreateApplicationStore } from '@/stores/modalCreateApplication.store';
import { modalCreateSubstitutionGroupCreateShift } from '@/stores/modalCreateSubstitutionGroupCreateShift.store';
import { timetableStore } from '@/stores/timetable.store';

export const useTimetableToolbar = () => {
  const { offices, selectedOffice, year, decYear, incYear } = timetableStore;
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  const handleOpen = () => {
    timetableStore.resetRoleAndPerson();
    modalCreateStore.setStartDate(dayjs());
    modalCreateStore.setEndDate(dayjs());
    modalCreateStore.selectPreset(1);
    setIsOpen(true);
  };

  const handleOpenAbsence = () => {
    timetableStore.resetRoleAndPerson();
    modalCreateAbsenceStore.setStartDate(dayjs());
    modalCreateAbsenceStore.setEndDate(dayjs());
    modalCreateAbsenceStore.setEmployeeId(null);
    modalCreateAbsenceStore.setAbsenceTypeId(null);
    modalCreateAbsenceStore.open();
  };

  const handleOpenApplication = () => {
    modalCreateApplicationStore.open();
  };
  const handleOpenCreateShift = () => {
    modalCreateSubstitutionGroupCreateShift.open();
  };
  const actionItems: Record<string, () => void> = {};

  if (isUserAdmin()) {
    actionItems['Создать смену'] = handleOpen;
    actionItems['Создать отсутствие'] = handleOpenAbsence;
    actionItems['Создать заявку на подмену'] = handleOpenApplication;
  }
  if (isUserManager()) {
    actionItems['Назначить смену'] = handleOpenCreateShift;
    actionItems['Создать отсутствие'] = handleOpenAbsence;
  }

  const handleOfficeChange = (event: SelectChangeEvent<number>) => {
    const office = offices.find((o) => o.id === event.target.value);
    if (office) {
      timetableStore.setSelectedOffice(office);
    }
  };

  return {
    offices,
    selectedOffice,
    year,
    isOpen,
    actionItems,
    decYear,
    incYear,
    handleClose,
    handleOfficeChange
  };
};
