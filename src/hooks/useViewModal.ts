import { useCallback, useState } from 'react';

import { Office } from '@/dto/DtoSchedule';
import type { CombinedShifts, ShiftType } from '@/types/schedule';

export interface ShiftModalData {
  id: number;
  employeeId: number;
  fullname: string;
  job: string;
  dayIndex: number;
  type: ShiftType;
  text: string;
  startOn: string;
  endOn: string;
  substitutionGroup: boolean;
  attachedToOffice: boolean;
  office: Office | null;
  isCombined?: boolean;
  shiftsForCombined?: CombinedShifts[] | null;
}

export const useViewModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftModalData | null>(null);

  const openViewModal = useCallback((data: ShiftModalData) => {
    setSelectedShift(data);
    setIsOpen(true);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setSelectedShift(null);
  };

  return {
    isOpen,
    selectedShift,
    openViewModal,
    closeModal
  };
};
