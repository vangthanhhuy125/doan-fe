'use client';

import { useState } from "react";
import { X, ShieldCheck, Check, LayoutGrid, Eye, Plus, Edit, Trash2, CheckCircle2 } from "lucide-react";

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export interface ModulePermissionState {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export const SIDEBAR_MENU_ITEMS = [
  { id: 'gioi-thieu', name: 'Giới thiệu', desc: 'Xem thông tin giới thiệu chung về Đoàn khoa' },
  { id: 'tai-lieu', name: 'Tài liệu', desc: 'Quản lý văn bản, biểu mẫu và tài liệu lưu trữ' },
  { id: 'chuong-trinh-nam', name: 'Chương trình năm', desc: 'Quản lý hoạt động, sự kiện và phiếu đăng ký' },
  { id: 'cong-tac-doan', name: 'Công tác Đoàn - Đảng', desc: 'Quản lý đoàn viên, phân loại và công tác phát triển' },
  { id: 'thi-dua', name: 'Thi đua', desc: 'Theo dõi điểm rèn luyện, khen thưởng và kỉ luật' },
  { id: 'to-chuc-doan', name: 'Tổ chức Đoàn khoa', desc: 'Cơ cấu ban chấp hành và danh sách các chi đoàn' },
  { id: 'nhan-su', name: 'Nhân sự', desc: 'Quản lý thông tin hồ sơ nhân sự Đoàn khoa' },
  { id: 'mo-hinh-clb', name: 'Mô hình CLB', desc: 'Quản lý mô hình câu lạc bộ và phong trào' },
  { id: 'cai-dat', name: 'Cài đặt', desc: 'Cấu hình phân quyền hệ thống và tài khoản' },
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

  const handleSetModuleMode = (moduleId: string, mode: 'full' | 'viewOnly' | 'none') => {
    setPermissionsState(prev => ({
      ...prev,
      [moduleId]: {
        view: mode === 'full' || mode === 'viewOnly',
        create: mode === 'full',
        edit: mode === 'full',
        delete: mode === 'full',
      }
    }));
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
    onClose();
  };

  const totalActiveModules = Object.values(permissionsState).filter(s => s.view).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
        <div className="bg-[#0054a5] p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Phân quyền chi tiết (Xem / Thêm / Sửa / Xóa)</h3>
              <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                Nhóm quyền: <strong className="text-white uppercase">{group?.name}</strong>
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <LayoutGrid size={15} className="text-[#0054a5]" />
            Thao tác nhanh cho tất cả mục:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkSetAll('full')}
              className="px-3 py-1.5 rounded-lg bg-blue-100/70 hover:bg-blue-200 text-[#0054a5] text-xs font-bold transition-all border-none cursor-pointer"
            >
              Tất cả toàn quyền
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetAll('viewOnly')}
              className="px-3 py-1.5 rounded-lg bg-emerald-100/70 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-all border-none cursor-pointer"
            >
              Tất cả chỉ xem
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetAll('none')}
              className="px-3 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-600 text-xs font-bold transition-all border-none cursor-pointer"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 gap-3.5">
            {SIDEBAR_MENU_ITEMS.map((item) => {
              const current = permissionsState[item.id] || { view: false, create: false, edit: false, delete: false };
              const isFull = current.view && current.create && current.edit && current.delete;
              const isViewOnly = current.view && !current.create && !current.edit && !current.delete;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    current.view 
                      ? 'bg-blue-50/30 border-blue-200 shadow-2xs' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${current.view ? 'bg-[#0054a5]' : 'bg-slate-300'}`} />
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">{item.name}</h4>
                        {isFull && (
                          <span className="text-[10px] font-black bg-blue-100 text-[#0054a5] px-2 py-0.5 rounded-md uppercase">
                            Toàn quyền
                          </span>
                        )}
                        {isViewOnly && (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase">
                            Chỉ xem
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium pl-4 line-clamp-1">{item.desc}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-4 lg:pl-0">
                      <button
                        type="button"
                        onClick={() => handleToggleAction(item.id, 'view')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          current.view
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Eye size={13} />
                        <span>Xem</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAction(item.id, 'create')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          current.create
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Plus size={13} />
                        <span>Thêm</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAction(item.id, 'edit')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          current.edit
                            ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Edit size={13} />
                        <span>Sửa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAction(item.id, 'delete')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          current.delete
                            ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Trash2 size={13} />
                        <span>Xóa</span>
                      </button>

                      <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

                      <div className="flex items-center gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleSetModuleMode(item.id, isFull ? 'none' : 'full')}
                          className="px-2 py-1 text-blue-600 hover:underline font-bold border-none bg-transparent cursor-pointer"
                        >
                          {isFull ? "Bỏ chọn" : "Toàn quyền"}
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => handleSetModuleMode(item.id, isViewOnly ? 'none' : 'viewOnly')}
                          className="px-2 py-1 text-emerald-700 hover:underline font-bold border-none bg-transparent cursor-pointer"
                        >
                          Chỉ xem
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-500">
              Được phép truy cập: <strong className="text-[#0054a5] font-black">{totalActiveModules} / {SIDEBAR_MENU_ITEMS.length}</strong> chức năng
            </span>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-xs tracking-wider uppercase border-none outline-none cursor-pointer"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="px-8 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all text-xs tracking-wider uppercase border-none outline-none cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>Lưu phân quyền</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}