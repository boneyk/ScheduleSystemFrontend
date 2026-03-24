import { FC, JSX, PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { isUserAdmin } from '@/utils/auth';
import { errorPath } from 'utils';

interface AccessRequiredProps {
  children: JSX.Element;
  roles?: string[];
}

export const AccessRequiredPermission: FC<AccessRequiredProps> = ({ children }): JSX.Element => {
  if (!isUserAdmin()) {
    return <Navigate to={errorPath(403)} replace />;
  }
  return children;
};

export const NonAdminOnly: FC<PropsWithChildren> = ({ children }) => {
  if (isUserAdmin()) {
    return <Navigate to={errorPath(403)} replace />;
  }
  return children;
};
