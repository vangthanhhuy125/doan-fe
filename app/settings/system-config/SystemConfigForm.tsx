'use client';

import { useState, useEffect, useRef } from "react";
import { 
  Settings, Save, Plus, Trash2, MapPin, Mail, Facebook, 
  ChevronLeft, ChevronRight, Camera, UserCheck, Search, ShieldCheck, FileCheck2 
} from "lucide-react";

interface SystemConfigFormProps {
  initialData: any;
  onSave: (data: any) => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

export default function SystemConfigForm({ initialData, onSave }: SystemConfigFormProps) {
  const [years, setYears] = useState<string[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [classBranches, setClassBranches] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  
  // 🟢 MỤC 7: Danh sách tài khoản được quyền tạo & quản lý phiếu
  const [formManagers, setFormManagers] = useState<any[]>([]);
  const [accountsList, setAccountsList] = useState<any[]>([]);
  const [searchAccount, setSearchAccount] = useState("");
  const [isOpenAccDropdown, setIsOpenAccDropdown] = useState(false);
  const accDropdownRef = useRef<HTMLDivElement>(null);

  const [contact, setContact] = useState<any>({
    address: "", email: "", fanpage: "", introduction: "", mission: "", vocation: "", structure: "", softwareIntro: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phân trang
  const [pageYears, setPageYears] = useState(1);
  const [pageAcademicYears, setPageAcademicYears] = useState(1);
  const [pageSemesters, setPageSemesters] = useState(1);
  const [pageClassBranches, setPageClassBranches] = useState(1);
  const [pageAchievements, setPageAchievements] = useState(1);
  const [pageDocuments, setPageDocuments] = useState(1);

  const fileInputRefs = useRef<any>([]);

  // Tải danh sách tài khoản từ API để chọn phân quyền
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`);
        if (res.ok) {
          const data = await res.json();
          setAccountsList(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Lỗi tải danh sách tài khoản:", e);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (initialData) {
      setYears(initialData.years || []);
      setAcademicYears(initialData.academicYears || []);
      setSemesters(initialData.semesters || []);
      setClassBranches(initialData.classBranches || []);
      setAchievements(initialData.achievements || []);
      setDocuments(initialData.documents || []);
      setFormManagers(initialData.formManagers || initialData.registrationFormManagers || []);
      setContact(initialData.contact || {
        address: "", email: "", fanpage: "", introduction: "", mission: "", vocation: "", structure: "", softwareIntro: ""
      });
    }
  }, [initialData]);

  // Click outside dropdown chọn tài khoản
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accDropdownRef.current && !accDropdownRef.current.contains(e.target as Node)) {
        setIsOpenAccDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemChange = (listType: 'years' | 'academicYears' | 'semesters' | 'classBranches' | 'documents', globalIndex: number, value: string) => {
    if (listType === 'years') { const u = [...years]; u[globalIndex] = value; setYears(u); }
    else if (listType === 'academicYears') { const u = [...academicYears]; u[globalIndex] = value; setAcademicYears(u); }
    else if (listType === 'semesters') { const u = [...semesters]; u[globalIndex] = value; setSemesters(u); }
    else if (listType === 'classBranches') { const u = [...classBranches]; u[globalIndex] = value; setClassBranches(u); }
    else if (listType === 'documents') { const u = [...documents]; u[globalIndex] = value; setDocuments(u); }
  };

  const handleRemoveItem = (listType: 'years' | 'academicYears' | 'semesters' | 'classBranches' | 'documents', globalIndex: number, currentPage: number, setCurrentPage: (p: number) => void, totalItems: number) => {
    let updatedLength = totalItems - 1;
    if (updatedLength > 0 && (currentPage - 1) * ITEMS_PER_PAGE >= updatedLength) setCurrentPage(currentPage - 1);
    if (listType === 'years') setYears(years.filter((_, i) => i !== globalIndex));
    else if (listType === 'academicYears') setAcademicYears(academicYears.filter((_, i) => i !== globalIndex));
    else if (listType === 'semesters') setSemesters(semesters.filter((_, i) => i !== globalIndex));
    else if (listType === 'classBranches') setClassBranches(classBranches.filter((_, i) => i !== globalIndex));
    else if (listType === 'documents') setDocuments(documents.filter((_, i) => i !== globalIndex));
  };

  const handleAddItem = (listType: 'years' | 'academicYears' | 'semesters' | 'classBranches' | 'documents', currentList: string[], setCurrentPage: (p: number) => void) => {
    setCurrentPage(Math.ceil((currentList.length + 1) / ITEMS_PER_PAGE) || 1);
    if (listType === 'years') setYears([...years, ""]);
    else if (listType === 'academicYears') setAcademicYears([...academicYears, ""]);
    else if (listType === 'semesters') setSemesters([...semesters, ""]);
    else if (listType === 'classBranches') setClassBranches([...classBranches, ""]);
    else if (listType === 'documents') setDocuments([...documents, ""]);
  };

  // Logic Thành tích
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
    let updatedLength = achievements.length - 1;
    if (updatedLength > 0 && (pageAchievements - 1) * ITEMS_PER_PAGE >= updatedLength) setPageAchievements(pageAchievements - 1);
    setAchievements(achievements.filter((_, i) => i !== globalIndex));
  };

  // 🟢 LOGIC MỤC 7: THÊM / XÓA NGƯỜI QUẢN LÝ PHIẾU
  const handleAddFormManager = (acc: any) => {
    const accId = String(acc._id || acc.user_id || acc.id);
    const exists = formManagers.some(m => String(m.user_id || m._id) === accId);
    if (!exists) {
      const newManager = {
        user_id: accId,
        displayName: acc.displayName || acc.username,
        username: acc.username
      };
      setFormManagers([...formManagers, newManager]);
    }
    setIsOpenAccDropdown(false);
    setSearchAccount("");
  };

  const handleRemoveFormManager = (userId: string) => {
    setFormManagers(formManagers.filter(m => String(m.user_id || m._id) !== String(userId)));
  };

  const filteredAccounts = accountsList.filter(acc => {
    const accId = String(acc._id || acc.user_id || acc.id);
    const isAlreadyAdded = formManagers.some(m => String(m.user_id || m._id) === accId);
    const search = searchAccount.toLowerCase();
    const nameMatch = (acc.displayName || "").toLowerCase().includes(search);
    const usernameMatch = (acc.username || "").toLowerCase().includes(search);

    return !isAlreadyAdded && (nameMatch || usernameMatch);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave({ 
      years, 
      academicYears, 
      semesters, 
      classBranches, 
      achievements, 
      documents, 
      formManagers, 
      contact 
    });
    setIsSubmitting(false);
  };

  const getPaginatedItems = (list: any[], currentPage: number) => {
    return list.slice((currentPage - 1) * ITEMS_PER_PAGE, (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE);
  };

  const renderPaginationControls = (totalItems: number, currentPage: number, setCurrentPage: (p: number) => void) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
        <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="p-1 rounded-lg border border-slate-200 hover:bg-purple-50 text-slate-500 disabled:opacity-40 transition-colors">
          <ChevronLeft size={14} />
        </button>
        <span className="text-[10px] font-bold text-slate-500">Trang {currentPage}/{totalPages}</span>
        <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="p-1 rounded-lg border border-slate-200 hover:bg-purple-50 text-slate-500 disabled:opacity-40 transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-black text-left">
      <div className="flex items-center justify-between border-b-2 border-purple-600 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-100">
            <Settings size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-purple-600 tracking-tight">Cấu hình tham số hệ thống</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-gray-100 shadow-xl bg-white p-6 space-y-8">
        
        {/* LƯỚI GRID 4 DANH SÁCH THAM SỐ CƠ BẢN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 1. DANH MỤC NĂM */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[440px]">
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-black uppercase text-purple-600 tracking-wider">1. Danh mục Năm ({years.length})</span>
                <button type="button" onClick={() => handleAddItem('years', years, setPageYears)} className="text-[10px] font-bold uppercase bg-purple-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 border-none outline-none active:scale-95 transition-all"><Plus size={12}/> Thêm</button>
              </div>
              <div className="space-y-2 h-[280px] overflow-y-auto pr-1">
                {getPaginatedItems(years, pageYears).map((item, idx) => {
                  const globalIndex = (pageYears - 1) * ITEMS_PER_PAGE + idx;
                  return (
                    <div key={globalIndex} className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-200/70 rounded-xl text-[11px] font-black text-slate-500 flex-shrink-0 select-none">{globalIndex + 1}</span>
                      <input type="number" value={item} onChange={(e) => handleItemChange('years', globalIndex, e.target.value)} required className="flex-1 p-2 bg-white border rounded-xl text-xs font-bold text-center outline-none focus:border-purple-500" />
                      <button type="button" onClick={() => handleRemoveItem('years', globalIndex, pageYears, setPageYears, years.length)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl border-none outline-none cursor-pointer"><Trash2 size={14}/></button>
                    </div>
                  );
                })}
              </div>
            </div>
            {renderPaginationControls(years.length, pageYears, setPageYears)}
          </div>

          {/* 2. DANH MỤC NĂM HỌC */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[440px]">
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-black uppercase text-purple-600 tracking-wider">2. Danh mục Năm học ({academicYears.length})</span>
                <button type="button" onClick={() => handleAddItem('academicYears', academicYears, setPageAcademicYears)} className="text-[10px] font-bold uppercase bg-purple-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 border-none outline-none active:scale-95 transition-all"><Plus size={12}/> Thêm</button>
              </div>
              <div className="space-y-2 h-[280px] overflow-y-auto pr-1">
                {getPaginatedItems(academicYears, pageAcademicYears).map((item, idx) => {
                  const globalIndex = (pageAcademicYears - 1) * ITEMS_PER_PAGE + idx;
                  return (
                    <div key={globalIndex} className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-200/70 rounded-xl text-[11px] font-black text-slate-500 flex-shrink-0 select-none">{globalIndex + 1}</span>
                      <input type="text" value={item} onChange={(e) => handleItemChange('academicYears', globalIndex, e.target.value)} required className="flex-1 p-2 bg-white border rounded-xl text-xs font-bold text-center outline-none focus:border-purple-500" />
                      <button type="button" onClick={() => handleRemoveItem('academicYears', globalIndex, pageAcademicYears, setPageAcademicYears, academicYears.length)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl border-none outline-none cursor-pointer"><Trash2 size={14}/></button>
                    </div>
                  );
                })}
              </div>
            </div>
            {renderPaginationControls(academicYears.length, pageAcademicYears, setPageAcademicYears)}
          </div>

          {/* 3. DANH MỤC HỌC KỲ */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[440px]">
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-black uppercase text-purple-600 tracking-wider">3. Danh mục Học kỳ ({semesters.length})</span>
                <button type="button" onClick={() => handleAddItem('semesters', semesters, setPageSemesters)} className="text-[10px] font-bold uppercase bg-purple-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 border-none outline-none active:scale-95 transition-all"><Plus size={12}/> Thêm</button>
              </div>
              <div className="space-y-2 h-[280px] overflow-y-auto pr-1">
                {getPaginatedItems(semesters, pageSemesters).map((item, idx) => {
                  const globalIndex = (pageSemesters - 1) * ITEMS_PER_PAGE + idx;
                  return (
                    <div key={globalIndex} className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-200/70 rounded-xl text-[11px] font-black text-slate-500 flex-shrink-0 select-none">{globalIndex + 1}</span>
                      <input type="text" value={item} onChange={(e) => handleItemChange('semesters', globalIndex, e.target.value)} required className="flex-1 p-2 bg-white border rounded-xl text-xs font-bold text-center outline-none focus:border-purple-500" />
                      <button type="button" onClick={() => handleRemoveItem('semesters', globalIndex, pageSemesters, setPageSemesters, semesters.length)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl border-none outline-none cursor-pointer"><Trash2 size={14}/></button>
                    </div>
                  );
                })}
              </div>
            </div>
            {renderPaginationControls(semesters.length, pageSemesters, setPageSemesters)}
          </div>

          {/* 4. DANH MỤC CHI ĐOÀN */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[440px]">
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-black uppercase text-purple-600 tracking-wider">4. Danh mục Chi đoàn trực thuộc ({classBranches.length})</span>
                <button type="button" onClick={() => handleAddItem('classBranches', classBranches, setPageClassBranches)} className="text-[10px] font-bold uppercase bg-purple-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 border-none outline-none active:scale-95 transition-all"><Plus size={12}/> Thêm</button>
              </div>
              <div className="space-y-2 h-[280px] overflow-y-auto pr-1">
                {getPaginatedItems(classBranches, pageClassBranches).map((item, idx) => {
                  const globalIndex = (pageClassBranches - 1) * ITEMS_PER_PAGE + idx;
                  return (
                    <div key={globalIndex} className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-200/70 rounded-xl text-[11px] font-black text-slate-500 flex-shrink-0 select-none">{globalIndex + 1}</span>
                      <input type="text" value={item} onChange={(e) => handleItemChange('classBranches', globalIndex, e.target.value)} required className="flex-1 p-2 bg-white border rounded-xl text-xs font-bold outline-none focus:border-purple-500" />
                      <button type="button" onClick={() => handleRemoveItem('classBranches', globalIndex, pageClassBranches, setPageClassBranches, classBranches.length)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl border-none outline-none cursor-pointer"><Trash2 size={14}/></button>
                    </div>
                  );
                })}
              </div>
            </div>
            {renderPaginationControls(classBranches.length, pageClassBranches, setPageClassBranches)}
          </div>
        </div>

        {/* 5. DANH MỤC LOẠI TÀI LIỆU */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-black uppercase text-purple-600 tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span> 5. Danh mục Loại tài liệu ({documents.length})
            </h3>
            <button type="button" onClick={() => handleAddItem('documents', documents, setPageDocuments)} className="text-[10px] font-bold uppercase bg-purple-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 border-none outline-none active:scale-95 transition-all cursor-pointer">
              <Plus size={12}/> Thêm tài liệu
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-1">
            {getPaginatedItems(documents, pageDocuments).map((item, idx) => {
              const globalIndex = (pageDocuments - 1) * ITEMS_PER_PAGE + idx;
              return (
                <div key={globalIndex} className="flex items-center gap-2 animate-in fade-in duration-200">
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-200/70 rounded-xl text-[11px] font-black text-slate-500 flex-shrink-0 select-none">{globalIndex + 1}</span>
                  <input type="text" value={item} onChange={(e) => handleItemChange('documents', globalIndex, e.target.value)} required placeholder="Nhập tên danh mục tài liệu..." className="flex-1 p-2 bg-white border rounded-xl text-xs font-bold outline-none focus:border-purple-500" />
                  <button type="button" onClick={() => handleRemoveItem('documents', globalIndex, pageDocuments, setPageDocuments, documents.length)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl border-none outline-none cursor-pointer"><Trash2 size={14}/></button>
                </div>
              );
            })}
          </div>
          {renderPaginationControls(documents.length, pageDocuments, setPageDocuments)}
        </div>

        {/* 6. THÀNH TÍCH ĐẠT ĐƯỢC */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-black uppercase text-purple-600 tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span> 6. Thành tích đạt được qua các năm ({achievements.length})
            </h3>
            <button type="button" onClick={handleAddAchievement} className="text-[10px] font-bold uppercase bg-purple-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 border-none outline-none active:scale-95 transition-all cursor-pointer">
              <Plus size={12}/> Thêm thành tích
            </button>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {getPaginatedItems(achievements, pageAchievements).map((item, idx) => {
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
          </div>
          {renderPaginationControls(achievements.length, pageAchievements, setPageAchievements)}
        </div>

        {/* 🟢 7. NGƯỜI ĐƯỢC QUẢN LÝ VÀ TẠO PHIẾU ĐĂNG KÝ CHƯƠNG TRÌNH */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-black uppercase text-purple-600 tracking-wider flex items-center gap-2">
              <FileCheck2 size={18} /> 7. Người được quản lý và tạo phiếu đăng ký chương trình ({formManagers.length})
            </h3>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Chọn các tài khoản có quyền truy cập tab <strong>TẠO PHIẾU ĐĂNG KÝ</strong> và quản lý phiếu trong hệ thống:
          </p>

          {/* Ô TÌM KIẾM VÀ CHỌN THÀNH VIÊN */}
          <div className="relative max-w-md" ref={accDropdownRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tài khoản theo tên hoặc tên đăng nhập..."
                value={searchAccount}
                onFocus={() => setIsOpenAccDropdown(true)}
                onChange={(e) => {
                  setSearchAccount(e.target.value);
                  setIsOpenAccDropdown(true);
                }}
                className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-purple-600 transition-all"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {isOpenAccDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-48 overflow-y-auto">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((acc) => (
                    <div
                      key={acc._id}
                      onClick={() => handleAddFormManager(acc)}
                      className="p-3 hover:bg-purple-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-none transition-colors"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{acc.displayName || acc.username}</p>
                        <p className="text-[10px] text-slate-400">@{acc.username}</p>
                      </div>
                      <Plus size={16} className="text-purple-600" />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 italic">
                    Không tìm thấy tài khoản phù hợp hoặc tất cả đã được thêm...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DANH SÁCH TÀI KHOẢN ĐƯỢC ỦY QUYỀN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {formManagers.map((mgr) => {
              const mgrId = String(mgr.user_id || mgr._id);
              return (
                <div 
                  key={mgrId}
                  className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between gap-2 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="p-2 bg-purple-600 text-white rounded-xl shrink-0">
                      <UserCheck size={16} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{mgr.displayName || mgr.username}</p>
                      {mgr.username && <p className="text-[10px] text-purple-600 font-semibold truncate">@{mgr.username}</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFormManager(mgrId)}
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-xl border-none bg-transparent cursor-pointer shrink-0 transition-colors"
                    title="Gỡ quyền quản lý phiếu"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}

            {formManagers.length === 0 && (
              <div className="col-span-full p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs italic font-medium">
                Chưa có tài khoản nào được phân quyền tạo & quản lý phiếu. (Mặc định chỉ người tạo phiếu mới có toàn quyền)
              </div>
            )}
          </div>
        </div>

        {/* THÔNG TIN NỘI DUNG VÀ TRANG GIỚI THIỆU */}
        <div className="space-y-6 pt-6 border-t border-gray-100">
          <h3 className="text-xs font-black uppercase text-purple-600 tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-600 rounded-full"></span> Thông tin nội dung trang GIỚI THIỆU
          </h3>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Đoạn giới thiệu chung</label>
            <textarea rows={3} value={contact.introduction || ""} onChange={(e) => setContact({ ...contact, introduction: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Nhập nội dung giới thiệu tổng quan..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Sứ mệnh</label>
              <textarea rows={4} value={contact.mission || ""} onChange={(e) => setContact({ ...contact, mission: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Nhập mục tiêu sứ mệnh..." />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Nhiệm vụ</label>
              <textarea rows={4} value={contact.vocation || ""} onChange={(e) => setContact({ ...contact, vocation: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Nhập nhiệm vụ trọng tâm..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Cơ cấu tổ chức</label>
              <textarea rows={4} value={contact.structure || ""} onChange={(e) => setContact({ ...contact, structure: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Mô tả các Ban chuyên môn..." />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Giới thiệu phần mềm</label>
              <textarea rows={4} value={contact.softwareIntro || ""} onChange={(e) => setContact({ ...contact, softwareIntro: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Nhập thông tin phần mềm..." />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Địa chỉ Văn phòng Đoàn khoa</label>
            <div className="relative">
              <input type="text" value={contact.address || ""} onChange={(e) => setContact({ ...contact, address: e.target.value })} required className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-bold" placeholder="Nhập địa chỉ..." />
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Email liên hệ</label>
              <div className="relative">
                <input type="email" value={contact.email || ""} onChange={(e) => setContact({ ...contact, email: e.target.value })} required className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-bold" placeholder="VD: doankhoa@uit.edu.vn" />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Đường dẫn Fanpage Facebook</label>
              <div className="relative">
                <input type="url" value={contact.fanpage || ""} onChange={(e) => setContact({ ...contact, fanpage: e.target.value })} className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-bold" placeholder="https://facebook.com/..." />
                <Facebook size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* NÚT LƯU */}
        <div className="pt-4 flex justify-end border-t border-gray-100">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-100 transition-all text-xs uppercase tracking-widest disabled:opacity-50 border-none outline-none cursor-pointer active:scale-95"
          >
            <Save size={16} /> {isSubmitting ? "Đang lưu..." : "Cập nhật cấu hình"}
          </button>
        </div>
      </form>
    </div>
  );
}