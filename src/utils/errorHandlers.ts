import { baseLayoutStore } from '@/stores/baseLayout.store';

export function handleNetworkError(error: unknown): void {
  const errorCode = (error as { code?: string }).code;
  const isTimeout =
    errorCode === 'ECONNABORTED' || (error instanceof Error && error.message.toLowerCase().includes('timeout'));
  const isNetworkError =
    errorCode === 'ERR_NETWORK' || (error instanceof Error && error.message.toLowerCase().includes('network error'));

  if (isTimeout) {
    baseLayoutStore.showWarning('Ошибка 504: Сервер не отвечает. Превышено время ожидания ответа.');
  } else if (isNetworkError) {
    baseLayoutStore.showWarning('Ошибка сети: Не удалось подключиться к серверу.');
  }
}
