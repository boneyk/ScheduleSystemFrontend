import { FC } from 'react';

import { TableCell, TableRow } from '@mui/material';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import WorkerRow from '../WorkerRow';

import styles from './JobSection.module.scss';
import { useStores } from '@/stores/useStores';

interface JobSectionProps {
  jobTitle: string;
}

const JobSection: FC<JobSectionProps> = observer(({ jobTitle }) => {
  const { timetableStore } = useStores();
  const { days, shifts, todayIndex } = timetableStore;

  const workerShifts = shifts[jobTitle] ?? {};

  return (
    <>
      <TableRow className={styles.jobNameRow}>
        <TableCell className={classNames(styles.jobNameCell, styles.stickyFirstCol)}>{jobTitle}</TableCell>
        {days.map((day) => (
          <TableCell key={`${jobTitle}-blank-day-${day}`} className={styles.blank}>
            {day === todayIndex && <div className={styles.pointer}></div>}
          </TableCell>
        ))}
      </TableRow>

      {Object.entries(workerShifts).map(([workerId]) => (
        <WorkerRow key={`worker-${workerId}-data`} employeeId={Number(workerId)} role={jobTitle} />
      ))}
    </>
  );
});

export default JobSection;
