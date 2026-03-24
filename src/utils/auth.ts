import jwtDecode from 'jwt-decode';

import { JwtPayload } from '@/dto/DtoAuth';

export const isUserAdmin = (): boolean => {
  const authorities = localStorage.getItem('authorities') || '';
  return authorities
    .split(',')
    .map((role) => role.trim())
    .includes('ROLE_ADMIN');
};

export const isUserManager = (): boolean => {
  const authorities = localStorage.getItem('authorities') || '';
  return authorities
    .split(',')
    .map((role) => role.trim())
    .includes('ROLE_REGION_MANAGER');
};
export const isUserEmployee = (): boolean => {
  const authorities = localStorage.getItem('authorities') || '';
  return authorities
    .split(',')
    .map((role) => role.trim())
    .includes('ROLE_MANAGER');
};

export const isUserSubGroup = (): boolean => {
  const authorities = localStorage.getItem('authorities') || '';
  return authorities
    .split(',')
    .map((role) => role.trim())
    .includes('ROLE_SUB_GROUP');
};

export const isAuth = (): boolean => {
  const accessToken = localStorage.getItem('accessToken');
  return !!accessToken;
};

export const decodeAuthToken = (accessToken: string | null) => {
  if (!accessToken) {
    return {
      userId: null,
      authorities: []
    };
  }
  const decoded = jwtDecode<JwtPayload>(accessToken);
  const userId = Number(decoded.user_id);
  const authorities = decoded.authorities ?? [];

  return {
    userId,
    authorities
  };
};
