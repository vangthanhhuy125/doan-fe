import { X, Link as LinkIcon, FileText, DollarSign, Award, Calendar } from "lucide-react";

interface ProgramViewProps {
  data: any;
  onClose: () => void;
}

export default function ProgramView({ data, onClose }: ProgramViewProps) {
  if (!data) return null;

  const LinkBox = ({ label, icon, href, colorClass }: any) => (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase text-gray-400">{label}</p>
      <a 
        href={href} 
        target="_blank" 
        className={`flex items-center gap-2 p-3 rounded-xl border border-transparent ${colorClass} transition-all hover:scale-[1.02] active:scale-95 shadow-sm`}
      >
        {icon}
        <span className="text-xs font-bold truncate">Xem tài liệu chi tiết</span>
      </a>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-[#0054a5] p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><FileText size={20} /></div>
            <h3 className="font-bold uppercase tracking-widest text-sm text-white">Thông tin chi tiết</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-tighter">Tên chương trình</p>
            <h2 className="text-xl font-black text-[#0054a5] leading-tight">{data.name}</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#0054a5] font-bold text-[10px] uppercase border-b border-slate-100 pb-1">
              <Calendar size={12} /> Phân loại thời gian
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-slate-50 p-4 rounded-2xl">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-gray-400">Tháng / Năm</p>
                <p className="font-bold text-gray-700 text-sm">{data.month} / {data.year}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-gray-400">Học kỳ / Năm học</p>
                <p className="font-bold text-gray-700 text-sm">{data.semester} - {data.academicYear}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-gray-400">Stakeholder</p>
            <p className="font-semibold text-gray-700">{data.stakeholder}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
            <LinkBox label="Tài liệu" icon={<LinkIcon size={16}/>} href={data.linkTaiLieu} colorClass="bg-blue-50 text-blue-600 border-blue-100" />
            <LinkBox label="Kế hoạch" icon={<FileText size={16}/>} href={data.linkKeHoach} colorClass="bg-emerald-50 text-emerald-600 border-emerald-100" />
            <LinkBox label="Dự trù kinh phí" icon={<DollarSign size={16}/>} href={data.linkDTKP} colorClass="bg-amber-50 text-amber-600 border-amber-100" />
            <LinkBox label="Danh sách ĐRL" icon={<Award size={16}/>} href={data.linkDRL} colorClass="bg-purple-50 text-purple-600 border-purple-100" />
          </div>
        </div>
      </div>
    </div>
  );
}