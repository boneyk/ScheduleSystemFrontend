import { Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';

import styles from '@/components/Modals/ModalView/ModalView.module.scss';

import { isUserAdmin, isUserManager } from '@/utils/auth';
import { Formats } from '@/utils/formats';

import { ModalViewButtons } from '../ModalViewButtons/ModalViewButtons';
import { ModalViewShiftInfo } from '../ModalViewShiftInfo/ModalViewShiftInfo';
import { ModalViewShiftTitle } from '../ModalViewShiftTitle/ModalViewShiftTitle';

import { modalAlertStore } from '@/stores/modalAlert.store';
import { modalCreateStore } from '@/stores/modalCreate.store';
import { modalDeleteStore } from '@/stores/modalDelete.store';
import { modalEditSubstitutionGroupStore } from '@/stores/modalEditSubstitutionGroupCreateShift.store';
import { modalSelectDatesToDeleteStore, shiftsWithIds } from '@/stores/modalSelectDatesToDelete.store';
import { modalViewStore } from '@/stores/modalView.store';
import { timetableStore } from '@/stores/timetable.store';
import { CombinedShifts } from '@/types/schedule';

const ModalView = observer(() => {
  const { isOpen, shiftData } = modalViewStore;
  const handleClose = () => {
    modalViewStore.close();
  };

  const onEdit = (shift: CombinedShifts) => {
    if (!shiftData) return;
    (document.activeElement as HTMLElement)?.blur();

    const clickedDay = shiftData.dayIndex + 1;
    const clickedDate = dayjs().year(timetableStore.year).month(timetableStore.month).date(clickedDay);

    const [startHour, startMinute] = shift.startTime.split(':').map(Number);
    const [endHour, endMinute] = shift.endTime.split(':').map(Number);
    const startDateTime = clickedDate.hour(startHour).minute(startMinute).second(0);
    const endDateTime = clickedDate.hour(endHour).minute(endMinute).second(0);

    if (isUserManager()) {
      modalEditSubstitutionGroupStore.setSelectedRole(shiftData.job);
      modalEditSubstitutionGroupStore.setSelectedEmployee({
        id: shiftData.employeeId,
        name: shiftData.fullname
      });
      modalEditSubstitutionGroupStore.setStartDate(startDateTime.hour(0).minute(0));
      modalEditSubstitutionGroupStore.setEndDate(endDateTime.hour(0).minute(0));
      modalEditSubstitutionGroupStore.setShiftStartTime(startDateTime);
      modalEditSubstitutionGroupStore.setShiftEndTime(endDateTime);
      modalEditSubstitutionGroupStore.setShiftId(shift.id);
      modalEditSubstitutionGroupStore.setShiftData(shiftData);
      modalEditSubstitutionGroupStore.setShiftDates(shiftData.startOn, shiftData.endOn);
      modalEditSubstitutionGroupStore.setSelectedCityId(shift.office.cityId);
      modalEditSubstitutionGroupStore.setSelectedOffice(shift.office);
      handleClose();
    } else {
      timetableStore.initRoleAndEmployee(shiftData.job, { id: shiftData.employeeId, name: shiftData.fullname });
      modalCreateStore.setStartDate(startDateTime);
      modalCreateStore.setEndDate(endDateTime);
      modalCreateStore.setShiftStartTime(startDateTime);
      modalCreateStore.setShiftEndTime(endDateTime);
      modalCreateStore.setShiftId(shiftData.id);
      modalCreateStore.setShiftDates(shiftData.startOn, shiftData.endOn);
      modalCreateStore.setShiftData(shiftData);
      handleClose();
    }

    const isHistorical = clickedDate.isBefore(dayjs().hour(0).minute(0).second(0), 'day');
    if (isHistorical) {
      modalAlertStore.open(shiftData, startDateTime, endDateTime);
    } else {
      if (isUserAdmin()) {
        modalCreateStore.open('edit');
      } else {
        modalEditSubstitutionGroupStore.open();
      }
    }
  };

  const onDelete = (shift: CombinedShifts) => {
    if (!shiftData) return;

    const startOn = dayjs(shiftData.startOn, Formats.DATE_SHORT);
    const endOn = dayjs(shiftData.endOn, Formats.DATE_SHORT);

    const shiftDates: shiftsWithIds[] = [];
    let currentDate = startOn;
    while (currentDate.isSameOrBefore(endOn, 'day')) {
      shiftDates.push({ date: currentDate, id: shift.id });
      currentDate = currentDate.add(1, 'day');
    }

    if (shiftDates.length === 1) {
      handleClose();
      modalDeleteStore.open(shift.id, shiftData, startOn, endOn, 'single');
    } else {
      modalSelectDatesToDeleteStore.open(shiftData, shiftDates);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      onTransitionEnd={() => !isOpen && modalViewStore.reset()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className={styles.wrapper}>
        {!shiftData ? (
          <Typography color="text.secondary">Нет данных о смене</Typography>
        ) : (
          <ModalViewShiftTitle shiftData={shiftData} />
        )}
        {shiftData && <ModalViewButtons onClose={handleClose} shift={shiftData} />}
      </DialogTitle>
      <DialogContent dividers className={styles.content}>
        {!shiftData ? (
          <Typography color="text.secondary">Нет данных о смене</Typography>
        ) : (
          <ModalViewShiftInfo shiftData={shiftData} onEdit={onEdit} onDelete={onDelete} />
        )}
      </DialogContent>
    </Dialog>
  );
});

export default ModalView;
