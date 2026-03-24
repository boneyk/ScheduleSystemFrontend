import { Navigate, useRoutes } from 'react-router-dom';

import BaseLayout from 'layouts/base/BaseLayout';
import ErrorPage from 'pages/error/ErrorPage';
import LoginPage from 'pages/login/LoginPage';

import EmployeesTable from '@/components/EmployeesTable';
import CalendarWidget from '@/components/TimetableComponent/CalendarWidget';

import { AccessRequiredPermission, NonAdminOnly } from './AccessRequiredPermission';
import { AlreadyAuthenticated, ProtectedRouteProvider } from './ProtectedRouteProvider';
import { SuspenseLayout } from './SuspenseLayout';
import StatsPage from '@/pages/stats/StatsPage';
import TimesheetPage from '@/pages/timesheet';
import TimetablePage from '@/pages/timetable/TimetablePage';

const Navigation = () => {
  const routes = [
    {
      path: 'login',
      element: (
        <AlreadyAuthenticated>
          <LoginPage />
        </AlreadyAuthenticated>
      )
    },
    {
      element: <ProtectedRouteProvider />,
      children: [
        {
          element: <BaseLayout />,
          children: [
            {
              index: true,
              path: '/',
              element: <Navigate to="/login" replace />
            },
            {
              element: <SuspenseLayout />,
              children: [
                {
                  path: 'schedule',
                  element: <TimetablePage />
                },
                {
                  path: 'timesheet',
                  element: <TimesheetPage />
                },
                {
                  path: 'schedule/my',
                  element: (
                    <NonAdminOnly>
                      <CalendarWidget title={'Мой график смен'} />
                    </NonAdminOnly>
                  )
                },
                {
                  path: 'stats',
                  element: <StatsPage />
                },
                {
                  path: 'employee',
                  element: (
                    <AccessRequiredPermission>
                      <EmployeesTable />
                    </AccessRequiredPermission>
                  )
                }
              ]
            }
          ]
        }
      ]
    },
    {
      path: 'error/:err',
      element: <ErrorPage />
    },
    {
      path: '*',
      element: <Navigate to="/error/404" replace />
    }
  ];

  return useRoutes(routes);
};

export default Navigation;
