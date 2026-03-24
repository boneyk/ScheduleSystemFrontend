import { FC } from 'react';

import { Button, Card, CardContent, Collapse, Divider, Grid2, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';

import styles from '@/components/Sidebar/Slidebar.module.scss';

import { isUserManager } from '@/utils/auth';
import { Formats } from '@/utils/formats';

import { Office, RecordApplication } from '@/dto/DtoApplications';
import { sidebarStore } from '@/stores/sidebar.store';

interface SidebarCardsProps {
  office: Office;
  record: RecordApplication;
  statusCode: string | null;
  statusName: string;
  isExpanded: boolean;
  onExpand: (id: number) => void;
}

export const SidebarCards: FC<SidebarCardsProps> = observer(
  ({ office, record, statusCode, statusName, isExpanded, onExpand }) => {
    const { setSelectedApp } = sidebarStore;
    const handleReject = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedApp(record, 'REJECT');
    };

    const handleConfirm = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedApp(record, 'CONFIRM');
    };
    return (
      <Card
        onClick={() => onExpand(record.id)}
        className={classNames(styles.card, { [styles['card--expanded']]: isExpanded })}
      >
        <CardContent>
          <Typography>Заявка №{record.id}</Typography>
          <Typography variant="body2" color="text.secondary" className={styles.status}>
            Статус: {statusName}
          </Typography>
          <Typography className={styles.status}>{office.name}</Typography>
          <Typography className={styles.status}>{office.address}</Typography>
          <Collapse in={isExpanded}>
            <Divider />
            <Grid2 className={styles.cardsContainer} direction="column" spacing={1}>
              {record.position ? (
                <Typography className={styles.status}>Должность: {record.position.name}</Typography>
              ) : (
                <Typography className={styles.status}>Должность: не указана</Typography>
              )}
              <Typography>Кол-во человек: {record.quantity}</Typography>
              <Typography className={styles.status}>Дата: {dayjs(record.startOn).format(Formats.DATE_LONG)}</Typography>
              <Typography className={styles.status}>
                Время: {record.startAt.slice(0, 5)} - {record.endAt.slice(0, 5)}
              </Typography>
              {statusCode === 'IN_PROGRESS' && (
                <Grid2 className={styles.buttons}>
                  <Button variant="text" color="secondary" className={styles.cancelButton} onClick={handleReject}>
                    Отклонить
                  </Button>
                  {isUserManager() && (
                    <Button variant="contained" onClick={handleConfirm}>
                      Выполнить
                    </Button>
                  )}
                </Grid2>
              )}
            </Grid2>
          </Collapse>
        </CardContent>
      </Card>
    );
  }
);
