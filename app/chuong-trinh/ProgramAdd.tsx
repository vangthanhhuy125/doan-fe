import { X, Save, Link as LinkIcon, FileText, DollarSign, Award } from "lucide-react";

interface ProgramAddProps {
  onClose: () => void;
}

export default function ProgramAdd({ onClose }: ProgramAddProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-[#1d92ff] p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Save size={20} /></div>
            <h3 className="font-bold uppercase tracking-widest text-sm">Thêm chương trình năm</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Tên chương trình</label>
              <input className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-[#1d92ff] transition-all outline-none font-bold text-sm" placeholder="Nhập tên chương trình..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Thời gian thực hiện</label>
              <input className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-[#1d92ff] transition-all outline-none font-bold text-sm" placeholder="VD: 01/01 - 31/01" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Stakeholder (Cá nhân/Tổ chức phối hợp)</label>
            <input className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-[#1d92ff] transition-all outline-none font-bold text-sm" placeholder="VD: Đoàn trường, Khoa CNPM..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-blue-500 flex items-center gap-1"><LinkIcon size={12}/> Link Tài liệu</label>
              <input className="w-full p-3 bg-blue-50/50 rounded-xl border border-blue-100 outline-none text-xs focus:bg-white" placeholder="https://drive.google.com/..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1"><FileText size={12}/> Link Kế hoạch</label>
              <input className="w-full p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 outline-none text-xs focus:bg-white" placeholder="https://drive.google.com/..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-amber-500 flex items-center gap-1"><DollarSign size={12}/> Link Dự trù KP</label>
              <input className="w-full p-3 bg-amber-50/50 rounded-xl border border-amber-100 outline-none text-xs focus:bg-white" placeholder="https://drive.google.com/..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-purple-500 flex items-center gap-1"><Award size={12}/> Link Danh sách ĐRL</label>
              <input className="w-full p-3 bg-purple-50/50 rounded-xl border border-purple-100 outline-none text-xs focus:bg-white" placeholder="https://drive.google.com/..." />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all uppercase text-xs tracking-widest">Hủy bỏ</button>
            <button type="submit" className="px-10 py-3 bg-[#1d92ff] text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-[#0054a5] transition-all uppercase text-xs tracking-widest">Lưu dữ liệu</button>
          </div>
        </form>
      </div>
    </div>
  );
}