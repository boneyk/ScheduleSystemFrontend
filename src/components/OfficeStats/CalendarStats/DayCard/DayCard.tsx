import { FC } from 'react';

import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';

import styles from './DayCard.module.scss';
import type { WeeklyStatsDayRole } from '@/dto/DtoSchedule';

interface DayCardProps {
  date: Dayjs;
  horizontal?: boolean;
  isSelected?: boolean;
  roles?: WeeklyStatsDayRole[];
}

const DayCard: FC<DayCardProps> = ({ date, horizontal, isSelected, roles = [] }) => {
  const isToday = date.isSame(dayjs(), 'day');
  const dayNumber = date.format('D');
  const dayName = date.locale('ru').format('dd');
  const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={isSelected ? styles.badgeSelected : isToday ? styles.badgeToday : styles.badge}>
          {capitalizedDayName} {dayNumber}
        </span>
      </div>
      <ul className={horizontal ? styles.roleListHorizontal : styles.roleList}>
        {roles.map((role) => (
          <li key={role.name} className={styles.roleItem}>
            <span className={styles.roleDot} />
            <span className={styles.roleText}>
              {role.name} — {role.workersAmount ?? role.employeesAmount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DayCard;
