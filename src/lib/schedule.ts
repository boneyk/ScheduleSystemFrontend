import { shiftTypeMap } from '@/constants/timetable';

import type { Absence, EmployeeSchedule, MyScheduleResponse } from '@/dto/DtoSchedule';
import type { CalendarCell, DayShiftInfo, myScheduleItem, Shift, ShiftType } from '@/types/schedule';

export function transformEmployeeShifts(employeeData: EmployeeSchedule): Shift[] {
  return [
    ...employeeData.shifts.map((shift) => ({
      id: shift.id,
      startTime: shift.startAt,
      endTime: shift.endAt,
      date: shift.scheduledOn,
      type: 'work' as const,
      office: shift.office
    })),
    ...employeeData.absences.map((absence: Absence) => {
      const type = normalizeAbsenceType(absence.absenceType.code);
      return {
        id: absence.id,
        startTime: '00:00',
        endTime: '00:00',
        date: absence.absentOn,
        type,
        label: absence.absenceType.name
      };
    })
  ];
}

export function normalizeAbsenceType(typeCode: string): ShiftType {
  const code = typeCode.toLowerCase();
  if (code === 'sick') return 'sick';
  if (code === 'vacation') return 'vacation';
  return 'vacation';
}

export function isShiftSameType(shift1: Shift, shift2: Shift): boolean {
  return (
    shift1.startTime === shift2?.startTime &&
    shift1?.endTime === shift2?.endTime &&
    shift1?.type === shift2?.type &&
    shift1?.office?.id === shift2?.office?.id
  );
}

export function getDayFromShiftDay(shiftDate: string): number {
  return Number(shiftDate.slice(-2));
}

export function formatTime(time: string): string {
  return time.slice(0, 5);
}

export function buildShiftsWorkerList(
  year: number,
  month: number,
  daysInMonth: number,
  employeeData: EmployeeSchedule
): (DayShiftInfo | null)[] {
  const workerShifts = transformEmployeeShifts(employeeData);
  const daysArray: (DayShiftInfo | null)[] = Array.from({ length: daysInMonth + 2 }, () => null);
  let curShiftSectionNumber = 0;
  let prevShift: Shift = { id: -1, startTime: '', endTime: '', date: '', type: 'work' };

  const sortedShifts = [...workerShifts].sort((a, b) => a.date.localeCompare(b.date));

  let leftPointer = 0;
  let rightPointer = 0;

  const formatDate = (day: number) => `${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;

  const addDatesToBlock = () => {
    for (let i = leftPointer; i <= rightPointer; i++) {
      const entry = daysArray[i];
      if (entry) {
        entry.blockStartDate = formatDate(leftPointer);
        entry.blockEndDate = formatDate(rightPointer);
      }
    }
  };

  sortedShifts.forEach((shift: Shift) => {
    const day = getDayFromShiftDay(shift.date);
    const isNewBlock =
      prevShift.id === -1 || !isShiftSameType(prevShift, shift) || day - getDayFromShiftDay(prevShift.date) !== 1;

    if (isNewBlock) {
      if (prevShift.id !== -1) addDatesToBlock();
      curShiftSectionNumber++;
      leftPointer = day;
    }
    rightPointer = day;

    const existing = daysArray[day];
    if (existing) {
      existing.title = 'Составная';
      existing.isCombined = true;
      if (!existing.shiftsForCombined) {
        existing.shiftsForCombined = [];
        if (existing.office) {
          existing.shiftsForCombined.push({
            id: existing.id,
            startTime: existing.startTime,
            endTime: existing.endTime,
            office: existing.office
          });
        }
      }
      if (shift.office) {
        existing.shiftsForCombined.push({
          id: shift.id,
          startTime: formatTime(shift.startTime),
          endTime: formatTime(shift.endTime),
          office: shift.office
        });
      }
    } else {
      const title =
        shift.type === 'work'
          ? `${formatTime(shift.startTime)}-${formatTime(shift.endTime)}`
          : (shiftTypeMap.get(shift.type) ?? '');

      daysArray[day] = {
        id: shift.id,
        type: shift.type,
        shiftKey: `shift${curShiftSectionNumber}`,
        title,
        startTime: formatTime(shift.startTime),
        endTime: formatTime(shift.endTime),
        blockStartDate: '',
        blockEndDate: '',
        office: shift.office
      };
    }
    prevShift = shift;
  });
  if (sortedShifts.length > 0) addDatesToBlock();
  return daysArray;
}

export function getKey(info: DayShiftInfo | null): string {
  if (!info) return '';
  return `${info.type}-${info.shiftKey}${info.isCombined ? '-combined' : ''}`;
}

export function isStart(daysShiftsList: (DayShiftInfo | null)[], index: number): boolean {
  return (
    getKey(daysShiftsList[index]) !== getKey(daysShiftsList[index + 1]) &&
    getKey(daysShiftsList[index + 1]) === getKey(daysShiftsList[index + 2])
  );
}

export function isEnd(daysShiftsList: (DayShiftInfo | null)[], index: number): boolean {
  return (
    getKey(daysShiftsList[index]) === getKey(daysShiftsList[index + 1]) &&
    getKey(daysShiftsList[index + 1]) !== getKey(daysShiftsList[index + 2])
  );
}

export function isMid(daysShiftsList: (DayShiftInfo | null)[], index: number): boolean {
  return (
    getKey(daysShiftsList[index]) === getKey(daysShiftsList[index + 1]) &&
    getKey(daysShiftsList[index + 1]) === getKey(daysShiftsList[index + 2])
  );
}

export function isSolo(daysShiftsList: (DayShiftInfo | null)[], index: number): boolean {
  return (
    getKey(daysShiftsList[index]) !== getKey(daysShiftsList[index + 1]) &&
    getKey(daysShiftsList[index + 1]) !== getKey(daysShiftsList[index + 2])
  );
}

export function getCalendarMatrix(year: number, monthIndex: number): string[][] {
  const calendarMatrix: string[][] = [];
  const calendarPointer = new Date(year, monthIndex, 1);
  const dayOfWeek = calendarPointer.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  calendarPointer.setDate(calendarPointer.getDate() - mondayOffset);

  calendarMatrix.push(Array(7));
  for (let i = 0; i < 7; i++) {
    calendarMatrix[0][i] = `${calendarPointer.getDate()}|${calendarPointer.getMonth()}`;
    calendarPointer.setDate(calendarPointer.getDate() + 1);
  }

  let rowNumber = 1;
  while (calendarPointer.getMonth() === monthIndex) {
    calendarMatrix.push(Array(7));
    for (let i = 0; i < 7; i++) {
      calendarMatrix[rowNumber][i] = `${calendarPointer.getDate()}|${calendarPointer.getMonth()}`;
      calendarPointer.setDate(calendarPointer.getDate() + 1);
    }
    rowNumber++;
  }

  return calendarMatrix;
}

export function getmyScheduleMatrix(data: MyScheduleResponse, calendarMatrix: string[][]): CalendarCell[][] {
  const shiftsByDate = new Map<string, myScheduleItem[]>();
  data.shifts.forEach((shift) => {
    const dateParts = shift.scheduledOn.split('-');
    const day = parseInt(dateParts[2], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const key = `${day}|${month}`;
    const items = shiftsByDate.get(key) || [];
    items.push({
      officeName: shift.office.name ?? 'Неизвестный офис',
      officeId: shift.office.id,
      startTime: shift.startAt,
      endTime: shift.endAt,
      type: 'work'
    });
    shiftsByDate.set(key, items);
  });

  data.absences.forEach((absence) => {
    const dateParts = absence.absentOn.split('-');
    const day = parseInt(dateParts[2], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const key = `${day}|${month}`;
    const items = shiftsByDate.get(key) || [];
    items.push({
      officeName: '',
      officeId: 0,
      startTime: '',
      endTime: '',
      type: normalizeAbsenceType(absence.absenceType.name)
    });
    shiftsByDate.set(key, items);
  });

  return calendarMatrix.map((week) =>
    week.map((cell) => {
      const [day, month] = cell.split('|').map(Number);
      return {
        day,
        month,
        myShifts: shiftsByDate.get(cell) || []
      };
    })
  );
}

export function getMonthDaysCount(year: number, month: number): number {
  const nextMonthStartDate = new Date(year, month + 1, 1);
  nextMonthStartDate.setDate(nextMonthStartDate.getDate() - 1);
  return nextMonthStartDate.getDate();
}

const weekdays = new Map<number, string>([
  [0, 'Воскр'],
  [1, 'Понед'],
  [2, 'Вторник'],
  [3, 'Среда'],
  [4, 'Четверг'],
  [5, 'Пятница'],
  [6, 'Суббота']
]);

export function getWeekdayByDate(year: number, month: number, day: number): string {
  return weekdays.get(new Date(year, month, day).getDay()) ?? 'Unknown';
}

const shiftTypeLabels: Record<string, string> = {
  vacation: 'Отпуск',
  sick: 'Больничный'
};

const shiftTypeClasses: Record<string, string> = {
  work: 'work',
  vacation: 'vacation',
  sick: 'sick'
};

export const formatShiftLabel = (shift: myScheduleItem): string => {
  if (shift.type === 'work') {
    return `${shift.officeName}, ${formatTime(shift.startTime)}-${formatTime(shift.endTime)}`;
  }
  return shiftTypeLabels[shift.type] || shift.type;
};

export const getShiftClassName = (type: string): string => {
  return shiftTypeClasses[type] || 'work';
};

const OFFICE_COLOR_PALETTE: Array<{ background: string; color: string }> = [
  { background: 'rgba(200, 225, 255, 0.9)', color: 'rgba(0, 70, 140, 1)' },
  { background: 'rgba(200, 240, 210, 0.9)', color: 'rgba(20, 100, 40, 1)' },
  { background: 'rgba(225, 210, 245, 0.9)', color: 'rgba(80, 30, 130, 1)' },
  { background: 'rgba(185, 240, 250, 0.9)', color: 'rgba(0, 100, 120, 1)' },
  { background: 'rgba(195, 240, 235, 0.9)', color: 'rgba(0, 100, 90, 1)' },
  { background: 'rgba(215, 215, 250, 0.9)', color: 'rgba(50, 50, 160, 1)' },
  { background: 'rgba(225, 245, 195, 0.9)', color: 'rgba(60, 100, 0, 1)' },
  { background: 'rgba(210, 225, 235, 0.9)', color: 'rgba(40, 80, 100, 1)' }
];

export function getOfficeColor(officeId: number): { background: string; color: string } {
  return OFFICE_COLOR_PALETTE[officeId % OFFICE_COLOR_PALETTE.length];
}

export function getShiftTimePercent(info: DayShiftInfo): { left: number; width: number } | null {
  const startMatch = info.startTime.match(/^(\d{2}):(\d{2})$/);
  const endMatch = info.endTime.match(/^(\d{2}):(\d{2})$/);
  if (!startMatch || !endMatch) return null;
  const startMinutes = Number(startMatch[1]) * 60 + Number(startMatch[2]);
  const endMinutes = Number(endMatch[1]) * 60 + Number(endMatch[2]);
  const totalMinutes = 24 * 60;
  const left = (startMinutes / totalMinutes) * 100;
  const width = ((endMinutes - startMinutes) / totalMinutes) * 100;
  return { left, width: Math.max(width, 0.5) };
}
