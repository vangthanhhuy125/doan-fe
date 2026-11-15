'use client';

import { useState, useRef } from "react";
import { Plus, Trash2, Camera, ChevronLeft, ChevronRight } from "lucide-react";

interface AchievementsTabProps {
  achievements: any[];
  setAchievements: (val: any[]) => void;
  academicYears: string[];
}

const ITEMS_PER_PAGE = 10;

export default function AchievementsTab({
  achievements,
  setAchievements,
  academicYears,
}: AchievementsTabProps) {
  const [pageAchievements, setPageAchievements] = useState(1);
  const fileInputRefs = useRef<any>([]);

  const handleAchievementChange = (globalIndex: number, field: string, value: string) => {
    const updated = [...achievements];
    updated[globalIndex][field] = value;
    setAchievements(updated);
  };

  const handleAchievementImage = (globalIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...achievements];
        updated[globalIndex].image = reader.result as string;
        setAchievements(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAchievement = () => {
    setPageAchievements(Math.ceil((achievements.length + 1) / ITEMS_PER_PAGE) || 1);
    setAchievements([...achievements, { academicYear: academicYears[0] || "", image: "", content: "" }]);
  };

  const handleRemoveAchievement = (globalIndex: number) => {
    const updatedLength = achievements.length - 1;
    if (updatedLength > 0 && (pageAchievements - 1) * ITEMS_PER_PAGE >= updatedLength) {
      setPageAchievements(pageAchievements - 1);
    }
    setAchievements(achievements.filter((_, i) => i !== globalIndex));
  };

  const totalPages = Math.ceil(achievements.length / ITEMS_PER_PAGE);
  const paginatedAchievements = achievements.slice(
    (pageAchievements - 1) * ITEMS_PER_PAGE,
    pageAchievements * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-xs font-black uppercase text-purple-600 tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-600 rounded-full"></span> Thành tích đạt được qua các năm ({achievements.length})
        </h3>
        <button type="button" onClick={handleAddAchievement} className="text-[10px] font-bold uppercase bg-purple-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 border-none outline-none active:scale-95 transition-all cursor-pointer">
          <Plus size={12}/> Thêm thành tích
        </button>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {paginatedAchievements.map((item, idx) => {
          const globalIndex = (pageAchievements - 1) * ITEMS_PER_PAGE + idx;
          return (
            <div key={globalIndex} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-5 items-start relative group animate-in fade-in duration-200">
              <span className="absolute top-4 left-4 w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-700 text-[10px] font-black rounded-lg">{globalIndex + 1}</span>
              
              <div className="w-full md:w-48 space-y-2 pt-6 md:pt-0">
                <label className="text-[10px] font-bold text-gray-400 uppercase block ml-1">Hình ảnh minh họa</label>
                <div 
                  onClick={() => fileInputRefs.current[globalIndex]?.click()}
                  className="w-full h-32 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-400 cursor-pointer flex flex-col items-center justify-center overflow-hidden relative shadow-inner group-hover:bg-purple-50/10 transition-all"
                >
                  {item.image ? (
                    <img src={item.image} alt="Achievement" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400 space-y-1 p-2">
                      <Camera size={20} className="mx-auto" />
                      <span className="text-[9px] font-bold block">Tải hình ảnh lên...</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={el => { fileInputRefs.current[globalIndex] = el; }} onChange={(e) => handleAchievementImage(globalIndex, e)} className="hidden" />
                </div>
              </div>

              <div className="flex-1 w-full space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block ml-1">Năm học vinh danh</label>
                    <select 
                      value={item.academicYear || ""} 
                      onChange={(e) => handleAchievementChange(globalIndex, "academicYear", e.target.value)}
                      required
                      className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="">-- Chọn năm học --</option>
                      {academicYears.filter(Boolean).map((yr, yIdx) => (
                        <option key={yIdx} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block ml-1">Nội dung thành tích đạt được</label>
                  <textarea 
                    rows={4} 
                    value={item.content || ""} 
                    onChange={(e) => handleAchievementChange(globalIndex, "content", e.target.value)}
                    required
                    placeholder="Nhập chi tiết cụ thể thành tích xuất sắc, giải thưởng, phong trào đạt được trong niên khóa này..."
                    className="w-full p-3 bg-white border rounded-xl text-xs font-medium outline-none focus:border-purple-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
              <button type="button" onClick={() => handleRemoveAchievement(globalIndex)} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-xl border-none outline-none cursor-pointer"><Trash2 size={16}/></button>
            </div>
          );
        })}

        {achievements.length === 0 && (
          <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs italic font-medium">
            Chưa có thành tích nào được thêm. Nhấn "+ Thêm thành tích" để tạo mới.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
          <span className="text-[11px] font-semibold text-slate-400">
            Hiển thị {(pageAchievements - 1) * ITEMS_PER_PAGE + 1}–{Math.min(pageAchievements * ITEMS_PER_PAGE, achievements.length)} / {achievements.length} mục
          </span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={pageAchievements === 1} onClick={() => setPageAchievements(pageAchievements - 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-purple-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer bg-white">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold text-slate-600">Trang {pageAchievements}/{totalPages}</span>
            <button type="button" disabled={pageAchievements === totalPages} onClick={() => setPageAchievements(pageAchievements + 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-purple-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer bg-white">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}