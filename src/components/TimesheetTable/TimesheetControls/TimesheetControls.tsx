import { FC, RefObject, useEffect, useState } from 'react';

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2
} from '@mui/material';
import arrowBack from 'assets/move-back-arrow.svg';
import arrowForward from 'assets/move-forward-arrow.svg';
import { observer } from 'mobx-react-lite';

import styles from './TimesheetControls.module.scss';
import { useStores } from '@/stores/useStores';

const SCROLL_STEP = 200;

interface TimesheetControlsProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

const TimesheetControls: FC<TimesheetControlsProps> = observer(({ containerRef }) => {
  const { timesheetStore } = useStores();
  const { isLoading, isSaving, rows, canSave, hasChanges, isPastMonth } = timesheetStore;

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setAtStart(el.scrollLeft <= 0);
      setAtEnd(el.scrollLeft >= maxScroll);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    let rafId: number;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    });
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', update);
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [containerRef]);

  const handleScrollLeft = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: Math.max(0, el.scrollLeft - SCROLL_STEP), behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: Math.min(maxScroll, el.scrollLeft + SCROLL_STEP), behavior: 'smooth' });
  };

  const handleSaveClick = () => {
    if (isPastMonth) {
      setConfirmOpen(true);
    } else {
      void timesheetStore.saveData();
    }
  };

  const handleConfirmSave = () => {
    setConfirmOpen(false);
    void timesheetStore.saveData();
  };

  const handleConfirmCancel = () => {
    setConfirmOpen(false);
  };

  const saveButtonConfig = isSaving
    ? { label: 'Сохранение...', icon: <CircularProgress size={16} color="inherit" /> }
    : { label: 'Сохранить', icon: null };

  if (isLoading || rows.length === 0) return null;

  return (
    <>
      <Grid2 container className={styles.wrapper}>
        <Grid2 className={styles.controlButtons}>
          <Button
            variant="outlined"
            color="secondary"
            className={styles.moveButton}
            onClick={handleScrollLeft}
            disabled={atStart}
          >
            <img src={arrowBack} alt="назад" />
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            className={styles.moveButton}
            onClick={handleScrollRight}
            disabled={atEnd}
          >
            <img src={arrowForward} alt="вперёд" />
          </Button>
        </Grid2>
        <Grid2 className={styles.actionButtons}>
          <Button
            variant="outlined"
            color="secondary"
            className={styles.resetButton}
            disabled={!hasChanges || isSaving}
            onClick={() => timesheetStore.resetChanges()}
          >
            Сбросить
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={styles.saveButton}
            disabled={!canSave || isSaving}
            startIcon={saveButtonConfig.icon}
            onClick={handleSaveClick}
          >
            {saveButtonConfig.label}
          </Button>
        </Grid2>
      </Grid2>

      <Dialog open={confirmOpen} onClose={handleConfirmCancel}>
        <DialogTitle>Сохранение исторических данных</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы редактируете данные за прошедший период. Вы уверены, что хотите сохранить изменения?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmCancel} color="secondary">
            Отмена
          </Button>
          <Button onClick={handleConfirmSave} variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default TimesheetControls;
