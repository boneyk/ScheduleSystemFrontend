import { FC } from 'react';

import { TableCell, TableRow } from '@mui/material';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import styles from './JobSection.module.scss';
import { useStores } from '@/stores/useStores';

interface JobSectionHeaderProps {
  jobTitle: string;
  measureRef?: (node: HTMLElement | null) => void;
  virtualIndex?: number;
}

const JobSectionHeader: FC<JobSectionHeaderProps> = observer(({ jobTitle, measureRef, virtualIndex }) => {
  const { timetableStore } = useStores();
  const { days, todayIndex, viewType } = timetableStore;

  return (
    <TableRow
      ref={measureRef}
      data-index={virtualIndex}
      className={classNames(styles.jobNameRow, { [styles.noBorderRight]: viewType !== 'month' })}
    >
      <TableCell className={classNames(styles.jobNameCell, styles.stickyFirstCol)}>{jobTitle}</TableCell>
      {viewType === 'month' ? (
        days.map((day) => (
          <TableCell key={`${jobTitle}-blank-day-${day}`} className={styles.blank}>
            {day === todayIndex && <div className={styles.pointer}></div>}
          </TableCell>
        ))
      ) : (
        <TableCell className={styles.dayViewBlank} />
      )}
    </TableRow>
  );
});

export default JobSectionHeader;
