import type { EmployeeTimesheetDto, WorkTimeCreateDto } from '@/dto/DtoSchedule';
import type { TimesheetRow } from '@/stores/timesheet.store';

export function mapTimesheetGroups(groups: Record<string, EmployeeTimesheetDto[]>): TimesheetRow[] {
  return Object.values(groups)
    .flat()
    .map((emp) => {
      const days = Array<number>(31).fill(0);
      const isDraftDays = Array<boolean>(31).fill(false);
      const dayTypes = Array<'work' | 'absence' | 'empty'>(31).fill('empty');
      const dayOfficeIds = Array<number | null>(31).fill(null);
      const absenceCodes = Array<string | null>(31).fill(null);
      for (const day of emp.days) {
        const idx = parseInt(day.dateOn.split('-')[2]) - 1;
        days[idx] = day.workedMinutes ?? 0;
        isDraftDays[idx] = day.isDraft ?? false;
        const rawType = day.type ?? 'empty';
        const isWorkType = rawType === 'work';
        const isEmptyType = rawType === 'empty';
        dayTypes[idx] = isWorkType ? 'work' : isEmptyType ? 'empty' : 'absence';
        dayOfficeIds[idx] = day.officeId ?? null;
        absenceCodes[idx] = day.absenceType?.code ?? (isWorkType || isEmptyType ? null : rawType);
      }
      return {
        employeeId: emp.employeeId,
        name: emp.fullName,
        position: emp.position.name,
        days,
        isDraftDays,
        dayTypes,
        dayOfficeIds,
        absenceCodes,
        normMinutes: emp.summary.normMinutes
      };
    });
}

export function formatMinutes(minutes: number, showSign = false): string {
  const abs = Math.abs(minutes);
  const hh = Math.floor(abs / 60)
    .toString()
    .padStart(2, '0');
  const mm = (abs % 60).toString().padStart(2, '0');
  if (minutes === 0) return '00:00';
  const sign = minutes < 0 ? '-' : showSign ? '+' : '';
  return `${sign}${hh}:${mm}`;
}

export function getColor(minutes: number): string {
  return minutes < 0 ? 'var(--color-error)' : 'var(--color-success)';
}

export function buildWorktimeItems(
  changedCells: Set<string>,
  rows: TimesheetRow[],
  year: number,
  month: number,
  fallbackOfficeId: number | null
): WorkTimeCreateDto[] {
  const items: WorkTimeCreateDto[] = [];
  const processedKeys = new Set<string>();

  // Include changed cells
  for (const key of changedCells) {
    const [rowIdxStr, dayIdxStr] = key.split('-');
    const rowIdx = Number(rowIdxStr);
    const dayIdx = Number(dayIdxStr);
    const row = rows[rowIdx];
    if (!row) continue;
    const minutes = row.days[dayIdx] ?? 0;
    if (minutes < 0) continue;
    const officeId = row.dayOfficeIds[dayIdx] ?? fallbackOfficeId;
    if (officeId === null) continue;
    const mm = (month + 1).toString().padStart(2, '0');
    const dd = (dayIdx + 1).toString().padStart(2, '0');
    items.push({
      employeeId: row.employeeId,
      officeId,
      workedMinutes: minutes,
      dateOn: `${year}-${mm}-${dd}`
    });
    processedKeys.add(key);
  }

  // Include draft work days that were not changed
  rows.forEach((row, rowIdx) => {
    row.isDraftDays.forEach((isDraft, dayIdx) => {
      if (!isDraft) return;
      if (row.dayTypes[dayIdx] !== 'work') return;
      const key = `${rowIdx}-${dayIdx}`;
      if (processedKeys.has(key)) return;
      const minutes = row.days[dayIdx] ?? 0;
      if (minutes <= 0) return;
      const officeId = row.dayOfficeIds[dayIdx] ?? fallbackOfficeId;
      if (officeId === null) return;
      const mm = (month + 1).toString().padStart(2, '0');
      const dd = (dayIdx + 1).toString().padStart(2, '0');
      items.push({
        employeeId: row.employeeId,
        officeId,
        workedMinutes: minutes,
        dateOn: `${year}-${mm}-${dd}`
      });
    });
  });

  return items;
}
