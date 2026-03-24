import { ChangeEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import jwtDecode from 'jwt-decode';

import { login_request } from '@/api/auth_service';
import { getErrorMessage } from '@/api/config';
import { LoginDTO } from '@/dto/DtoAuth';
import { useStores } from '@/stores/useStores';

export type JwtPayload = {
  authorities: string[];
  user_id: string;
};

export const useLoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { baseLayoutStore } = useStores();

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const loginError = hasError;
  const passwordError = hasError;

  const isFormValid = () => {
    return login.length >= 4 && login.length <= 128 && password.length >= 8 && password.length <= 255;
  };
  const isDisabled = !isFormValid();

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLogin(e.target.value);
  };
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async () => {
    if (isDisabled) return;

    setIsLoading(true);
    setHasError(false);

    const loginDTO: LoginDTO = {
      username: login,
      password
    };

    login_request(loginDTO)
      .then((response: any) => {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        const decoded: JwtPayload = jwtDecode(response.data.accessToken);

        localStorage.setItem('authorities', decoded.authorities.join(','));
        navigate('/schedule', { replace: true });
      })
      .catch((err: any) => {
        setIsLoading(false);
        setHasError(true);
        const status = err.response?.status;
        if (status === 404) return baseLayoutStore.showWarning('Неверный логин или пароль');
        baseLayoutStore.showWarning(getErrorMessage(status));
      });
  };
  const sendSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit();
  };

  return {
    login,
    password,
    showPassword,
    isDisabled,
    isLoading,
    toggleShowPassword,
    handleSubmit,
    handleLoginChange,
    handlePasswordChange,
    loginError,
    passwordError,
    sendSubmit
  };
};
