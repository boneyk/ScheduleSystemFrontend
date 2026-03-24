import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, string> = {
  '/schedule': 'Расписание',
  '/timesheet': 'Табель выработки',
  '/schedule/my': 'Мой график смен',
  '/employee': 'Сотрудники',
  '/stats': 'Статистика по офису',
  '/login': 'Вход',
  '/users': 'Пользователи',
  '/users/create': 'Создать пользователя',
  '/error/404': 'Страница не найдена',
  '/error/403': 'Доступ запрещен',
  '/error/500': 'Ошибка сервера'
};

export const useDocumentTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (routeTitles[path]) {
      document.title = `ATБ | ${routeTitles[path]}`;
      return;
    }

    if (path.startsWith('/error/')) {
      document.title = 'Ошибка';
      return;
    }

    document.title = 'ATБ | Сотрудники';
  }, [location.pathname]);
};
