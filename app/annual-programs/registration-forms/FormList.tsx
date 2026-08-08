'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Download, Edit, Trash2, Calendar } from 'lucide-react';
import { RegistrationForm } from './types';
import { exportRegistrationToExcel } from './utils/exportExcel';

interface Props {
  forms: RegistrationForm[];
  onSelectForm: (form: RegistrationForm) => void;
  onEditForm: (form: RegistrationForm) => void;
  onDeleteForm: (id: string) => void;
}

export default function FormList({ forms, onSelectForm, onEditForm, onDeleteForm }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user._id || user.user_id || user.id || '');
      } catch (e) {
        console.error('Lỗi đọc user:', e);
      }
    }
  }, []);

  const getFormId = (id: string | { $oid: string }): string => {
    if (typeof id === 'object' && id && '$oid' in id) {
      return id.$oid;
    }
    return String(id || '');
  };

  const filteredForms = forms.filter(f =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm phiếu đăng ký..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#1d92ff]"
          />
        </div>
        <span className="text-xs font-bold text-gray-500 uppercase">
          Tổng số: <strong className="text-[#0054a5]">{filteredForms.length}</strong> phiếu
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredForms.length > 0 ? (
          filteredForms.map((form) => {
            const formId = getFormId(form._id);
            const isCreator = !(form as any).created_by || (form as any).created_by === currentUserId;
            return (
              <div key={formId} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-[#0054a5]">{form.title}</h3>
                      {!isCreator && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">
                          Chỉ xem
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-600 leading-relaxed">{form.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSelectForm(form)}
                      className="flex items-center gap-1.5 bg-[#0054a5] hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer"
                    >
                      <Eye size={16} /> Theo dõi ({form.submissions.length})
                    </button>

                    <button
                      onClick={() => exportRegistrationToExcel(form)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer"
                    >
                      <Download size={16} /> Excel
                    </button>

                    {isCreator && (
                      <>
                        <button
                          onClick={() => onEditForm(form)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => onDeleteForm(formId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 font-bold gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#1d92ff]" />
                    <span>Ngày phát hành: {new Date(form.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-blue-50 text-[#0054a5] px-2.5 py-1 rounded-lg border border-blue-100">
                      {form.programs.length} Chương trình áp dụng
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                      {form.submissions.length} Sinh viên đã đăng ký
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-10 rounded-2xl text-center text-gray-400 italic font-bold border border-gray-200">
            Không tìm thấy phiếu đăng ký nào.
          </div>
        )}
      </div>
    </div>
  );
}