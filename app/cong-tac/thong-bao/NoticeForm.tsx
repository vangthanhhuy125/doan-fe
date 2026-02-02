'use client';

import { X, Bell } from "lucide-react";
import { useState } from "react";

interface NoticeFormProps {
  data?: any;
  onClose: () => void;
  onSave: (item: any) => void;
}

export default function NoticeForm({ data, onClose, onSave }: NoticeFormProps) {
  const [formData, setFormData] = useState(data || { 
    title: "", 
    content: "", 
    posted_at: new Date().toISOString() 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-2xl rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 max-h-[85vh] flex flex-col">
        <div className={`p-4 sm:p-6 flex items-center justify-between text-white shrink-0 ${data ? 'bg-amber-500' : 'bg-[#1d92ff]'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg hidden sm:block"><Bell size={20} /></div>
            <h3 className="font-bold uppercase tracking-widest text-xs sm:text-sm">{data ? 'Cập nhật thông báo' : 'Soạn thông báo mới'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white outline-none"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Tiêu đề thông báo</label>
              <input 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-sm text-black" 
                placeholder="Nhập tiêu đề..." 
              />
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Nội dung chi tiết</label>
              <textarea 
                required
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full flex-1 min-h-[150px] sm:min-h-[200px] p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-sm text-black resize-none leading-relaxed" 
                placeholder="Nhập nội dung triển khai..." 
              />
            </div>
          </div>

          <div className="p-4 sm:px-8 sm:pb-8 flex justify-end gap-3 bg-white border-t border-gray-50 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all uppercase text-[10px] sm:text-[11px] border-none bg-transparent outline-none"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className={`px-8 sm:px-10 py-2 sm:py-3 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg transition-all uppercase text-[10px] sm:text-[11px] border-none outline-none ${data ? 'bg-amber-500 shadow-amber-100 hover:bg-amber-600' : 'bg-[#1d92ff] shadow-blue-100 hover:bg-blue-600'}`}
            >
              {data ? 'Cập nhật' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}