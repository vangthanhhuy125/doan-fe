'use client';

import { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  Check, 
  CheckCircle2, 
  Info, 
  FileText, 
  Calendar, 
  Award, 
  Users, 
  UserCheck, 
  Layers, 
  Settings 
} from "lucide-react";

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export interface ModulePermissionState {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export const SIDEBAR_MENU_ITEMS = [
  { id: 'gioi-thieu', name: 'Giới thiệu', icon: Info },
  { id: 'tai-lieu', name: 'Tài liệu', icon: FileText },
  { id: 'chuong-trinh-nam', name: 'Chương trình năm', icon: Calendar },
  { id: 'cong-tac-doan', name: 'Công tác Đoàn - Đảng', icon: ShieldCheck },
  { id: 'thi-dua', name: 'Thi đua', icon: Award },
  { id: 'to-chuc-doan', name: 'Tổ chức Đoàn khoa', icon: Users },
  { id: 'nhan-su', name: 'Nhân sự', icon: UserCheck },
  { id: 'mo-hinh-clb', name: 'Mô hình CLB', icon: Layers },
  { id: 'cai-dat', name: 'Cài đặt hệ thống', icon: Settings },
];

export const checkPermission = (
  userPermissions: string[] | undefined,
  moduleId: string,
  action: PermissionAction = 'view'
): boolean => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes(`${moduleId}:${action}`)) return true;
  const hasExplicit = userPermissions.some(p => p.startsWith(`${moduleId}:`));
  if (!hasExplicit && userPermissions.includes(moduleId)) {
    return true;
  }
  return false;
};

interface Props {
  group: any;
  onClose: () => void;
  onSavePermissions: (groupId: string | number, permissions: string[]) => void;
}

// Component Checkbox nhỏ gọn, kích thước chuẩn 16x16px
function ColorCheckbox({ 
  checked, 
  activeClass, 
  hoverClass 
}: { 
  checked: boolean; 
  activeClass: string; 
  hoverClass: string;
}) {
  return (
    <div
      className={`w-4 h-4 rounded-[4px] mx-auto flex items-center justify-center transition-all ${
        checked
          ? `${activeClass} text-white shadow-2xs`
          : `border border-slate-300 bg-white ${hoverClass}`
      }`}
    >
      {checked && <Check size={11} strokeWidth={3.2} />}
    </div>
  );
}

export default function GroupPermissionsModal({ group, onClose, onSavePermissions }: Props) {
  const [permissionsState, setPermissionsState] = useState<Record<string, ModulePermissionState>>(() => {
    const raw: string[] = group?.permissions || [];
    const state: Record<string, ModulePermissionState> = {};

    SIDEBAR_MENU_ITEMS.forEach(item => {
      const hasExplicit = raw.some(p => p.startsWith(`${item.id}:`));
      if (hasExplicit) {
        state[item.id] = {
          view: raw.includes(`${item.id}:view`),
          create: raw.includes(`${item.id}:create`),
          edit: raw.includes(`${item.id}:edit`),
          delete: raw.includes(`${item.id}:delete`),
        };
      } else {
        const isLegacySelected = raw.includes(item.id);
        state[item.id] = {
          view: isLegacySelected,
          create: isLegacySelected,
          edit: isLegacySelected,
          delete: isLegacySelected,
        };
      }
    });

    return state;
  });

  const handleToggleAction = (moduleId: string, action: PermissionAction) => {
    setPermissionsState(prev => {
      const current = prev[moduleId] || { view: false, create: false, edit: false, delete: false };
      const nextVal = !current[action];
      const updated = { ...current, [action]: nextVal };

      if (action !== 'view' && nextVal) {
        updated.view = true;
      }
      if (action === 'view' && !nextVal) {
        updated.create = false;
        updated.edit = false;
        updated.delete = false;
      }

      return { ...prev, [moduleId]: updated };
    });
  };

  const handleToggleRow = (moduleId: string) => {
    setPermissionsState(prev => {
      const current = prev[moduleId] || { view: false, create: false, edit: false, delete: false };
      const isFull = current.view && current.create && current.edit && current.delete;
      const nextVal = !isFull;
      return {
        ...prev,
        [moduleId]: {
          view: nextVal,
          create: nextVal,
          edit: nextVal,
          delete: nextVal,
        }
      };
    });
  };

  const handleToggleColumn = (action: PermissionAction) => {
    setPermissionsState(prev => {
      const allChecked = SIDEBAR_MENU_ITEMS.every(item => prev[item.id]?.[action]);
      const nextVal = !allChecked;
      const updated: Record<string, ModulePermissionState> = {};

      SIDEBAR_MENU_ITEMS.forEach(item => {
        const current = prev[item.id] || { view: false, create: false, edit: false, delete: false };
        const row = { ...current, [action]: nextVal };

        if (action !== 'view' && nextVal) {
          row.view = true;
        }
        if (action === 'view' && !nextVal) {
          row.create = false;
          row.edit = false;
          row.delete = false;
        }

        updated[item.id] = row;
      });

      return updated;
    });
  };

  const handleBulkSetAll = (mode: 'full' | 'viewOnly' | 'none') => {
    const updated: Record<string, ModulePermissionState> = {};
    SIDEBAR_MENU_ITEMS.forEach(item => {
      updated[item.id] = {
        view: mode === 'full' || mode === 'viewOnly',
        create: mode === 'full',
        edit: mode === 'full',
        delete: mode === 'full',
      };
    });
    setPermissionsState(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPermissions: string[] = [];

    Object.entries(permissionsState).forEach(([moduleId, actions]) => {
      if (actions.view) {
        finalPermissions.push(moduleId);
        finalPermissions.push(`${moduleId}:view`);
      }
      if (actions.create) finalPermissions.push(`${moduleId}:create`);
      if (actions.edit) finalPermissions.push(`${moduleId}:edit`);
      if (actions.delete) finalPermissions.push(`${moduleId}:delete`);
    });

    onSavePermissions(group._id || group.id, Array.from(new Set(finalPermissions)));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('permissions_updated'));
    }

    onClose();
  };

  const isColChecked = (action: PermissionAction) =>
    SIDEBAR_MENU_ITEMS.length > 0 && SIDEBAR_MENU_ITEMS.every(item => permissionsState[item.id]?.[action]);

  const allModulesChecked = SIDEBAR_MENU_ITEMS.every(item => {
    const s = permissionsState[item.id];
    return s?.view && s?.create && s?.edit && s?.delete;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 text-slate-800">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0054a5] flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Phân quyền chức năng</h3>
              <p className="text-xs text-slate-500 font-medium">
                Nhóm quyền: <span className="text-[#0054a5] font-semibold">{group?.name}</span>
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Thanh thao tác nhanh */}
        <div className="px-6 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-400 font-medium">Thao tác nhanh:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleBulkSetAll('full')}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:text-[#0054a5] text-slate-600 font-semibold transition-all cursor-pointer shadow-2xs text-xs"
            >
              Toàn quyền
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetAll('viewOnly')}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 text-slate-600 font-semibold transition-all cursor-pointer shadow-2xs text-xs"
            >
              Chỉ xem
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetAll('none')}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 font-medium transition-all cursor-pointer shadow-2xs text-xs"
            >
              Bỏ chọn
            </button>
          </div>
        </div>

        {/* Bảng phân quyền Ma trận */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="overflow-y-auto flex-1 px-6 py-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider select-none">
                  <th className="py-3 px-2 text-slate-400">Chức năng</th>
                  
                  {/* Cột Xem - Xanh dương */}
                  <th 
                    onClick={() => handleToggleColumn('view')}
                    className="py-3 px-2 w-16 text-center cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
                    title="Bấm để chọn/bỏ chọn tất cả"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span>Xem</span>
                      <ColorCheckbox
                        checked={isColChecked('view')}
                        activeClass="bg-blue-600 border-blue-600"
                        hoverClass="hover:border-blue-400"
                      />
                    </div>
                  </th>

                  {/* Cột Thêm - Xanh lá */}
                  <th 
                    onClick={() => handleToggleColumn('create')}
                    className="py-3 px-2 w-16 text-center cursor-pointer text-emerald-600 hover:text-emerald-800 transition-colors"
                    title="Bấm để chọn/bỏ chọn tất cả"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span>Thêm</span>
                      <ColorCheckbox
                        checked={isColChecked('create')}
                        activeClass="bg-emerald-600 border-emerald-600"
                        hoverClass="hover:border-emerald-400"
                      />
                    </div>
                  </th>

                  {/* Cột Sửa - Cam vàng */}
                  <th 
                    onClick={() => handleToggleColumn('edit')}
                    className="py-3 px-2 w-16 text-center cursor-pointer text-amber-600 hover:text-amber-800 transition-colors"
                    title="Bấm để chọn/bỏ chọn tất cả"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span>Sửa</span>
                      <ColorCheckbox
                        checked={isColChecked('edit')}
                        activeClass="bg-amber-500 border-amber-500"
                        hoverClass="hover:border-amber-400"
                      />
                    </div>
                  </th>

                  {/* Cột Xóa - Đỏ */}
                  <th 
                    onClick={() => handleToggleColumn('delete')}
                    className="py-3 px-2 w-16 text-center cursor-pointer text-rose-600 hover:text-rose-800 transition-colors"
                    title="Bấm để chọn/bỏ chọn tất cả"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span>Xóa</span>
                      <ColorCheckbox
                        checked={isColChecked('delete')}
                        activeClass="bg-rose-500 border-rose-500"
                        hoverClass="hover:border-rose-400"
                      />
                    </div>
                  </th>

                  {/* Cột Tất cả - Xám đậm */}
                  <th 
                    onClick={() => handleBulkSetAll(allModulesChecked ? 'none' : 'full')}
                    className="py-3 px-2 w-16 text-center cursor-pointer text-slate-700 hover:text-slate-900 transition-colors"
                    title="Chọn/bỏ tất cả chức năng"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span>Tất cả</span>
                      <ColorCheckbox
                        checked={allModulesChecked}
                        activeClass="bg-slate-700 border-slate-700"
                        hoverClass="hover:border-slate-500"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {SIDEBAR_MENU_ITEMS.map((item) => {
                  const current = permissionsState[item.id] || { view: false, create: false, edit: false, delete: false };
                  const isFull = current.view && current.create && current.edit && current.delete;
                  const Icon = item.icon;

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Tên chức năng kèm icon */}
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-[#0054a5] flex items-center justify-center transition-colors">
                            <Icon size={14} />
                          </div>
                          <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      {/* Cột Xem: Xanh dương */}
                      <td 
                        onClick={() => handleToggleAction(item.id, 'view')} 
                        className="py-2.5 px-2 text-center cursor-pointer"
                      >
                        <ColorCheckbox
                          checked={current.view}
                          activeClass="bg-blue-600 border-blue-600"
                          hoverClass="hover:border-blue-400"
                        />
                      </td>

                      {/* Cột Thêm: Xanh lá */}
                      <td 
                        onClick={() => handleToggleAction(item.id, 'create')} 
                        className="py-2.5 px-2 text-center cursor-pointer"
                      >
                        <ColorCheckbox
                          checked={current.create}
                          activeClass="bg-emerald-600 border-emerald-600"
                          hoverClass="hover:border-emerald-400"
                        />
                      </td>

                      {/* Cột Sửa: Cam vàng */}
                      <td 
                        onClick={() => handleToggleAction(item.id, 'edit')} 
                        className="py-2.5 px-2 text-center cursor-pointer"
                      >
                        <ColorCheckbox
                          checked={current.edit}
                          activeClass="bg-amber-500 border-amber-500"
                          hoverClass="hover:border-amber-400"
                        />
                      </td>

                      {/* Cột Xóa: Đỏ hồng */}
                      <td 
                        onClick={() => handleToggleAction(item.id, 'delete')} 
                        className="py-2.5 px-2 text-center cursor-pointer"
                      >
                        <ColorCheckbox
                          checked={current.delete}
                          activeClass="bg-rose-500 border-rose-500"
                          hoverClass="hover:border-rose-400"
                        />
                      </td>

                      {/* Cột Tất cả hàng: Xám đậm */}
                      <td 
                        onClick={() => handleToggleRow(item.id)} 
                        className="py-2.5 px-2 text-center cursor-pointer"
                      >
                        <ColorCheckbox
                          checked={isFull}
                          activeClass="bg-slate-700 border-slate-700"
                          hoverClass="hover:border-slate-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer nút hành động */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-xl font-semibold text-slate-500 hover:bg-slate-200/60 transition-all text-xs border-none outline-none cursor-pointer"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-[#0054a5] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all text-xs flex items-center gap-1.5 border-none outline-none cursor-pointer active:scale-95"
            >
              <CheckCircle2 size={15} />
              <span>Lưu phân quyền</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}