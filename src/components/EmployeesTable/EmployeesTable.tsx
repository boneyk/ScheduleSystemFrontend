import { useEffect, useMemo, useState } from 'react';

import { Box, Grid2 } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { observer } from 'mobx-react-lite';

import ModalAddWorker from '@/components/Modals/ModalAddWorker';
import ModalDeleteEmployee from '@/components/Modals/ModalDeleteEmployee';

import { useEmployeeOffices } from '@/hooks/useEmployeeOffices';
import { Formats } from '@/utils/formats';
import { DataGrid, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';

import styles from './EmployeesTable.module.scss';
import EmployeesTableToolbar from './EmployeesTableToolbar';
import { deleteEmployees } from '@/api/office_service';
import {
  employeeIdsByOfficeKey,
  employeesByIdsKey,
  fetchEmployeeIdsByOffice,
  fetchEmployeesByIds,
  fetchPositions,
  positionsKey,
  queryClient
} from '@/api/queries';
import { deleteShifts, getShiftsByEmployeeIds } from '@/api/shedule_service';
import { getFutureShiftIds } from '@/lib/mapper';
import { baseLayoutStore } from '@/stores/baseLayout.store';
import { timetableStore } from '@/stores/timetable.store';
import { useStores } from '@/stores/useStores';

dayjs.extend(isSameOrAfter);
const EMPLOYEES_TABLE_COLUMNS = [
  {
    field: 'fullName',
    headerName: 'ФИО сотрудника',
    editable: false,
    flex: 1
  },
  {
    field: 'email',
    headerName: 'Почта',
    editable: false,
    flex: 1
  },
  {
    field: 'work',
    headerName: 'Должность',
    editable: false,
    flex: 1
  }
];

const EmployeesTable = observer(() => {
  const { employeesStore } = useStores();
  const { currentOfficeEmployees, page, pageSize, totalElements, setAddEmployeeDialogVisibility } = employeesStore;
  const { employeeQuery, officesQuery } = useEmployeeOffices();

  const [selectedPositionId, setSelectedPositionId] = useState<number | undefined>();
  const [isSmallDisplay, setIsSmallDisplay] = useState(window.innerWidth < 700);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [delShifts, setDelShifts] = useState<number[]>([]);
  const handleAddEmployee = () => {
    setAddEmployeeDialogVisibility(true);
  };

  const positionsQuery = useQuery({
    queryKey: positionsKey(),
    queryFn: fetchPositions
  });

  const officeId = timetableStore.selectedOffice?.id;
  const employeeIdsQuery = useQuery({
    queryKey: officeId ? employeeIdsByOfficeKey(officeId) : ['employeeIds-disabled'],
    queryFn: fetchEmployeeIdsByOffice,
    enabled: !!officeId
  });

  useEffect(() => {
    if (!timetableStore.selectedOffice && officesQuery.data?.length && employeeQuery.data) {
      timetableStore.setSelectedOffice(officesQuery.data[0]);
      timetableStore.setOffices(officesQuery.data);
      timetableStore.setEmployee(employeeQuery.data);
    }
  }, [officesQuery.data, employeeQuery.data]);

  const employeesQuery = useQuery({
    queryKey: employeeIdsQuery.data
      ? employeesByIdsKey(employeeIdsQuery.data, employeesStore.page, employeesStore.pageSize, selectedPositionId)
      : ['employees-disabled'],
    queryFn: fetchEmployeesByIds,
    enabled: !!employeeIdsQuery.data
  });

  const isLoading = employeeIdsQuery.isLoading || employeesQuery.isLoading;
  const isEmployeesReady = employeesQuery.isSuccess;

  useEffect(() => {
    if (employeesQuery.data) {
      employeesStore.setEmployees(employeesQuery.data.content ?? []);
      employeesStore.setTotalElements(employeesQuery.data.page?.totalElements ?? 0);
    }
  }, [employeesQuery.data, employeesStore]);

  const rows = useMemo(() => {
    return currentOfficeEmployees.map((employee) => ({
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      work: employee.position.name ?? ''
    }));
  }, [currentOfficeEmployees]);

  const handlePositionChange = (positionId: number | undefined) => {
    setSelectedPositionId(positionId);
    employeesStore.setPage(0);
  };

  useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth < 700;
      setIsSmallDisplay(small);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (model.pageSize !== pageSize) {
      employeesStore.setPageSize(model.pageSize);
    } else if (model.page !== page) {
      employeesStore.setPage(model.page);
    }
  };

  const handleDeleteEmployee = async () => {
    if (rowSelectionModel.length === 0) {
      baseLayoutStore.showWarning('Сначала выберите сотрудника');
      return;
    }
    try {
      if (!officeId) return;
      const employeeIds = rowSelectionModel as number[];
      const getShifts = await getShiftsByEmployeeIds(officeId, employeeIds, dayjs().format(Formats.DATE_API));
      setDelShifts(getFutureShiftIds(getShifts.data));
      setIsDeleteConfirmOpen(true);
    } catch (error) {
      let message = 'Ошибка при удалении сотрудника';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.detail ?? message;
      }
      baseLayoutStore.showWarning(message);
    }
  };

  const confirmDeleteEmployee = async () => {
    const employeeIds = rowSelectionModel as number[];
    setIsDeleteConfirmOpen(false);
    try {
      if (!officeId) return;
      if (delShifts.length > 0) await deleteShifts(delShifts);
      await deleteEmployees(officeId, employeeIds);
      await queryClient.invalidateQueries({
        queryKey: employeeIdsByOfficeKey(officeId)
      });
      await queryClient.invalidateQueries({
        queryKey: ['employeesByIds']
      });
      await queryClient.invalidateQueries({
        queryKey: ['schedule']
      });
      setRowSelectionModel([]);
      baseLayoutStore.showSuccess('Удаление прошло успешно');
    } catch (error) {
      let message = 'Ошибка при удалении сотрудника';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.detail ?? message;
      }
      baseLayoutStore.showWarning(message);
    }
  };

  const selectedEmployeeNames = useMemo(() => {
    const ids = rowSelectionModel as number[];
    return currentOfficeEmployees.filter((e) => ids.includes(e.id)).map((e) => e.fullName);
  }, [rowSelectionModel, currentOfficeEmployees]);

  return (
    <>
      <ModalAddWorker />
      <ModalDeleteEmployee
        open={isDeleteConfirmOpen}
        employeeNames={selectedEmployeeNames}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteEmployee}
      />
      <Grid2 container className={styles.wrapper}>
        <h1>Сотрудники офиса</h1>
        <Grid2 container className={styles.table}>
          <EmployeesTableToolbar
            address={timetableStore.selectedOffice?.address ?? 'Офис не определен'}
            positions={positionsQuery.data}
            selectedPositionId={selectedPositionId}
            isSmallDisplay={isSmallDisplay}
            onPositionChange={handlePositionChange}
            isLoading={!isEmployeesReady}
            onAddEmployee={handleAddEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
          <Box className={styles.tableBox}>
            <DataGrid
              columns={EMPLOYEES_TABLE_COLUMNS}
              rows={rows}
              rowCount={totalElements}
              loading={isLoading}
              paginationMode="server"
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={handlePaginationModelChange}
              pageSizeOptions={[10, 20, 50]}
              disableColumnResize
              disableColumnMenu
              checkboxSelection
              getRowHeight={() => 'auto'}
              className={styles.data}
              localeText={{ noRowsLabel: 'Сотрудники не найдены' }}
              onRowSelectionModelChange={setRowSelectionModel}
            />
          </Box>
        </Grid2>
      </Grid2>
    </>
  );
});

export default EmployeesTable;
