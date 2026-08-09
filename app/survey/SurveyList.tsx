'use client';

import { Edit, Trash2, FileSpreadsheet, Lock, Unlock, Calendar, Clock, HelpCircle, Users } from 'lucide-react';
import { SurveyForm } from './types';

interface Props {
  surveys: SurveyForm[];
  onOpenBuilder: (survey: SurveyForm) => void;
  onToggleLock: (survey: SurveyForm) => void;
  onDelete: (survey: SurveyForm) => void;
  onExportExcel: (survey: SurveyForm) => void;
}

export default function SurveyList({ surveys, onOpenBuilder, onToggleLock, onDelete, onExportExcel }: Props) {
  if (surveys.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-400 font-medium italic">
        Không tìm thấy phiếu khảo sát nào phù hợp.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {surveys.map((item) => {
        const isLocked = !!item.is_locked;
        const questionCount = item.questions?.length || 0;
        const responseCount = item.responses?.length || 0;

        return (
          <div
            key={item._id}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3 hover:border-[#0054a5]/40 transition-all text-black"
          >
            {/* HÀNG DƯỚI/TRÊN: TIÊU ĐỀ, MÔ TẢ & CỤM NÚT THAO TÁC */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Mã phiếu voucherNo */}
                  <span className="bg-blue-50 text-[#0054a5] font-black text-xs px-2.5 py-0.5 rounded-md border border-blue-200">
                    {item.voucherNo || 'KS-2026'}
                  </span>

                  {/* Tiêu đề phiếu */}
                  <h3
                    onClick={() => onOpenBuilder(item)}
                    className="font-bold text-gray-800 text-base hover:text-[#0054a5] cursor-pointer transition-colors"
                  >
                    {item.title}
                  </h3>

                  {/* Badge Trạng thái */}
                  {isLocked ? (
                    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-rose-200">
                      <Lock size={12} /> Đã khóa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-200">
                      <Clock size={12} /> Đang mở
                    </span>
                  )}
                </div>

                {/* Mô tả phiếu */}
                {item.description && (
                  <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* CỤM NÚT THAO TÁC TRỰC QUAN */}
              <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => onOpenBuilder(item)}
                  className="flex items-center gap-1.5 bg-[#0054a5] hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all border-none cursor-pointer active:scale-95"
                >
                  <Edit size={14} />
                  <span>Sửa biểu mẫu</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleLock(item)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                    isLocked 
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={isLocked ? 'Mở nhận phản hồi' : 'Khóa nhận phản hồi'}
                >
                  {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                  <span className="hidden sm:inline">{isLocked ? 'Mở khóa' : 'Khóa'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onExportExcel(item)}
                  className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-emerald-200 cursor-pointer"
                  title="Xuất file Excel"
                >
                  <FileSpreadsheet size={14} />
                  <span className="hidden sm:inline">Xuất Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                  title="Xóa phiếu"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* HÀNG DƯỚI: THÔNG TIN PHỤ (THỜI GIAN & SỐ LƯỢNG) */}
            <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 font-medium pt-0.5 gap-2">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#0054a5]" />
                <span>Ngày tạo: {new Date(item.created_at || Date.now()).toLocaleDateString('vi-VN')}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <HelpCircle size={14} className="text-gray-400" />
                  <span><strong>{questionCount}</strong> câu hỏi</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} className="text-emerald-600" />
                  <span className="text-emerald-600 font-bold"><strong>{responseCount}</strong> lượt phản hồi</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}