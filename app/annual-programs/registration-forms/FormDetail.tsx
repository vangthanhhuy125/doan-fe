'use client';

import { Download, Edit, Trash2, Users, CheckCircle2, Calendar } from 'lucide-react';
import { RegistrationForm, ProgramConfig } from './types';
import { exportRegistrationToExcel } from './utils/exportExcel';

interface Props {
  form: RegistrationForm;
  onEditForm: (form: RegistrationForm) => void;
  onDeleteForm: (id: string) => void;
}

export default function FormDetail({ form, onEditForm, onDeleteForm }: Props) {
  const getFormId = (id: string | { $oid: string }): string => {
    if (typeof id === 'object' && id && '$oid' in id) {
      return id.$oid;
    }
    return String(id || '');
  };

  const getDepartmentStats = (programId: string, deptName: string) => {
    return form.submissions.filter(sub => sub.choices[programId] === deptName).length;
  };

  return (
    <div className="space-y-6">
      {/* THÔNG TIN PHIẾU & ACTION BAR */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#0054a5]">{form.title}</h3>
            <p className="text-xs text-gray-600 font-medium">{form.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportRegistrationToExcel(form)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer"
            >
              <Download size={16} /> Xuất Excel
            </button>

            <button
              onClick={() => onEditForm(form)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer"
            >
              <Edit size={16} /> Chỉnh sửa phiếu
            </button>

            <button
              onClick={() => onDeleteForm(getFormId(form._id))}
              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* CÁC THẺ THỐNG KÊ NHANH */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-3">
            <div className="p-3 bg-[#0054a5] text-white rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500">Tổng lượt đăng ký</p>
              <p className="text-xl font-black text-[#0054a5]">{form.submissions.length} sinh viên</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500">Số chương trình</p>
              <p className="text-xl font-black text-emerald-700">{form.programs.length} hoạt động</p>
            </div>
          </div>

          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center gap-3">
            <div className="p-3 bg-purple-600 text-white rounded-xl">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500">Ngày tạo phiếu</p>
              <p className="text-sm font-bold text-purple-900">{new Date(form.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* THỐNG KÊ TỶ LỆ DẠNG PROGRESS BAR */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-[#0054a5] uppercase tracking-wider">
          Thống kê lượt đăng ký từng Ban theo Chương trình
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.programs.map((prog) => (
            <div key={prog.program_id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="border-b border-gray-100 pb-2">
                <h5 className="font-black text-slate-800 text-sm">{prog.program_name}</h5>
                {prog.description && <p className="text-[11px] text-gray-500 italic truncate">{prog.description}</p>}
              </div>

              <div className="space-y-2">
                {prog.departments.map((dept) => {
                  const count = getDepartmentStats(prog.program_id, dept);
                  const percent = form.submissions.length > 0 
                    ? Math.round((count / form.submissions.length) * 100) 
                    : 0;

                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-700">{dept}</span>
                        <span className="text-[#0054a5]">{count} người ({percent}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-[#1d92ff] h-2 rounded-full transition-all" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BẢNG DANH SÁCH CHI TIẾT ĐÃ TỐI ƯU GIAO DIỆN */}
      <div className="space-y-3">
        <h4 className="text-sm font-black text-[#0054a5] uppercase tracking-wider">
          Danh sách chi tiết sinh viên đăng ký ({form.submissions.length})
        </h4>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#0054a5] text-white text-[13px] font-bold">
              <tr>
                <th className="px-4 py-4 text-center w-12">STT</th>
                <th className="px-4 py-4 text-center w-28">MSSV</th>
                <th className="px-4 py-4 text-left w-48">Họ và Tên</th>
                <th className="px-4 py-4 text-center w-28">Lớp</th>
                <th className="px-4 py-4 text-left">Nguyện vọng / Ban đăng ký</th>
                <th className="px-4 py-4 text-center w-36">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {form.submissions.length > 0 ? (
                form.submissions.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-[#0054a5]">{sub.student_id}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">{sub.full_name}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-gray-600">{sub.class_name}</td>
                    
                    {/* CỘT NGUYỆN VỌNG GỘP GỌN GÀNG VÀ DỄ NHÌN */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        {form.programs.map((prog: ProgramConfig) => {
                          const dept = sub.choices?.[prog.program_id];
                          if (!dept) return null;

                          return (
                            <div key={prog.program_id} className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-slate-700 min-w-[140px] truncate">
                                • {prog.program_name}:
                              </span>
                              <span className="bg-blue-50 text-[#0054a5] px-2.5 py-0.5 rounded-md font-bold border border-blue-100">
                                {dept}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">
                      {sub.submitted_at}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 italic font-bold">
                    Chưa có sinh viên nào đăng ký phiếu này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}