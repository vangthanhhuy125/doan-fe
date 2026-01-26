'use client';

import { useState } from "react";
import { Bell, Eye, Edit, Trash2, Plus, Calendar, X, Search, Filter } from "lucide-react";
import NoticeForm from "./NoticeForm";
import ConfirmNoticeDelete from "./ConfirmNoticeDelete";

const initialNotices = [
  { 
    id: 1, 
    title: "Thông báo về việc đóng Đoàn phí học kỳ 2 năm 2025-2026", 
    date: "20/01/2026", 
    content: "Yêu cầu các Chi đoàn thực hiện thu Đoàn phí học kỳ 2. Mức thu: 20.000đ/Đoàn viên. Thời hạn nộp về văn phòng Đoàn khoa: Trước ngày 15/02/2026. Các đồng chí Bí thư Chi đoàn lưu ý nộp kèm danh sách trích ngang có ký xác nhận." 
  },
  { 
    id: 2, 
    title: "Kế hoạch tổ chức Hội trại Tòng quân năm 2026", 
    date: "15/01/2026", 
    content: "Triển khai kế hoạch tham gia Hội trại tòng quân. Nội dung bao gồm: Trang trí lều trại, tổ chức trò chơi vận động và đêm lửa trại giao lưu. Thành phần: Đoàn viên thanh niên các khối lớp cuối. Thời gian tập trung: 07h00 ngày 05/02/2026." 
  },
  { 
    id: 3, 
    title: "Triệu tập tham gia Chiến dịch Xuân Tình nguyện 2026", 
    date: "10/01/2026", 
    content: "Đoàn khoa triệu tập các chiến sĩ đã đăng ký tham gia Chiến dịch Xuân Tình nguyện tham gia buổi tập huấn kỹ năng tổ chức trò chơi trẻ em và kỹ năng sơ cấp cứu. Địa điểm: Hội trường B. Thời gian: 08h30 Chủ nhật tuần này." 
  },
  { 
    id: 4, 
    title: "Danh sách Đoàn viên ưu tú tham gia lớp bồi dưỡng nhận thức về Đảng", 
    date: "05/01/2026", 
    content: "Căn cứ vào kết quả rèn luyện năm học qua, Đoàn khoa gửi danh sách 10 đồng chí Đoàn viên ưu tú đủ điều kiện tham gia lớp bồi dưỡng nhận thức về Đảng khóa I/2026. Các đồng chí có tên trong danh sách chuẩn bị hồ sơ và ảnh thẻ 3x4 để làm thẻ học viên." 
  }
];

export default function NotificationPage() {
  const [notices, setNotices] = useState(initialNotices);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [formMode, setFormMode] = useState<{ open: boolean, data: any }>({ open: false, data: null });
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSave = (item: any) => {
    if (item.id) {
      setNotices(notices.map(n => n.id === item.id ? item : n));
    } else {
      setNotices([{ ...item, id: Date.now(), date: new Date().toLocaleDateString('vi-VN') }, ...notices]);
    }
  };

  const confirmDelete = () => {
    setNotices(notices.filter(n => n.id !== deleteItem.id));
    setDeleteItem(null);
  };

  const filteredNotices = notices.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const [day, month, year] = item.date.split('/').map(Number);
    const itemDate = new Date(year, month - 1, day);
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const matchesDate = (!start || itemDate >= start) && (!end || itemDate <= end);
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100">
             <Bell size={24} />
          </div>
          <h2 className="font-bold text-[#0054a5] tracking-tight uppercase text-sm">Thông báo - Triển khai - Triệu tập</h2>
        </div>
        <button 
          onClick={() => setFormMode({ open: true, data: null })}
          className="flex items-center gap-2 bg-[#1d92ff] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-[#0054a5] transition-all active:scale-95"
        >
          <Plus size={20} /> Soạn thông báo
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
            {(searchTerm || startDate || endDate) && (
              <button 
                onClick={() => {setSearchTerm(""); setStartDate(""); setEndDate("");}}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Xóa lọc"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-xl bg-white">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#0054a5] text-white font-bold text-xm tracking-widest">
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
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-5 text-center font-bold text-gray-400 group-hover:text-[#0054a5] transition-colors">{index + 1}</td>
                  <td className="px-6 py-5 font-bold text-slate-700 group-hover:text-[#0054a5] transition-colors line-clamp-1">{item.title}</td>
                  <td className="px-6 py-5 text-center text-gray-500 text-xs font-medium italic">{item.date}</td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelectedNotice(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all" title="Xem chi tiết"><Eye size={18} /></button>
                      <button onClick={() => setFormMode({ open: true, data: item })} className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl transition-all" title="Chỉnh sửa"><Edit size={18} /></button>
                      <button onClick={() => setDeleteItem(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all" title="Xóa"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">Không tìm thấy thông báo nào phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-[#0054a5] p-6 flex items-center justify-between text-white">
              <h3 className="font-bold uppercase tracking-widest text-sm">Nội dung chi tiết</h3>
              <button onClick={() => setSelectedNotice(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-10 space-y-6">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                <Calendar size={12}/> Ngày đăng: {selectedNotice.date}
              </div>
              <h2 className="text-2xl font-black text-[#0054a5] leading-tight">{selectedNotice.title}</h2>
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap italic shadow-inner">
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