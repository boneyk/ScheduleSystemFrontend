import { FC, useState } from 'react';

import { AddCircleOutline } from '@mui/icons-material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Button, FormControl, Grid2, MenuItem, Select } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import arrowBack from 'assets/move-back-arrow.svg';
import arrowForward from 'assets/move-forward-arrow.svg';
import classNames from 'classnames';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { observer } from 'mobx-react-lite';

import DropdownButton, { DropdownProvider } from '@/components/DropdownButton';
import Modal from '@/components/Modals/ModalCreate/ModalCreate';
import ModalCreateShiftForSubstitutionGroup from '@/components/Modals/ModalCreateShiftForSubstitutionGroup/ModalCreateShiftForSubstitutionGroup';
import ModalCreateSubtitution from '@/components/Modals/ModalCreateSubstitution/ModalCreateSubstitution';
import { Sidebar } from '@/components/Sidebar/Sidebar';

import { useTimetableToolbar } from '@/hooks/useTimetableToolbar';
import { isUserAdmin, isUserManager } from '@/utils/auth';

import styles from './TimetableCurrentDateYear.module.scss';
import { modalCreateAbsenceStore } from '@/stores/modalCreateAbsence.store';
import { modalCreateApplicationStore } from '@/stores/modalCreateApplication.store';
import { modalCreateSubstitutionGroupCreateShift } from '@/stores/modalCreateSubstitutionGroupCreateShift.store';
import { timetableStore } from '@/stores/timetable.store';

interface TimetableCurrentDateYearProps {
  showDropdown?: boolean;
  forceMonthView?: boolean;
}

const TimetableCurrentDateYear: FC<TimetableCurrentDateYearProps> = observer(
  ({ showDropdown = true, forceMonthView = false }) => {
    const { offices, selectedOffice, year, isOpen, actionItems, decYear, incYear, handleClose, handleOfficeChange } =
      useTimetableToolbar();

    const { viewType: storeViewType, month, day } = timetableStore;
    const viewType = forceMonthView ? 'month' : storeViewType;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleCloseSidebar = () => setSidebarOpen(false);
    const handleOpenSidebar = () => setSidebarOpen(true);

    return (
      <>
        <Grid2
          container
          className={classNames(styles.wrapper, {
            [styles.column]: !isUserAdmin(),
            [styles.noMarginBottom]: viewType !== 'month'
          })}
        >
          {viewType === 'month' ? (
            <Grid2 container className={styles.dateSection}>
              <Button variant="outlined" color="secondary" className={styles.yearButton} onClick={() => decYear()}>
                <img src={arrowBack} alt="-" />
              </Button>

              <span className={styles.year}>{year}</span>

              <Button variant="outlined" color="secondary" className={styles.yearButton} onClick={() => incYear()}>
                <img src={arrowForward} alt="+" />
              </Button>
            </Grid2>
          ) : (
            <div className={styles.datePickerWrapper}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                <DatePicker
                  className={styles.datePicker}
                  label="Выберите дату"
                  value={dayjs(new Date(year, month, day))}
                  onChange={(newDate) => {
                    if (newDate) {
                      timetableStore.setFullDate(newDate.year(), newDate.month(), newDate.date());
                    }
                  }}
                />
              </LocalizationProvider>
            </div>
          )}

          {showDropdown && (
            <DropdownProvider>
              <Grid2 container className={classNames(styles.tools, { [styles.isDropdown]: !isUserAdmin() })}>
                {(isUserAdmin() || isUserManager()) && (
                  <DropdownButton items={actionItems} icon={<AddCircleOutline />} />
                )}
                {!isUserAdmin() && offices.length > 0 && (
                  <FormControl variant="outlined" className={styles.formControl}>
                    <InputLabel id="office-select-id">Офис</InputLabel>
                    <Select<number>
                      labelId="office-select-id"
                      label="Офис"
                      value={selectedOffice?.id ?? 0}
                      onChange={handleOfficeChange}
                      className={styles.selectOffice}
                    >
                      {offices.map((office) => (
                        <MenuItem key={`office-${office.id}`} value={office.id}>
                          {office.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {(isUserManager() || isUserAdmin()) && (
                  <Button variant="contained" startIcon={<ListAltIcon />} onClick={handleOpenSidebar}>
                    Заявки
                  </Button>
                )}
              </Grid2>
            </DropdownProvider>
          )}

          <Modal isRoleSelectionDisabled={false} isOpen={isOpen} onClose={handleClose} mode="shift" />
          <Modal isOpen={modalCreateAbsenceStore.isOpen} onClose={modalCreateAbsenceStore.close} mode="absence" />
          <ModalCreateSubtitution
            isOpen={modalCreateApplicationStore.isOpen}
            onClose={modalCreateApplicationStore.close}
          />
          <ModalCreateShiftForSubstitutionGroup
            isOpen={modalCreateSubstitutionGroupCreateShift.isOpen}
            onClose={modalCreateSubstitutionGroupCreateShift.close}
          />
        </Grid2>
        <Sidebar open={sidebarOpen} onClose={handleCloseSidebar} />
      </>
    );
  }
);

export default TimetableCurrentDateYear;
