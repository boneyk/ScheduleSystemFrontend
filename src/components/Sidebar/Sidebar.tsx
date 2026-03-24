import { FC, useEffect, useState } from 'react';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { CircularProgress, Divider, Drawer, Grid2, IconButton, Tab, Tabs, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';

import { SidebarCards } from '@/components/Sidebar/SidebarCards/SidebarCards';
import styles from '@/components/Sidebar/Slidebar.module.scss';

import { isUserAdmin } from '@/utils/auth';

import { SliderConfirmMessage } from './SliderConfirmMessage/SliderConfirmMessage';
import { applicationsKey, fetchApplications, fetchApplicationStatuses } from '@/api/queries';
import { sidebarStore } from '@/stores/sidebar.store';
import { timetableStore } from '@/stores/timetable.store';

const TABS = [
  {
    code: 'ACTUAL',
    name: 'Актуальные',
    filter: (statusName: string) => !['Отклонённая', 'Завершённая', 'Просроченная'].includes(statusName)
  },
  {
    code: 'OVERDUE',
    name: 'Отклоненные',
    filter: (statusName: string) => ['Отклонённая', 'Просроченная'].includes(statusName)
  },
  {
    code: 'COMPLETED',
    name: 'Завершённые',
    filter: (statusName: string) => statusName === 'Завершённая'
  }
] as const;

type TabCode = (typeof TABS)[number]['code'];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: FC<SidebarProps> = observer(({ open, onClose }) => {
  const { regionId, year, month, selectedOffice } = timetableStore;
  const [activeTab, setActiveTab] = useState<TabCode>('ACTUAL');

  const statusesQuery = useQuery({
    queryKey: ['application-statuses'],
    queryFn: fetchApplicationStatuses,
    enabled: open
  });

  const appsQuerySubstitutionGroup = useQuery({
    queryKey: regionId ? applicationsKey(regionId, undefined, year, month) : ['no region'],
    queryFn: fetchApplications,
    enabled: !isUserAdmin() && open && !!regionId
  });

  const appsQueryHeadOfOffice = useQuery({
    queryKey: selectedOffice?.id ? applicationsKey(undefined, selectedOffice.id, year, month) : ['no office'],
    queryFn: fetchApplications,
    enabled: isUserAdmin() && open && !!selectedOffice?.id
  });

  const appsQuery = isUserAdmin() ? appsQueryHeadOfOffice : appsQuerySubstitutionGroup;

  useEffect(() => {
    if (statusesQuery.data) {
      sidebarStore.setStatuses(statusesQuery.data);
    }
  }, [statusesQuery.data]);

  useEffect(() => {
    if (appsQuery.data) {
      sidebarStore.setAppsByStatus(appsQuery.data.data);
    }
  }, [appsQuery.data]);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getFilteredApps = () => {
    if (!sidebarStore.appsByStatus) return [];
    const activeTabConfig = TABS.find((tab) => tab.code === activeTab);
    if (!activeTabConfig) return [];
    return Object.entries(sidebarStore.appsByStatus)
      .filter(([statusName]) => activeTabConfig.filter(statusName))
      .flatMap(([statusName, apps]) =>
        apps.map((appGroup) => ({
          ...appGroup,
          statusName,
          statusCode: sidebarStore.getStatusCodeByName(statusName)
        }))
      );
  };

  const filteredApps = getFilteredApps();
  const totalCount = filteredApps.reduce((acc, appGroup) => acc + appGroup.records.length, 0);

  return (
    <Drawer variant="persistent" anchor="right" open={open} className={styles.drawer}>
      <Grid2 className={styles.header}>
        <IconButton onClick={onClose}>
          <ChevronRightIcon />
        </IconButton>
        <Typography variant="h6">Список заявок ({totalCount})</Typography>
      </Grid2>

      <Grid2 className={styles.tabs}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="scrollable" scrollButtons="auto">
          {TABS.map((tab) => (
            <Tab key={tab.code} value={tab.code} label={tab.name} className={styles.tabTittle} />
          ))}
        </Tabs>
      </Grid2>

      <Divider />

      <Grid2 className={styles.cardsContainer}>
        {appsQuery.isFetching ? (
          <Grid2 className={styles.loadingState}>
            <CircularProgress />
          </Grid2>
        ) : (
          <>
            {filteredApps.map((appGroup) =>
              appGroup.records.map((record) => (
                <SidebarCards
                  key={record.id}
                  office={appGroup.office}
                  record={record}
                  statusName={appGroup.statusName}
                  statusCode={appGroup.statusCode}
                  isExpanded={expandedId === record.id}
                  onExpand={handleExpand}
                />
              ))
            )}

            {filteredApps.length === 0 && (
              <Grid2 className={styles.emptyState}>
                <Typography variant="body1" color="text.secondary">
                  Нет заявок в данной категории
                </Typography>
              </Grid2>
            )}
          </>
        )}
      </Grid2>

      <SliderConfirmMessage />
    </Drawer>
  );
});
