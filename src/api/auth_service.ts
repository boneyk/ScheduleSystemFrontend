import { AxiosResponse } from 'axios';
import { LoginDTO } from 'dto/DtoAuth';

import { instance_auth } from './config';

export const login_request = (dto: LoginDTO): Promise<AxiosResponse<{ accessToken: string; refreshToken: string }>> => {
  return instance_auth.post('auth/login', dto);
};

export const logout = (): Promise<AxiosResponse<void>> => instance_auth.post('auth/logout');
