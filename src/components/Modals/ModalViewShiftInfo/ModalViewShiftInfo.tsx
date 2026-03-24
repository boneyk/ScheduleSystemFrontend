import { FC } from 'react';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import { Divider, IconButton, Stack, Typography } from '@mui/material';

import { ShiftModalData } from '@/hooks/useViewModal';
import { isUserManager } from '@/utils/auth';

import styles from './ModalViewShiftInfo.module.scss';
import { CombinedShifts } from '@/types/schedule';

interface ModalViewShiftInfoProps {
  shiftData: ShiftModalData;
  onEdit: (shift: CombinedShifts) => void;
  onDelete: (shift: CombinedShifts) => void;
}

export const ModalViewShiftInfo: FC<ModalViewShiftInfoProps> = ({ shiftData, onEdit, onDelete }) => {
  const formattedDates =
    shiftData.startOn === shiftData.endOn ? shiftData.startOn : `${shiftData.startOn} - ${shiftData.endOn}`;
  return (
    <Stack direction="column" spacing={2}>
      {shiftData.shiftsForCombined && shiftData.shiftsForCombined.length > 0 ? (
        <Stack direction="column" spacing={1}>
          {shiftData.shiftsForCombined.map((shift, index) => {
            return (
              <Stack key={shift.id} direction="column" spacing={0.5}>
                {index > 0 && <Divider />}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="column" spacing={0.5}>
                    <Stack direction="row" spacing={1} className={styles.infoRow}>
                      <AccessTimeIcon />
                      <Typography>
                        {shift.startTime} - {shift.endTime}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} className={styles.infoRow}>
                      <BusinessIcon />
                      <Typography>
                        {shift.office.name}, {shift.office.address}
                      </Typography>
                    </Stack>
                  </Stack>
                  {isUserManager() && (
                    <Stack direction="row">
                      <IconButton size="small" onClick={() => onEdit(shift)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => onDelete(shift)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      ) : (
        <>
          {shiftData.office && (
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} className={styles.infoRow}>
                  <BusinessIcon />
                  <Typography>
                    {shiftData.office.name}, {shiftData.office.address}
                  </Typography>
                </Stack>
              </Stack>
              <Divider />
            </>
          )}
        </>
      )}
      <Stack direction="row" spacing={1} className={styles.infoRow}>
        <DateRangeIcon />
        <Typography>{formattedDates}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} className={styles.infoRow}>
        <PersonIcon />
        <Typography>{shiftData.fullname}</Typography>
      </Stack>
    </Stack>
  );
};
