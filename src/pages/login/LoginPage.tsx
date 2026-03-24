import Groups2Icon from '@mui/icons-material/Groups2';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Box, Button, Stack, TextField } from '@mui/material';
import FilledInput from '@mui/material/FilledInput';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import { observer } from 'mobx-react-lite';

import SpinCentered from '@/components/spin-centered/SpinCentered';
import WarningMessage from '@/components/WarningMessage';

import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLoginPage } from '@/hooks/useLoginPage';

import styles from './LoginPage.module.scss';

const LoginPage = observer(() => {
  useDocumentTitle();
  const {
    login,
    password,
    showPassword,
    isDisabled,
    isLoading,
    toggleShowPassword,
    handleLoginChange,
    handlePasswordChange,
    loginError,
    passwordError,
    sendSubmit
  } = useLoginPage();
  return (
    <>
      <WarningMessage />
      <Box className={styles.container} component="form" onSubmit={sendSubmit}>
        <Stack spacing={2} className={styles.container}>
          <Groups2Icon className={styles.icon} />
          <TextField
            className={styles.input}
            label="Логин"
            variant="filled"
            value={login}
            onChange={handleLoginChange}
            error={loginError}
          />
          <FormControl className={styles.input} variant="filled" error={passwordError}>
            <InputLabel htmlFor="filled-adornment-password">Пароль</InputLabel>
            <FilledInput
              id="filled-adornment-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <Button className={styles.button} variant="contained" type="submit" disabled={isDisabled}>
            Войти
          </Button>
        </Stack>
      </Box>
      <SpinCentered loading={isLoading} overlay />
    </>
  );
});

export default LoginPage;
