'use client';

import { UserCheck, Edit, Trash2, Plus } from "lucide-react";

export default function MemberList({ title, icon, data, colorClass, iconClass, onAdd, onEdit, onDelete }: any) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1">
      <div className={`${colorClass} p-4 flex items-center gap-2 text-white`}>
        {icon}
        <h3 className="font-bold uppercase text-xs tracking-wider">{title}</h3>
        <button onClick={onAdd} className="ml-auto bg-white/20 p-1.5 rounded-lg hover:bg-white/30 transition-all"><Plus size={16}/></button>
      </div>
      <div className="p-5 space-y-3">
        {data.length > 0 ? data.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass} font-bold text-xs shadow-sm`}>
                {item.name.split(' ').pop()?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">{item.mssv} • {item.chiDoan}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(item)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit size={14}/></button>
              <button onClick={() => onDelete(item)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
            </div>
          </div>
        )) : <p className="text-center py-10 text-xs text-slate-400 italic">Chưa có danh sách</p>}
      </div>
    </div>
  );
}