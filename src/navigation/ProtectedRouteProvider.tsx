import { FC, PropsWithChildren } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { isAuth } from '@/utils/auth';

export const ProtectedRouteProvider = () => {
  if (!isAuth()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export const AlreadyAuthenticated: FC<PropsWithChildren> = ({ children }) => {
  if (isAuth()) {
    return <Navigate to="/schedule" replace />;
  }
  return children;
};
