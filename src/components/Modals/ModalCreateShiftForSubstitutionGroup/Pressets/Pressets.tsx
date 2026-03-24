import { Grid2, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { DateRangeIcon } from '@mui/x-date-pickers';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { modalCreateStore, ShiftPreset } from 'stores/modalCreate.store';

import styles from '../ModalCreateShiftForSubstitutionGroup.scss';

export const Pressets = observer(() => {
  return (
    <Grid2 container className={classNames(styles.containerHeader)}>
      <Grid2 className={styles.sectionName}>
        <DateRangeIcon />
        <Typography>Период работы:</Typography>
      </Grid2>

      <ToggleButtonGroup value={modalCreateStore.selectedPresetId} exclusive className={styles.toggleWrapper}>
        {modalCreateStore.presets.map((preset: ShiftPreset) => (
          <ToggleButton key={preset.id} value={preset.id} className={styles.timeButton}>
            {preset.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Grid2>
  );
});
