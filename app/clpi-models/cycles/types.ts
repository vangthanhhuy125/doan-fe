export interface CycleItem {
  id: string;
  name: string;
  quarter: string;
  year: number;
  startDate: string;
  endDate: string;
  selfDeadline: string;
  reviewDeadline: string;
  totalOfficers: number;
  units?: string[];
  weights?: { WPI: number; LEI: number; CEI: number; SDI: number };
  status: 'OPEN' | 'REVIEWING' | 'COMPLETED' | 'LOCKED';
}

export interface UnitOption {
  id: string;
  name: string;
  officers: number;
}

export interface WeightProfileOption {
  id: string;
  title: string;
  weights: { WPI: number; LEI: number; CEI: number; SDI: number };
}

export const formatDateVN = (isoDate: string) => {
  if (!isoDate || !isoDate.includes('-')) return isoDate;
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
};