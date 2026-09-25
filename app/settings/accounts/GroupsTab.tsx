'use client';

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Sliders, ShieldCheck } from "lucide-react";
import GroupsModal from "./GroupsModal";
import GroupPermissionsModal, { SIDEBAR_MENU_ITEMS } from "./GroupPermissionsModal";

const cleanId = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'object') {
    if (val.$oid) return String(val.$oid).trim();
    if (val._id) return cleanId(val._id);
    if (val.id) return cleanId(val.id);
  }
  const str = String(val).trim();
  return str === '[object Object]' ? '' : str;
};

export default function GroupsTab() {
  const [groups, setGroups] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [groupModal, setGroupModal] = useState<{ open: boolean; mode: 'add' | 'edit' | 'delete'; data: any }>({
    open: false,
    mode: 'add',
    data: null
  });

  const [permissionModal, setPermissionModal] = useState<{ open: boolean; group: any }>({
    open: false,
    group: null
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [resGroups, resAccounts] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, { headers })
      ]);

      if (resGroups.ok) {
        const data = await resGroups.json();
        const groupList = Array.isArray(data) ? data : [];
        groupList.sort((a: any, b: any) => (a.order ?? 99) - (b.order ?? 99));
        setGroups(groupList);
      } else {
        setGroups([]);
      }

      if (resAccounts.ok) {
        const accData = await resAccounts.json();
        setAccounts(Array.isArray(accData) ? accData : []);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error(error);
      setGroups([]);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMemberCount = (group: any) => {
    if (!Array.isArray(accounts) || accounts.length === 0) return 0;
    const targetGroupId = cleanId(group._id || group.id);
    const targetGroupName = (group.name || '').trim().toLowerCase();

    return accounts.filter((acc: any) => {
      const accGroupId = cleanId(
        acc.group_id || acc.groupId || acc.permission_id || acc.group
      );

      if (targetGroupId && accGroupId && targetGroupId === accGroupId) {
        return true;
      }

      const accRole = (acc.role || '').trim().toLowerCase();
      if (
        targetGroupName.includes('quản trị') &&
        (accRole === 'admin' || acc.username === 'admin')
      ) {
        return true;
      }

      if (accRole && accRole === targetGroupName) {
        return true;
      }

      return false;
    }).length;
  };

  const handleDeleteGroup = async (id: string | number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions/${id}`, { 
        method: 'DELETE' 
      });
      if (res.ok || res.status === 204) {
        fetchData();
      } else {
        alert("Xóa nhóm quyền thất bại!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGroup = async (payload: any) => {
    const isAdd = groupModal.mode === 'add';
    const groupId = payload._id || payload.id;
    const url = isAdd 
      ? `${process.env.NEXT_PUBLIC_API_URL}/permissions` 
      : `${process.env.NEXT_PUBLIC_API_URL}/permissions/${groupId}`;

    try {
      const res = await fetch(url, {
        method: isAdd ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          description: payload.description,
          order: Number(payload.order) || 1,
        }),
      });

      if (res.ok) {
        setGroupModal({ open: false, mode: 'add', data: null });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || "Lưu thông tin thất bại!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePermissions = async (groupId: string | number, permissions: string[]) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });

      if (res.ok) {
        fetchData();
      } else {
        alert("Lưu phân quyền thất bại!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 text-black">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
          Danh sách nhóm quyền hệ thống ({groups.length})
        </h3>
        <button 
          onClick={() => setGroupModal({ open: true, mode: 'add', data: null })}
          className="flex items-center gap-2 bg-[#0054a5] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer"
        >
          <Plus size={16} /> Thêm nhóm mới
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-gray-400 italic">
          Đang tải danh sách nhóm quyền...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const rawPerms: string[] = group.permissions || [];
            const activeModulesCount = SIDEBAR_MENU_ITEMS.filter(item => 
              rawPerms.includes(item.id) || rawPerms.includes(`${item.id}:view`)
            ).length;

            return (
              <div key={group._id || group.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 hover:border-[#0054a5]/40 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0054a5] text-[10px] font-black flex items-center justify-center shrink-0">
                          {group.order ?? 1}
                        </span>
                        <h4 className="font-black text-slate-800 text-sm">{group.name}</h4>
                      </div>
                      <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-[#0054a5] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                        <Users size={12} /> {getMemberCount(group)} thành viên
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setGroupModal({ open: true, mode: 'edit', data: group })}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border-none bg-transparent cursor-pointer" 
                        title="Chỉnh sửa nhóm"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => setGroupModal({ open: true, mode: 'delete', data: group })}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border-none bg-transparent cursor-pointer" 
                        title="Xóa nhóm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {group.description || "Chưa có mô tả..."}
                  </p>

                  <div className="text-[11px] text-gray-500 font-semibold flex items-center justify-between bg-gray-50 p-2.5 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#0054a5]" /> Quyền truy cập:
                    </span>
                    <span className="text-[#0054a5] font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {activeModulesCount} / {SIDEBAR_MENU_ITEMS.length} chức năng
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-semibold">Phân quyền chi tiết</span>
                  <button 
                    onClick={() => setPermissionModal({ open: true, group })}
                    className="text-[#0054a5] font-bold hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1"
                  >
                    <Sliders size={12} /> Cấu hình quyền &rarr;
                  </button>
                </div>
              </div>
            );
          })}

          {groups.length === 0 && (
            <div className="col-span-full p-12 text-center text-xs font-bold text-gray-400 italic bg-white rounded-3xl border border-gray-100">
              Chưa có nhóm quyền nào được tạo...
            </div>
          )}
        </div>
      )}

      {groupModal.open && (
        <GroupsModal
          mode={groupModal.mode}
          data={groupModal.data}
          onClose={() => setGroupModal({ ...groupModal, open: false })}
          onConfirmDelete={handleDeleteGroup}
          onSave={handleSaveGroup}
        />
      )}

      {permissionModal.open && (
        <GroupPermissionsModal
          group={permissionModal.group}
          onClose={() => setPermissionModal({ open: false, group: null })}
          onSavePermissions={handleSavePermissions}
        />
      )}
    </div>
  );
}