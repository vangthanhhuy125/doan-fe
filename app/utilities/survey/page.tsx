'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Filter, RotateCcw, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

import { SurveyForm } from './types';
import SurveyList from './SurveyList';
import SurveyBuilderModal from './SurveyBuilderModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const cleanVal = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val.trim().toLowerCase();
  if (typeof val === 'object') {
    if (val.$oid) return String(val.$oid).trim().toLowerCase();
    if (val._id) return cleanVal(val._id);
    if (val.id) return cleanVal(val.id);
    if (val.user_id) return cleanVal(val.user_id);
    if (val.student_id) return cleanVal(val.student_id);
  }
  return String(val).trim().toLowerCase();
};

const getUserIdentifiers = (): { idSet: Set<string>; primaryId: string } => {
  const idSet = new Set<string>();
  let primaryId = '';
  if (typeof window === 'undefined') return { idSet, primaryId };

  try {
    const token = localStorage.getItem('token');
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        [payload._id, payload.user_id, payload.id, payload.student_id, payload.username, payload.sub].forEach(v => {
          const c = cleanVal(v);
          if (c) idSet.add(c);
        });
        if (payload._id) primaryId = String(payload._id);
        else if (payload.user_id) primaryId = String(payload.user_id);
      }
    }
  } catch (e) {}

  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      [u._id, u.user_id, u.id, u.student_id, u.username, u.email].forEach(v => {
        const c = cleanVal(v);
        if (c) idSet.add(c);
      });
      if (u.user && typeof u.user === 'object') {
        [u.user._id, u.user.user_id, u.user.id, u.user.student_id, u.user.username].forEach(v => {
          const c = cleanVal(v);
          if (c) idSet.add(c);
        });
      }
      if (!primaryId) {
        primaryId = String(u._id || u.user_id || u.id || '');
      }
    }
  } catch (e) {}

  return { idSet, primaryId };
};

export default function SurveyPage() {
  const [surveys, setSurveys] = useState<SurveyForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [userIds, setUserIds] = useState<Set<string>>(new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'locked'>('all');

  const [selectedSurveyForBuilder, setSelectedSurveyForBuilder] = useState<SurveyForm | null | 'new'>(null);
  const [surveyToDelete, setSurveyToDelete] = useState<SurveyForm | null>(null);

  const fetchSurveys = async (uid?: string) => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
      const activeId = uid || currentUserId;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/surveys`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-user-id': activeId
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSurveys(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { idSet, primaryId } = getUserIdentifiers();
    setUserIds(idSet);
    setCurrentUserId(primaryId);
    fetchSurveys(primaryId);
  }, []);

  const handleToggleLock = async (survey: SurveyForm) => {
    try {
      const updatedStatus = !survey.is_locked;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/surveys/${survey._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-user-id': currentUserId
        },
        body: JSON.stringify({ 
          ...survey, 
          is_locked: updatedStatus,
          user_id: currentUserId 
        })
      });

      if (res.ok) {
        setSurveys(prev => prev.map(s => s._id === survey._id ? { ...s, is_locked: updatedStatus } : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmDelete = async () => {
    if (!surveyToDelete) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/surveys/${surveyToDelete._id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-user-id': currentUserId
        }
      });
      if (res.ok) {
        await fetchSurveys(currentUserId);
        setSurveyToDelete(null);
      } else {
        alert('Xóa phiếu khảo sát thất bại!');
      }
    } catch (e) {
      console.error(e);
      alert('Không thể kết nối đến máy chủ!');
    }
  };

  const exportResponsesToExcel = (survey: SurveyForm) => {
    if (!survey.responses || survey.responses.length === 0) {
      alert('Chưa có lượt nộp bài nào để xuất Excel!');
      return;
    }

    const headers = ['STT', 'MSSV', 'Họ và tên', ...survey.questions.map(q => q.text), 'Thời gian nộp'];
    const rows = survey.responses.map((resp, idx) => {
      const answerMap: Record<string, string> = {};
      (resp.answers || []).forEach((a: any) => {
        answerMap[a.question_id] = Array.isArray(a.value) ? a.value.join(', ') : String(a.value || '');
      });

      const qAnswers = survey.questions.map(q => answerMap[q.id] || '');
      return [
        idx + 1,
        resp.student_id || '',
        resp.full_name || '',
        ...qAnswers,
        new Date(resp.submitted_at).toLocaleString('vi-VN')
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kết quả');
    XLSX.writeFile(workbook, `Khao_sat_${survey.voucherNo || 'Detail'}.xlsx`);
  };

  const isFiltering = searchTerm !== '' || statusFilter !== 'all';

  // LỌC: Chỉ hiển thị các phiếu do user đó tạo
  const filteredSurveys = surveys.filter(item => {
    const createdByRaw = (item as any)?.created_by;
    const createdById = cleanVal(createdByRaw);

    const isOwner = Boolean(
      createdById && (
        userIds.has(createdById) ||
        (typeof createdByRaw === 'object' && (
          userIds.has(cleanVal(createdByRaw?._id)) ||
          userIds.has(cleanVal(createdByRaw?.user_id)) ||
          userIds.has(cleanVal(createdByRaw?.username)) ||
          userIds.has(cleanVal(createdByRaw?.student_id))
        ))
      )
    );

    if (!isOwner) return false;

    const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.voucherNo || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'locked' ? !!item.is_locked : !item.is_locked;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-black">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-[#0054a5] pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100 transition-transform hover:scale-105">
            <ClipboardList size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">
            Quản lý phiếu khảo sát
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedSurveyForBuilder('new')}
            className="flex items-center gap-2 bg-[#1d92ff] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-[#0054a5] transition-all active:scale-95 text-xs uppercase tracking-wider border-none outline-none cursor-pointer"
          >
            <Plus size={20} /> Thêm phiếu khảo sát
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1d92ff] focus:ring-1 focus:ring-[#1d92ff] transition-all font-bold"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 text-[#0054a5] font-bold text-sm">
              <Filter size={16} /> <span>Trạng thái:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 cursor-pointer text-black font-bold"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="open">Đang mở nhận bài</option>
              <option value="locked">Đã khóa nhận bài</option>
            </select>

            {isFiltering && (
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all active:rotate-180 duration-500 border-none bg-transparent outline-none cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center bg-white rounded-xl border border-gray-200">
          <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
        </div>
      ) : (
        <SurveyList
          surveys={filteredSurveys}
          onOpenBuilder={(survey) => setSelectedSurveyForBuilder(survey)}
          onToggleLock={handleToggleLock}
          onDelete={(survey) => setSurveyToDelete(survey)}
          onExportExcel={exportResponsesToExcel}
        />
      )}

      {selectedSurveyForBuilder && (
        <SurveyBuilderModal
          survey={selectedSurveyForBuilder === 'new' ? null : selectedSurveyForBuilder}
          currentUserId={currentUserId}
          onClose={() => setSelectedSurveyForBuilder(null)}
          onSaved={() => fetchSurveys(currentUserId)}
        />
      )}

      {surveyToDelete && (
        <ConfirmDeleteModal
          title={surveyToDelete.title}
          onClose={() => setSurveyToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}