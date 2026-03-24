import { isUserAdmin, isUserEmployee, isUserManager, isUserSubGroup } from '@/utils/auth';

type CellConfigParams = {
  index: number;
  day: number;
  year: number;
  month: number;
  info: unknown;
  isSubstitutionEmployee: boolean;
  isUnattachedEmployee: boolean;
  isOfficeWorkingDay: (index: number) => unknown;
};

export const getCellConfig = ({
  index,
  day,
  year,
  month,
  info,
  isSubstitutionEmployee,
  isUnattachedEmployee,
  isOfficeWorkingDay
}: CellConfigParams) => {
  const isNotEmpty = info !== null;
  const isDayAfterYesterday = new Date() <= new Date(year, month, day + 2);
  const dayOfWeek = new Date(year, month, day + 1).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isHoliday = isUserManager() || isUserSubGroup() ? isWeekend : !isOfficeWorkingDay(index);
  const isRestricted =
    (isUserAdmin() || (isUserEmployee() && !isUserSubGroup())) && (isSubstitutionEmployee || isUnattachedEmployee);

  const canCreateShiftAdmin =
    !isNotEmpty && !isSubstitutionEmployee && !isUnattachedEmployee && !isHoliday && isDayAfterYesterday;

  const clickableAdmin = isUserAdmin() && (isNotEmpty || canCreateShiftAdmin);
  const clickableManager = isUserManager() && ((!isNotEmpty && isDayAfterYesterday) || isNotEmpty);
  const clickableEmployee = isUserEmployee() && isNotEmpty;
  const clickable = clickableAdmin || clickableManager || clickableEmployee;

  return {
    isNotEmpty,
    isDayAfterYesterday,
    isHoliday,
    isRestricted,
    clickable
  };
};
