import { FC } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { Grid2, IconButton } from '@mui/material';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores/useStores';

import styles from '@/components/Modals/ModalView/ModalView.module.scss';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { ShiftModalData } from '@/hooks/useViewModal';
import { Formats } from '@/utils/formats';
import { isUserAdmin, isUserManager } from 'utils/auth';

import { modalAlertStore } from '@/stores/modalAlert.store';
import { modalCreateStore } from '@/stores/modalCreate.store';
import { modalDeleteStore } from '@/stores/modalDelete.store';
import { modalEditSubstitutionGroupStore } from '@/stores/modalEditSubstitutionGroupCreateShift.store';
import { modalSelectDatesToDeleteStore, shiftsWithIds } from '@/stores/modalSelectDatesToDelete.store';

dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

interface ModalViewButtonsProps {
  onClose: () => void;
  shift: ShiftModalData;
}

export const ModalViewButtons: FC<ModalViewButtonsProps> = observer(({ onClose, shift }) => {
  const { timetableStore } = useStores();

  const onEdit = () => {
    (document.activeElement as HTMLElement)?.blur();
    const clickedDay = shift.dayIndex + 1;
    const clickedDate = dayjs().year(timetableStore.year).month(timetableStore.month).date(clickedDay);
    const [startHour, startMinute] = shift.text.slice(0, 5).split(':').map(Number);
    const [endHour, endMinute] = shift.text.slice(6, 11).split(':').map(Number);
    const startDateTime = clickedDate.hour(startHour).minute(startMinute).second(0);
    const endDateTime = clickedDate.hour(endHour).minute(endMinute).second(0);

    if (isUserManager()) {
      modalEditSubstitutionGroupStore.setSelectedRole(shift.job);
      modalEditSubstitutionGroupStore.setSelectedEmployee({
        id: shift.employeeId,
        name: shift.fullname
      });
      modalEditSubstitutionGroupStore.setStartDate(startDateTime.hour(0).minute(0));
      modalEditSubstitutionGroupStore.setEndDate(endDateTime.hour(0).minute(0));
      modalEditSubstitutionGroupStore.setShiftStartTime(startDateTime);
      modalEditSubstitutionGroupStore.setShiftEndTime(endDateTime);
      modalEditSubstitutionGroupStore.setShiftId(shift.id);
      modalEditSubstitutionGroupStore.setShiftData(shift);
      modalEditSubstitutionGroupStore.setShiftDates(shift.startOn, shift.endOn);
      if (!shift.office) return;
      modalEditSubstitutionGroupStore.setSelectedCityId(shift.office.cityId);
      modalEditSubstitutionGroupStore.setSelectedOffice(shift.office);
      onClose();
    } else {
      timetableStore.initRoleAndEmployee(shift.job, { id: shift.employeeId, name: shift.fullname });
      modalCreateStore.setStartDate(startDateTime);
      modalCreateStore.setEndDate(endDateTime);
      modalCreateStore.setShiftStartTime(startDateTime);
      modalCreateStore.setShiftEndTime(endDateTime);
      modalCreateStore.setShiftId(shift.id);
      modalCreateStore.setShiftDates(shift.startOn, shift.endOn);
      modalCreateStore.setShiftData(shift);
      onClose();
    }
    const isHistorical = clickedDate.isBefore(dayjs().hour(0).minute(0).second(0), 'day');
    if (isHistorical) {
      modalAlertStore.open(shift, startDateTime, endDateTime);
    } else {
      if (isUserAdmin()) {
        modalCreateStore.open('edit');
      } else {
        modalEditSubstitutionGroupStore.open();
      }
    }
  };

  const onDelete = () => {
    if (!shift?.id) return;
    onClose();

    const startOn = dayjs(shift.startOn, Formats.DATE_SHORT);
    const endOn = dayjs(shift.endOn, Formats.DATE_SHORT);

    if (!startOn.isValid() || !endOn.isValid()) {
      return;
    }
    const shiftDates: shiftsWithIds[] = [];

    let currentDate = startOn;
    while (currentDate.isSameOrBefore(endOn, 'day')) {
      shiftDates.push({ date: currentDate, id: shift.id });
      currentDate = currentDate.add(1, 'day');
    }
    if (shiftDates.length === 1) {
      modalDeleteStore.open(shift.id, shift, startOn, endOn, 'single');
    } else {
      modalSelectDatesToDeleteStore.open(shift, shiftDates);
    }
  };

  const isSubstitutionGroup = shift.substitutionGroup;
  const isAttachedToOffice = shift.attachedToOffice;
  const isAbsence = shift.type !== 'work';
  const shiftStartDate = dayjs(shift.startOn, Formats.DATE_SHORT);
  const isPastShift = shiftStartDate.isBefore(dayjs(), 'day');

  const canEditAdmin = !isSubstitutionGroup && isUserAdmin() && !isAbsence;
  const canDeleteAdmin = !isSubstitutionGroup && isUserAdmin() && (isAttachedToOffice || !isAbsence || isPastShift);
  const canEditManager = isUserManager() && !isAbsence && !shift.isCombined;
  const canDeleteManager = isUserManager() && !shift.isCombined;
  return (
    <Grid2 className={styles.stackPosition}>
      {(canEditAdmin || canEditManager) && (
        <IconButton onClick={onEdit}>
          <EditIcon />
        </IconButton>
      )}
      {(canDeleteAdmin || canDeleteManager) && (
        <IconButton onClick={onDelete}>
          <DeleteForeverIcon />
        </IconButton>
      )}
      <IconButton aria-label="close" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Grid2>
  );
});
