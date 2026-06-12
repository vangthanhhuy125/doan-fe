'use client';

import { useState, useEffect } from "react";
import { Bell, Eye, Edit, Trash2, Plus, Calendar, X, Search, RotateCcw } from "lucide-react";
import NoticeForm from "./NoticeForm";
import ConfirmNoticeDelete from "./ConfirmNoticeDelete";

export default function NotificationPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [formMode, setFormMode] = useState<{ open: boolean, data: any }>({ open: false, data: null });
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchNotices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements`);
      const data = await res.json();
      setNotices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSave = async (item: any) => {
    try {
      const isEdit = !!item._id;
      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_URL}/announcements/${item._id}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/announcements`;
      
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        await fetchNotices();
        setFormMode({ open: false, data: null });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements/${deleteItem._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchNotices();
        setDeleteItem(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  const isFiltering = searchTerm !== "" || startDate !== "" || endDate !== "";

  const filteredNotices = notices.filter(item => {
    const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const itemDate = new Date(item.posted_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);
    const matchesDate = (!start || itemDate >= start) && (!end || itemDate <= end);
    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b-2 border-[#0054a5] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100 transition-transform hover:scale-105">
             <Bell size={24} />
          </div>
          <h2 className="font-black text-[#0054a5] tracking-tight uppercase text-2xl">Thông báo - Triển khai - Triệu tập</h2>
        </div>
        <button 
          onClick={() => setFormMode({ open: true, data: null })}
          className="flex items-center gap-2 bg-[#0054a5] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-[10px] uppercase tracking-widest border-none outline-none"
        >
          <Plus size={16} /> Soạn thông báo
        </button>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-1 md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tiêu đề..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 whitespace-nowrap">Từ ngày</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 whitespace-nowrap">Đến ngày</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:border-blue-500"
              />
            </div>
            {isFiltering && (
              <button 
                onClick={resetFilters}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all active:rotate-180 duration-500 border-none bg-transparent outline-none"
              >
                <RotateCcw size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-xl bg-white">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#0054a5] text-white font-bold text-[13px] tracking-widest">
            <tr>
              <th className="px-6 py-5 text-center uppercase w-16">STT</th>
              <th className="px-6 py-5 text-center">Nội dung thông báo</th>
              <th className="px-6 py-5 text-center w-40">Ngày đăng</th>
              <th className="px-6 py-5 text-center w-40">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredNotices.length > 0 ? (
              filteredNotices.map((item, index) => (
                <tr key={item._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-5 text-center font-bold text-gray-400 group-hover:text-[#0054a5] transition-colors">{index + 1}</td>
                  <td className="px-6 py-5 font-bold text-slate-700 group-hover:text-[#0054a5] transition-colors truncate max-w-md">{item.title}</td>
                  <td className="px-6 py-5 text-center text-gray-500 text-xs font-medium italic">{new Date(item.posted_at).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelectedNotice(item)} className="p-2 text-[#0054a5] hover:bg-blue-100 rounded-xl transition-all border-none outline-none"><Eye size={18} /></button>
                      <button onClick={() => setFormMode({ open: true, data: item })} className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl transition-all border-none outline-none"><Edit size={18} /></button>
                      <button onClick={() => setDeleteItem(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all border-none outline-none"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic font-bold">Không tìm thấy thông báo nào phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 max-h-[85vh] flex flex-col">
            <div className="bg-[#0054a5] p-6 flex items-center justify-between text-white shrink-0">
              <h3 className="font-bold uppercase tracking-widest text-sm">Nội dung chi tiết</h3>
              <button onClick={() => setSelectedNotice(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white outline-none"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-black custom-scrollbar">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                <Calendar size={12}/> Ngày đăng: {new Date(selectedNotice.posted_at).toLocaleDateString('vi-VN')}
              </div>
              <h2 className="text-2xl font-black text-[#0054a5] leading-tight">{selectedNotice.title}</h2>
              <div className="p-6 sm:p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap italic shadow-inner">
                {selectedNotice.content}
              </div>
            </div>
          </div>
        </div>
      )}

      {formMode.open && (
        <NoticeForm 
          data={formMode.data} 
          onClose={() => setFormMode({ open: false, data: null })} 
          onSave={handleSave} 
        />
      )}

      {deleteItem && (
        <ConfirmNoticeDelete 
          title={deleteItem.title} 
          onClose={() => setDeleteItem(null)} 
          onConfirm={confirmDelete} 
        />
      )}
    </div>
  );
}