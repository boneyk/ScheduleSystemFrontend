import { FC, useCallback, useMemo, useRef } from 'react';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type MRT_ColumnDef, MRT_TableBodyCellValue, useMaterialReactTable } from 'material-react-table';

import styles from './WorkerStats.module.scss';
import { employeeStatsKey, fetchEmployeeStats } from '@/api/queries';

interface WorkerStatsProps {
  officeId: number | undefined;
  regionId: number | undefined;
  weekStart: string;
}

interface WorkerStatsRow {
  id: number;
  fullName: string;
  hours: number;
  norm: number;
  hoursStr: string;
  normStr: string;
}

const parseHoursToDecimal = (hoursStr: string | undefined): number => {
  if (!hoursStr) return 0;
  const [h, m] = hoursStr.split(':').map(Number);
  return (h || 0) + (m || 0) / 60;
};

const formatToHHMM = (hoursStr: string | undefined): string => {
  if (!hoursStr) return '0:00';
  const [h, m] = hoursStr.split(':').map(Number);
  return `${h || 0}:${String(m || 0).padStart(2, '0')}`;
};

const getRowColor = (hours: number, norm: number): string => {
  if (norm === 0) return 'transparent';
  const ratio = Math.min(hours / norm, 1);
  const r = Math.round(255 - ratio * (255 - 230));
  const g = Math.round(230 + ratio * 25);
  const b = Math.round(230 - ratio * 10);
  return `rgb(${r}, ${g}, ${b})`;
};

const columns: MRT_ColumnDef<WorkerStatsRow>[] = [
  { accessorKey: 'fullName', header: 'ФИО' },
  {
    accessorKey: 'hours',
    header: 'Выработка (ЧЧ:ММ)',
    Cell: ({ row }) => row.original.hoursStr
  },
  {
    accessorKey: 'norm',
    header: 'Норма (ЧЧ:ММ)',
    Cell: ({ row }) => row.original.normStr
  }
];

const WorkerStats: FC<WorkerStatsProps> = ({ officeId, regionId, weekStart }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const hasParams = !!(officeId || regionId);

  const employeeStatsQuery = useQuery({
    queryKey: hasParams ? employeeStatsKey(officeId, regionId, weekStart) : ['employeeStats-disabled'],
    queryFn: fetchEmployeeStats,
    enabled: hasParams
  });

  const tableData: WorkerStatsRow[] = useMemo(
    () =>
      (employeeStatsQuery.data ?? []).map((item, index) => ({
        id: index,
        fullName: item.fullName,
        hours: parseHoursToDecimal(item.factHours ?? item.actualHours),
        norm: parseHoursToDecimal(item.normHours ?? item.planHours),
        hoursStr: formatToHHMM(item.factHours ?? item.actualHours),
        normStr: formatToHHMM(item.normHours ?? item.planHours)
      })),
    [employeeStatsQuery.data]
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: true,
    enablePagination: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    getRowId: (row) => String(row.id)
  });

  const { rows: tableRows } = table.getRowModel();

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 44,
    overscan: 5
  });

  const getRowBg = useCallback((row: (typeof tableRows)[0]) => {
    const { hours, norm } = row.original;
    return getRowColor(hours, norm);
  }, []);

  const headerGroups = useMemo(() => table.getHeaderGroups(), [table]);

  return (
    <div className={styles.wrapper}>
      <Typography className={styles.title}>Статистика сотрудников за неделю</Typography>
      <div className={styles.tableWrapper}>
        <div className={styles.headerRow}>
          {headerGroups.map((headerGroup) =>
            headerGroup.headers.map((header) => {
              const sorted = header.column.getIsSorted();
              return (
                <div key={header.id} className={styles.headerCell} onClick={header.column.getToggleSortingHandler()}>
                  <span>{header.isPlaceholder ? null : String(header.column.columnDef.header ?? '')}</span>
                  <span className={styles.sortIcon}>
                    {sorted === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : sorted === 'desc' ? (
                      <ArrowDownwardIcon fontSize="small" />
                    ) : (
                      <UnfoldMoreIcon fontSize="small" />
                    )}
                  </span>
                </div>
              );
            })
          )}
        </div>
        <div ref={scrollContainerRef} className={styles.scrollContainer}>
          {/* eslint-disable-next-line no-inline-styles/no-inline-styles */}
          <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = tableRows[virtualRow.index];
              return (
                <div
                  key={row.id}
                  className={styles.row}
                  style={{
                    backgroundColor: getRowBg(row),
                    transform: `translateY(${virtualRow.start}px)`
                  }}
                  ref={(node) => rowVirtualizer.measureElement(node)}
                  data-index={virtualRow.index}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id} className={styles.bodyCell}>
                      <MRT_TableBodyCellValue cell={cell} table={table} staticRowIndex={virtualRow.index} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerStats;
