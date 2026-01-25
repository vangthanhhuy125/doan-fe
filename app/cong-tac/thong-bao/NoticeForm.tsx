'use client';

import { X, Save, Bell } from "lucide-react";
import { useState } from "react";

interface NoticeFormProps {
  data?: any;
  onClose: () => void;
  onSave: (item: any) => void;
}

export default function NoticeForm({ data, onClose, onSave }: NoticeFormProps) {
  const [formData, setFormData] = useState(data || { title: "", content: "", date: new Date().toLocaleDateString('vi-VN') });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className={`p-6 flex items-center justify-between text-white ${data ? 'bg-amber-500' : 'bg-[#1d92ff]'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Bell size={20} /></div>
            <h3 className="font-bold uppercase tracking-widest text-sm">{data ? 'Cập nhật thông báo' : 'Soạn thông báo mới'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Tiêu đề thông báo</label>
            <input 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-sm text-black" 
              placeholder="Nhập tiêu đề..." 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Nội dung chi tiết</label>
            <textarea 
              required
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-sm text-black" 
              placeholder="Nhập nội dung triển khai..." 
            />
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all uppercase text-[11px]">Hủy bỏ</button>
            <button type="submit" className={`px-10 py-3 text-white rounded-2xl font-bold shadow-lg transition-all uppercase text-[11px] ${data ? 'bg-amber-500 shadow-amber-100' : 'bg-[#1d92ff] shadow-blue-100'}`}>
              {data ? 'Cập nhật' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}