'use client';

import { Edit, X, Save } from "lucide-react";

interface UpdateBCHModalProps {
  onClose: () => void;
  allMembers: any[];
}

export default function UpdateBCHModal({ onClose, allMembers }: UpdateBCHModalProps) {
  const fixedRoles = [
    "Bí thư Đoàn khoa",
    "Phó Bí thư Đoàn khoa",
    "Ủy viên Ban Thường vụ",
    "Ủy viên Ban Thường vụ",
    "Ủy viên Ban Thường vụ",
    ...Array(10).fill("Ủy viên Ban Chấp hành")
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#0054a5] p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Edit size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Cập nhật Ban Chấp hành</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[14px] font-black text-center text-slate-400 border-b">
                <th className="pb-3 pl-2 text-left">Chức vụ</th>
                <th className="pb-3">Họ và tên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fixedRoles.map((role, idx) => (
                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 pl-2 text-xs font-bold text-slate-500 uppercase tracking-tighter w-1/3">
                    {role}
                  </td>
                  <td className="py-2 pr-2">
                    <select className="w-full p-2 bg-slate-50 border border-transparent rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all">
                      <option value="">-- Chọn nhân sự --</option>
                      {allMembers.map((m: any, i: number) => (
                        <option key={i} value={m.name}>{m.name} - {m.chiDoan}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest text-black">
            Hủy bỏ
          </button>
          <button className="px-10 py-3 bg-[#0054a5] text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-800 transition-all uppercase text-[10px] tracking-widest flex items-center gap-2">
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
}