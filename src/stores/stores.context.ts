import React from 'react';

import { baseLayoutStore } from './baseLayout.store';
import { employeesStore } from './employees.store';
import { modalCreateStore } from './modalCreate.store';
import { statsStore } from './stats.store';
import { timesheetStore } from './timesheet.store';
import { timetableStore } from './timetable.store';

export const StoresContext = React.createContext({
  timetableStore,
  baseLayoutStore,
  employeesStore,
  modalCreateStore,
  statsStore,
  timesheetStore
});
