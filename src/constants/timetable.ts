export const monthList: string[] = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь'
];

const STEP_DAYS = 5;
export const CELL_W = 66;
export const stepPx = STEP_DAYS * CELL_W;

export const shiftTypeMap = new Map<string, string | undefined>([
  ['work', undefined],
  ['vacation', 'Отпуск'],
  ['sick', 'Больничный']
]);
