'use client';

import { useState, useEffect } from 'react';
import { OfficerItem } from './types';
import PersonnelTableSection from './components/PersonnelTableSection';
import PersonnelModal from './components/PersonnelModal';

export default function PersonnelManagementPage() {
  const [officers, setOfficers] = useState<OfficerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'add' | 'edit' | 'view';
    data: OfficerItem | null;
  }>({ open: false, mode: 'add', data: null });

  const getHeaders = () => {
    const token = localStorage.getItem('token') || '';
    let userId = '';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        const u = parsed.user || parsed;
        userId = String(u._id || u.id || u.user_id || '').trim();
      }
    } catch {}
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['x-user-id'] = userId;
    return headers;
  };

  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/clpi/personnel`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setOfficers(Array.isArray(data) ? data : []);
      } else {
        setOfficers([]);
      }
    } catch {
      setOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const handleOpenModal = (mode: 'add' | 'edit' | 'view', data: OfficerItem | null = null) => {
    setModalState({ open: true, mode, data });
  };

  const handleSaveOfficer = async (payload: Omit<OfficerItem, 'id'>, id?: string) => {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    const isEdit = Boolean(id);
    const url = isEdit ? `${apiUrl}/clpi/personnel/${id}` : `${apiUrl}/clpi/personnel`;

    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Không thể lưu thông tin cán bộ. Vui lòng thử lại.');
    }

    setModalState({ open: false, mode: 'add', data: null });
    await fetchPersonnel();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 text-black">
      <PersonnelTableSection
        officers={officers}
        loading={loading}
        onOpenModal={handleOpenModal}
      />

      {modalState.open && (
        <PersonnelModal
          mode={modalState.mode}
          data={modalState.data}
          onClose={() => setModalState({ ...modalState, open: false })}
          onSave={handleSaveOfficer}
        />
      )}
    </div>
  );
}