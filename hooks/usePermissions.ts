'use client';

import { useState, useEffect } from 'react';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

let activeFetchPromise: Promise<{ groups: any[]; accounts: any[] }> | null = null;

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

const fetchFreshData = async () => {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  if (!activeFetchPromise) {
    activeFetchPromise = Promise.all([
      fetch(`${apiUrl}/permissions`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${apiUrl}/accounts`).then(r => (r.ok ? r.json() : [])).catch(() => [])
    ])
      .then(([groups, accounts]) => {
        setTimeout(() => {
          activeFetchPromise = null;
        }, 1500);
        return {
          groups: Array.isArray(groups) ? groups : [],
          accounts: Array.isArray(accounts) ? accounts : []
        };
      })
      .catch(() => {
        activeFetchPromise = null;
        return { groups: [], accounts: [] };
      });
  }
  return activeFetchPromise;
};

export function usePermissions(moduleId: string) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const resolvePermissions = async () => {
    try {
      if (typeof window === 'undefined') return;

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setIsLoading(false);
        return;
      }

      const parsed = JSON.parse(userStr);
      const user = parsed.user || parsed;

      let currentGroupId = cleanId(
        user.group_id || user.groupId || user.permission_id || user.group
      );

      // Tải dữ liệu nhóm quyền và tài khoản mới nhất từ Server
      const { groups, accounts } = await fetchFreshData();

      // Nếu tài khoản trong localStorage chưa có groupId, tìm trong danh sách accounts
      if (!currentGroupId && Array.isArray(accounts)) {
        const foundAcc = accounts.find((a: any) => {
          const aId = cleanId(a._id || a.id);
          const uId = cleanId(user._id || user.id || user.user_id);
          return (uId && aId === uId) || (user.username && a.username === user.username);
        });
        if (foundAcc) {
          currentGroupId = cleanId(
            foundAcc.group_id || foundAcc.groupId || foundAcc.permission_id || foundAcc.group
          );
        }
      }

      let activePerms: string[] = [];
      let isSuperAdmin = false;

      // 1. NẾU TÀI KHOẢN CÓ GÁN NHÓM: Lấy quyền của Nhóm làm chuẩn tuyệt đối
      if (currentGroupId && Array.isArray(groups) && groups.length > 0) {
        const myGroup = groups.find((g: any) => cleanId(g._id || g.id) === currentGroupId);
        if (myGroup && Array.isArray(myGroup.permissions)) {
          activePerms = myGroup.permissions;
          if (myGroup.permissions.includes('*')) {
            isSuperAdmin = true;
          }
        }
      } 
      // 2. CHỈ KHI tài khoản KHÔNG thuộc nhóm nào và có quyền admin thì mới là Quản trị viên tự do
      else if (user.role === 'admin' || user.username === 'admin' || user.role === 'QUAN_TRI') {
        isSuperAdmin = true;
      } 
      // 3. Fallback lấy permissions lưu sẵn trên user
      else if (Array.isArray(user.permissions)) {
        activePerms = user.permissions;
      }

      setIsAdmin(isSuperAdmin);
      setPermissions(activePerms);

      // Cập nhật lại vào localStorage để đồng bộ phiên làm việc
      user.permissions = activePerms;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      console.error('Lỗi kiểm tra quyền:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    resolvePermissions();

    const handleUpdate = () => {
      activeFetchPromise = null;
      resolvePermissions();
    };

    window.addEventListener('permissions_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('permissions_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [moduleId]);

  const hasAction = (action: PermissionAction): boolean => {
    // Quản trị viên tối cao hoặc nhóm có ký tự đại diện '*'
    if (isAdmin || permissions.includes('*')) return true;

    // 1. Kiểm tra chính xác quyền chi tiết (VD: 'thi-dua:view')
    if (permissions.includes(`${moduleId}:${action}`)) return true;

    // 2. Nếu đã có bất kỳ quyền con nào dạng 'thi-dua:*' được khai báo,
    // nhưng hành động hiện tại không nằm trong đó -> TỪ CHỐI
    const hasExplicitAction = permissions.some(p => p.startsWith(`${moduleId}:`));
    if (hasExplicitAction) {
      return false;
    }

    // 3. Tương thích ngược: nhóm cũ chỉ lưu 'thi-dua' và không có cấu hình chi tiết
    if (permissions.includes(moduleId)) {
      return true;
    }

    return false;
  };

  return {
    isLoading,
    isAdmin,
    canView: hasAction('view'),
    canCreate: hasAction('create'),
    canEdit: hasAction('edit'),
    canDelete: hasAction('delete'),
    hasAnyAction:
      hasAction('view') || hasAction('create') || hasAction('edit') || hasAction('delete')
  };
}