'use client';

import { useState, useRef, useEffect } from "react";
import { X, Users, AlertCircle, PlusCircle, FileEdit, AlignLeft, ListOrdered } from "lucide-react";

interface Props {
  mode: 'add' | 'edit' | 'delete';
  data?: any;
  onClose: () => void;
  onConfirmDelete: (id: string | number) => void;
  onSave: (payload: any) => void;
}

export default function GroupsModal({ mode, data, onClose, onConfirmDelete, onSave }: Props) {
  const isAdd = mode === 'add';
  const isDelete = mode === 'delete';
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState(data?.name || "");
  const [description, setDescription] = useState(data?.description || "");
  const [order, setOrder] = useState<number | string>(data?.order ?? 1);

  useEffect(() => {
    setName(data?.name || "");
    setDescription(data?.description || "");
    setOrder(data?.order ?? 1);
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...data,
      name,
      description,
      order: Number(order) || 1,
    };
    onSave(payload);
  };

  if (isDelete) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-black">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-red-100 animate-in zoom-in duration-300">
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Xác nhận xóa?</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-4">
                Bạn có chắc chắn muốn xóa nhóm quyền <br/>
                <span className="font-bold text-red-600">"{data?.name}"</span>?
              </p>
            </div>
          </div>
          <div className="flex p-4 gap-3 bg-slate-50">
            <button 
              type="button"
              onClick={onClose} 
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase text-[11px] tracking-widest border-none outline-none cursor-pointer"
            >
              Hủy
            </button>
            <button 
              type="button"
              onClick={() => { onConfirmDelete(data?._id || data?.id); onClose(); }} 
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg hover:bg-red-700 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 border-none outline-none cursor-pointer"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    );
  }

  const headerBg = isAdd ? "bg-[#0054a5]" : "bg-[#f59e0b]";
  const btnBg = isAdd ? "bg-[#0054a5] hover:bg-[#004080]" : "bg-[#f59e0b] hover:bg-[#d97706]";
  const ringColor = isAdd ? "focus:border-[#0054a5]" : "focus:border-[#f59e0b]";
  const labelColor = isAdd ? "text-[#0054a5]" : "text-[#f59e0b]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
        <div className={`${headerBg} p-6 flex items-center justify-between text-white transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isAdd ? <PlusCircle size={20} /> : <FileEdit size={20} />}
            </div>
            <h3 className="font-bold uppercase tracking-widest text-sm">
              {isAdd ? 'Thêm nhóm người dùng mới' : 'Chỉnh sửa nhóm người dùng'}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} className="p-8 space-y-6 overflow-y-auto max-h-[85vh]" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Tên nhóm người dùng</label>
            <div className="relative">
              <input 
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-bold ${ringColor}`} 
                placeholder="VD: BTV Đoàn khoa - Thường trực LCH khoa" 
              />
              <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Thứ tự hiển thị</label>
            <div className="relative">
              <input 
                required
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-bold ${ringColor}`} 
                placeholder="Nhập số thứ tự (VD: 1, 2, 3...)" 
              />
              <ListOrdered size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Mô tả chức năng</label>
            <div className="relative">
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-semibold resize-none ${ringColor}`} 
                placeholder="Mô tả công việc và phạm vi của nhóm..." 
              />
              <AlignLeft size={18} className="absolute left-4 top-5 text-gray-400" />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-xs tracking-widest uppercase border-none outline-none cursor-pointer"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className={`px-10 py-3 ${btnBg} text-white rounded-2xl font-bold shadow-lg transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 border-none outline-none cursor-pointer`}
            >
              {isAdd ? 'Tạo nhóm' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}