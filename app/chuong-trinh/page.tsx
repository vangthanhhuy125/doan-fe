'use client';

import { useState } from "react";
import { 
  Calendar, Link as LinkIcon, FileText, DollarSign, 
  Award, Plus, Edit, Trash2, Eye, X 
} from "lucide-react";
import ProgramView from "./ProgramView";
import ProgramAdd from "./ProgramAdd";
import ConfirmDelete from "./ConfirmDelete";

const initialData = [
  {
    id: 1,
    name: "Chiến dịch Tình nguyện Mùa hè xanh 2026",
    time: "01/07 - 31/07",
    stakeholder: "Đoàn trường, Địa phương",
    linkTaiLieu: "#",
    linkKeHoach: "#",
    linkDTKP: "#",
    linkDRL: "#",
  },
  {
    id: 2,
    name: "Hội thao Sinh viên Khoa CNPM",
    time: "15/10 - 20/10",
    stakeholder: "Ban Thể thao Khoa",
    linkTaiLieu: "#",
    linkKeHoach: "#",
    linkDTKP: "#",
    linkDRL: "#",
  },
];

export default function ToChucPage() {
  const [data, setData] = useState(initialData);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const handleConfirmDelete = () => {
    if (deleteItem) {
      setData(data.filter(item => item.id !== deleteItem.id));
      setDeleteItem(null);
    }
  };

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-[#0054a5]" size={24} />
          <h2 className="text-xl font-bold uppercase text-[#0054a5]">Kế hoạch chương trình năm</h2>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-[#1d92ff] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-[#0054a5] transition-all active:scale-95"
        >
          <Plus size={20} /> Thêm chương trình
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0054a5] text-white text-[14px] font-bold">
            <tr>
              <th className="px-4 py-4 text-center uppercase w-12">STT</th>
              <th className="px-4 py-4 text-center">Tên chương trình</th>
              <th className="px-4 py-4 text-center">Thời gian</th>
              <th className="px-4 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="px-4 py-4 text-center font-bold text-gray-400">{index + 1}</td>
                <td className="px-4 py-4 font-bold text-[#0054a5]">{item.name}</td>
                <td className="px-4 py-4 text-center text-gray-600 font-medium">{item.time}</td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setViewItem(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Eye size={18} /></button>
                    <button className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"><Edit size={18} /></button>
                    <button onClick={() => setDeleteItem(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewItem && <ProgramView data={viewItem} onClose={() => setViewItem(null)} />}
      {isAddOpen && <ProgramAdd onClose={() => setIsAddOpen(false)} />}
      {deleteItem && (
        <ConfirmDelete 
          title={deleteItem.name}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}