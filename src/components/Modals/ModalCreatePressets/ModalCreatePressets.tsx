import { FC } from 'react';

import {
  CircularProgress,
  Grid2,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { DateRangeIcon } from '@mui/x-date-pickers';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { modalCreateStore, ShiftPreset } from 'stores/modalCreate.store';
import { modalCreateAbsenceStore } from 'stores/modalCreateAbsence.store';

import { OfficeScheduleHint } from '@/components/OfficeScheduleHint/OfficeScheduleHint';

import styles from '../ModalCreate/ModalCreate.module.scss';

import { ModalCreateMode } from '@/types/schedule';

interface ModalCreatePressetsProps {
  mode: ModalCreateMode;
}

export const ModalCreatePressets: FC<ModalCreatePressetsProps> = observer(({ mode }) => {
  const changePresset = (_: unknown, newId: number | null) => {
    modalCreateStore.selectPreset(newId);
  };
  const changeAbsenceType = (_: unknown, newId: number | null) => {
    modalCreateAbsenceStore.setAbsenceTypeId(newId);
  };
  const isAbsence = mode === 'absence';
  const isManyAbsenceTypes = modalCreateAbsenceStore.absenceTypes.length > 3;
  const selectText = (isAbsence: boolean) => (isAbsence ? 'Выберите тип отсутствия:' : 'Период работы');
  const isLoading = modalCreateAbsenceStore.isLoadingTypes;
  const shouldShowAbsenceSelector = !isLoading && modalCreateAbsenceStore.absenceTypes.length > 0;
  const handleAbsenceTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    modalCreateAbsenceStore.setAbsenceTypeId(Number(e.target.value));
  };

  return (
    <Grid2 container className={classNames(styles.containerHeader, { [styles.manyAbsence]: isManyAbsenceTypes })}>
      <Grid2 className={styles.sectionName}>
        <DateRangeIcon />
        <Typography>{selectText(isAbsence)}</Typography>
        {!isAbsence && <OfficeScheduleHint />}
      </Grid2>

      {isAbsence ? (
        <>
          {isLoading && <CircularProgress size={20} className={styles.absenceLoader} />}
          {shouldShowAbsenceSelector &&
            (isManyAbsenceTypes ? (
              <TextField
                select
                size="small"
                label="Тип отсутствия"
                value={modalCreateAbsenceStore.absenceTypeId ?? ''}
                onChange={handleAbsenceTypeChange}
                className={styles.selectWrapper}
                disabled={isLoading}
              >
                {modalCreateAbsenceStore.absenceTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <ToggleButtonGroup
                value={modalCreateAbsenceStore.absenceTypeId}
                exclusive
                onChange={changeAbsenceType}
                className={styles.toggleWrapper}
                disabled={isLoading}
              >
                {modalCreateAbsenceStore.absenceTypes.map((type) => (
                  <ToggleButton key={type.id} value={type.id} className={styles.timeButton}>
                    {type.name}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            ))}
        </>
      ) : (
        <ToggleButtonGroup
          value={modalCreateStore.selectedPresetId}
          exclusive
          onChange={changePresset}
          className={styles.toggleWrapper}
        >
          {modalCreateStore.presets.map((preset: ShiftPreset) => (
            <ToggleButton key={preset.id} value={preset.id} className={styles.timeButton}>
              {preset.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}
    </Grid2>
  );
});
