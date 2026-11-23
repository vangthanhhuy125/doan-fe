export interface OfficerItem {
  id: string;
  code: string;
  name: string;
  position: string;
  positions?: string[];
  unit: string;
  role: string;
  avatarUrl?: string;
}

export const CLPI_ROLES = [
  {
    value: 'Officer',
    label: 'Officer (Cán bộ được đánh giá)',
    badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    value: 'Unit Manager',
    label: 'Unit Manager (Trưởng đơn vị)',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    value: 'Reviewer',
    label: 'Reviewer (Người thẩm định)',
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    value: 'CLPI Admin',
    label: 'CLPI Admin (Ban Thường vụ)',
    badgeStyle: 'bg-blue-50 text-[#0054a5] border-blue-200',
  },
];