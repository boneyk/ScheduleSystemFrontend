import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import PhoneIcon from '@mui/icons-material/Phone';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import WorkIcon from '@mui/icons-material/Work';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Popover,
  Stack,
  Typography
} from '@mui/material';
import logo from 'assets/logo.svg';
import axios from 'axios';
import classNames from 'classnames';

import BurgerMenu from '@/components/BurgerMenu';
import modalStyles from '@/components/Modals/ModalDelete/ModalDelete.module.scss';
import SpinCentered from '@/components/spin-centered/SpinCentered';
import WarningMessage from '@/components/WarningMessage';

import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useEmployeeOffices } from '@/hooks/useEmployeeOffices';
import { isUserAdmin, isUserManager, isUserSubGroup } from '@/utils/auth';

import styles from './BaseLayout.module.scss';
import { logout } from '@/api/auth_service';
import { queryClient } from '@/api/queries';
import { baseLayoutStore } from '@/stores/baseLayout.store';
import { employeesStore } from '@/stores/employees.store';
import { timetableStore } from '@/stores/timetable.store';

const BaseLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { employeeQuery } = useEmployeeOffices();
  const [openUserDesc, setOpenUserDesc] = useState<HTMLElement | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const splitName = () => {
    const fullname = employeeQuery.data?.fullName.split(' ');
    if (!fullname) return '';
    return `${fullname[0]} ${fullname[1][0]}. ${fullname[2][0]}.`;
  };

  const handleClick = (key: string) => {
    navigate(`/${key}`);
  };

  const handleUserBlockClick = (event: React.MouseEvent<HTMLElement>) => {
    setOpenUserDesc(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setOpenUserDesc(null);
  };

  const handleLogoutClick = () => {
    handlePopoverClose();
    setLogoutConfirmOpen(true);
  };

  const handleLogout = async () => {
    setLogoutConfirmOpen(false);
    setIsLoggingOut(true);
    try {
      await logout();
      await queryClient.cancelQueries();
      queryClient.removeQueries();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('selectedOfficeId');
      localStorage.removeItem('authorities');
      timetableStore.resetStore();
      employeesStore.resetStore();
      navigate('/login');
    } catch (error) {
      let message = 'Не удалось выйти из системы. Попробуйте снова.';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.detail ?? message;
      }
      baseLayoutStore.showWarning(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    { key: 'schedule', label: 'Расписание', icon: <CalendarMonthIcon /> },
    ...(isUserAdmin()
      ? [
          { key: 'stats', label: 'Статистика', icon: <QueryStatsIcon /> },
          { key: 'employee', label: 'Сотрудники', icon: <GroupIcon /> },
          { key: 'timesheet', label: 'Табель', icon: <ManageHistoryIcon /> }
        ]
      : isUserSubGroup()
        ? [{ key: 'schedule/my', label: 'Мой график смен', icon: <AssignmentIndIcon /> }]
        : isUserManager()
          ? [
              { key: 'stats', label: 'Статистика', icon: <QueryStatsIcon /> },
              { key: 'timesheet', label: 'Табель', icon: <ManageHistoryIcon /> }
            ]
          : [{ key: 'schedule/my', label: 'Мой график смен', icon: <AssignmentIndIcon /> }])
  ];

  const burgerMenuItems = menuItems.reduce(
    (acc, item) => {
      acc[item.label] = () => handleClick(item.key);
      return acc;
    },
    {} as Record<string, () => void>
  );
  burgerMenuItems['Выход'] = handleLogoutClick;

  return (
    <Box className={styles.layout}>
      <WarningMessage />
      <Box className={styles.header}>
        <Stack direction="row" className={styles.headerContent}>
          <img src={logo} className={styles.logo} alt="logo" />
          <div className={styles.desktopNav}>
            {menuItems.map((item) => (
              <Button
                key={item.key}
                startIcon={item.icon}
                color="secondary"
                className={classNames(styles.navBtn, { [styles.selected]: location.pathname === `/${item.key}` })}
                onClick={() => handleClick(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <Box className={styles.userBlock}>
            <Stack direction="row" className={styles.userInfo} onClick={handleUserBlockClick}>
              <AccountCircleIcon className={styles.userAvatar} />
              <Typography className={styles.userName}>{splitName()}</Typography>
              <KeyboardArrowDownIcon className={styles.arrowIcon} />
            </Stack>
            <Popover
              open={Boolean(openUserDesc)}
              anchorEl={openUserDesc}
              onClose={handlePopoverClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { className: styles.popoverPaper } }}
            >
              <Box className={styles.popover}>
                <Typography className={styles.popoverName}>{employeeQuery.data?.fullName}</Typography>
                <Divider className={styles.popoverDivider} />
                <Stack spacing={1.5}>
                  <Stack direction="row" className={styles.userItem}>
                    <WorkIcon className={styles.popoverIcon} />
                    <Typography className={styles.popoverText}>{employeeQuery.data?.position.name}</Typography>
                  </Stack>
                  <Stack direction="row" className={styles.userItem}>
                    <EmailIcon className={styles.popoverIcon} />
                    <Typography className={styles.popoverText}>{employeeQuery.data?.email}</Typography>
                  </Stack>
                  <Stack direction="row" className={styles.userItem}>
                    <PhoneIcon className={styles.popoverIcon} />
                    <Typography className={styles.popoverText}>{employeeQuery.data?.phone}</Typography>
                  </Stack>
                </Stack>
                <Divider className={styles.popoverLogoutDivider} />
                <Button onClick={handleLogoutClick} endIcon={<LogoutIcon />} className={styles.popoverLogout} fullWidth>
                  Выход
                </Button>
              </Box>
            </Popover>
            <Button onClick={handleLogoutClick} endIcon={<LogoutIcon />} className={styles.logout}>
              Выход
            </Button>
          </Box>

          <div className={styles.mobileNav}>
            <BurgerMenu
              items={burgerMenuItems}
              profileInfo={{
                name: employeeQuery.data?.fullName ?? '',
                position: employeeQuery.data?.position.name ?? '',
                email: employeeQuery.data?.email ?? '',
                phone: employeeQuery.data?.phone ?? ''
              }}
            />
          </div>
        </Stack>
      </Box>

      <Box className={styles.content}>
        <Outlet />
      </Box>

      <Box component="footer" className={styles.footer}>
        <Typography variant="body2" color="text.secondary">
          {`Copyright © ${new Date().getFullYear()} KiberOrange team`}
        </Typography>
      </Box>

      <Dialog open={logoutConfirmOpen} onClose={() => setLogoutConfirmOpen(false)}>
        <DialogTitle className={modalStyles.title}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            Выход из системы
            <IconButton onClick={() => setLogoutConfirmOpen(false)} size="small" className={styles.dialogCloseBtn}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent className={modalStyles.content}>Вы уверены, что хотите выйти?</DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button onClick={() => setLogoutConfirmOpen(false)} color="secondary" className={styles.dialogCancelBtn}>
            Отмена
          </Button>
          <Button onClick={handleLogout} variant="contained" color="primary">
            Выйти
          </Button>
        </DialogActions>
        {isLoggingOut && <SpinCentered loading={isLoggingOut} overlay />}
      </Dialog>
    </Box>
  );
};

export default BaseLayout;
