import { FC, useEffect, useMemo, useRef, useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import classNames from 'classnames';
import _ from 'lodash';
import {
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
  MRT_TableBodyCellValue,
  useMaterialReactTable
} from 'material-react-table';

import styles from './ModalAddWorkerContent.module.scss';
import { type EmployeeResponse, getEmployees } from '@/api/employees_service';
import { employeesByCityKey } from '@/api/queries';
import { EmployeeRow } from '@/lib/employee';
import { timetableStore } from '@/stores/timetable.store';
import { useStores } from '@/stores/useStores';

const columns: MRT_ColumnDef<EmployeeRow>[] = [
  { accessorKey: 'fullName', header: 'ФИО' },
  { accessorKey: 'work', header: 'Должность' },
  { accessorKey: 'email', header: 'Почта' }
];

const PAGE_SIZE = 8;

interface ModalAddWorkerContentProps {
  onSelectionChange: (ids: number[]) => void;
}

const ModalAddWorkerContent: FC<ModalAddWorkerContentProps> = ({ onSelectionChange }) => {
  const { employeesStore } = useStores();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const cityId = timetableStore.selectedOffice?.cityId;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const debouncedSetSearch = useRef(_.debounce((val: string) => setDebouncedSearch(val), 600)).current;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [...employeesByCityKey(cityId ?? 0), 'infinite', debouncedSearch],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await getEmployees({
        cityId: cityId as number,
        page: pageParam,
        size: PAGE_SIZE,
        fullName: debouncedSearch || undefined,
        substitutionGroup: false
      });
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { number, totalPages } = lastPage.page;
      return number + 1 < totalPages ? number + 1 : undefined;
    },
    enabled: !!cityId
  });

  const rows = useMemo(() => {
    if (!data?.pages) {
      return employeesStore.currentOfficeEmployees.map((e) => ({
        id: e.id,
        fullName: e.fullName,
        email: e.email,
        work: e.position.name ?? ''
      }));
    }
    return data.pages.flatMap((page) =>
      page.content.map((e: EmployeeResponse) => ({
        id: e.id,
        fullName: e.fullName,
        email: e.email,
        work: e.position.name ?? ''
      }))
    );
  }, [data, employeesStore.currentOfficeEmployees]);

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map(Number)
      .filter((id) => !isNaN(id));
    onSelectionChange(selectedIds);
  }, [rowSelection, onSelectionChange]);

  const table = useMaterialReactTable({
    columns,
    data: rows,
    enableRowSelection: true,
    enableSelectAll: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enablePagination: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    getRowId: (row) => String(row.id),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection }
  });

  const { rows: tableRows } = table.getRowModel();

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 50,
    overscan: 5
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastVirtualItemIndex = virtualItems.at(-1)?.index ?? -1;

  useEffect(() => {
    if (lastVirtualItemIndex >= tableRows.length - 3 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [lastVirtualItemIndex, tableRows.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isAllSelected = table.getIsAllRowsSelected();
  const isSomeSelected = table.getIsSomeRowsSelected();

  return (
    <>
      <TextField
        placeholder="ФИО сотрудника"
        value={searchQuery}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
            className: styles.searchInputRoot
          },
          htmlInput: { className: styles.searchInput }
        }}
        className={styles.search}
        onChange={handleSearchChange}
      />

      <div className={styles.tableWrapper}>
        <div className={styles.headerRow}>
          <div className={styles.checkboxCell}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={isSomeSelected && !isAllSelected}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className={styles.checkbox}
            />
          </div>
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers
              .filter((header) => header.id !== 'mrt-row-select')
              .map((header) => (
                <div key={header.id} className={styles.headerCell}>
                  {header.isPlaceholder ? null : String(header.column.columnDef.header ?? '')}
                </div>
              ))
          )}
        </div>

        <div ref={scrollContainerRef} className={styles.scrollContainer}>
          <div className={styles.virtualSpacer} style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = tableRows[virtualRow.index];
              return (
                <div
                  key={row.id}
                  className={classNames(styles.row, { [styles.rowSelected]: row.getIsSelected() })}
                  onClick={() => row.toggleSelected(!row.getIsSelected())}
                  ref={(node) => rowVirtualizer.measureElement(node)}
                  data-index={virtualRow.index}
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div className={styles.checkboxCell}>
                    <Checkbox
                      checked={row.getIsSelected()}
                      className={styles.checkbox}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => row.toggleSelected(!row.getIsSelected())}
                    />
                  </div>
                  {row
                    .getVisibleCells()
                    .filter((cell) => cell.column.id !== 'mrt-row-select')
                    .map((cell) => (
                      <div key={cell.id} className={styles.bodyCell}>
                        <MRT_TableBodyCellValue cell={cell} table={table} staticRowIndex={virtualRow.index} />
                      </div>
                    ))}
                </div>
              );
            })}
          </div>

          {isLoading && rows.length === 0 && (
            <Stack className={styles.loadingOverlay} alignItems="center" justifyContent="center">
              <CircularProgress size={24} />
            </Stack>
          )}

          {!isLoading && rows.length === 0 && (
            <Stack className={styles.emptyState} alignItems="center" justifyContent="center">
              <Typography color="text.secondary">Сотрудники не найдены</Typography>
            </Stack>
          )}

          {isFetchingNextPage && (
            <Stack className={styles.fetchingIndicator} alignItems="center">
              <CircularProgress size={20} />
            </Stack>
          )}
        </div>
      </div>
    </>
  );
};

export default ModalAddWorkerContent;
