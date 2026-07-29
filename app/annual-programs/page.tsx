'use client'; 

import { useState, useEffect } from "react"; 
import { 
  Plus, Edit, Trash2, Eye, Filter, Search, CalendarDays, RotateCcw, 
  CheckSquare, Square, FileCheck2, FileSpreadsheet 
} from "lucide-react"; 
import ProgramForm from "./ProgramForm"; 
import ConfirmDelete from "./ConfirmDelete"; 
import RegistrationManager from "./registration-forms/RegistrationManager";
import CreateFormModal from "./registration-forms/CreateFormModal";
import { RegistrationForm } from "./registration-forms/types";

export default function ToChucPage() {   
  const [data, setData] = useState<any[]>([]);   
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit' | 'view'; item: any }>({     
    open: false,     
    mode: 'view',     
    item: null   
  });   
  const [deleteItem, setDeleteItem] = useState<any>(null);   
  const [systemConfig, setSystemConfig] = useState<any>({     
    years: [],     
    academicYears: [],     
    semesters: []   
  });   

  const [searchTerm, setSearchTerm] = useState("");   
  const [filterSemester, setFilterSemester] = useState("");   
  const [filterAcademicYear, setFilterAcademicYear] = useState("");   
  const [filterMonth, setFilterMonth] = useState("");   
  const [filterYear, setFilterYear] = useState("");   

  // Quản lý phiếu đăng ký
  const [viewMode, setViewMode] = useState<'programs' | 'registrations'>('programs');
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);
  const [showCreateFormModal, setShowCreateFormModal] = useState(false);
  const [createdRegistrationForms, setCreatedRegistrationForms] = useState<RegistrationForm[]>([]);

  // 📌 1. Fetch danh sách chương trình hoạt động
  const fetchPrograms = async () => {     
    try {       
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/programs`);       
      const result = await res.json();       
      setData(Array.isArray(result) ? result : []);     
    } catch (error) {       
      console.error('Lỗi lấy danh sách chương trình:', error);     
    }   
  };   

  // 📌 2. Fetch danh sách cấu hình hệ thống
  const fetchSystemConfig = async () => {     
    try {       
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system-config`);       
      if (res.ok) {         
        const result = await res.json();         
        setSystemConfig({           
          years: result?.years || [],           
          academicYears: result?.academicYears || [],           
          semesters: result?.semesters || []         
        });       
      }     
    } catch (error) {       
      console.error('Lỗi lấy cấu hình hệ thống:', error);     
    }   
  };   

  // 📌 3. Fetch danh sách phiếu đăng ký từ Backend API
  const fetchRegistrationForms = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms`);
      if (res.ok) {
        const result = await res.json();
        setCreatedRegistrationForms(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách phiếu đăng ký:', error);
    }
  };

  useEffect(() => {     
    fetchPrograms();     
    fetchSystemConfig();   
    fetchRegistrationForms();
  }, []);   

  const handleSaveProgram = async (formData: any) => {     
    try {       
      const isEdit = formModal.mode === 'edit';       
      const url = isEdit          
        ? `${process.env.NEXT_PUBLIC_API_URL}/programs/${formData._id}`          
        : `${process.env.NEXT_PUBLIC_API_URL}/programs`;                
      
      const res = await fetch(url, {         
        method: isEdit ? 'PUT' : 'POST',         
        headers: { 'Content-Type': 'application/json' },         
        body: JSON.stringify(formData),       
      });       
      if (res.ok) {         
        await fetchPrograms();         
        setFormModal({ open: false, mode: 'view', item: null });       
      }     
    } catch (error) {       
      console.error(error);     
    }   
  };   

  const handleConfirmDelete = async () => {     
    if (deleteItem) {       
      try {         
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/programs/${deleteItem._id}`, {           
          method: 'DELETE',         
        });         
        if (res.ok) {           
          await fetchPrograms();           
          setDeleteItem(null);         
        }       
      } catch (error) {         
        console.error(error);       
      }     
    }   
  };   

  const resetFilters = () => {     
    setSearchTerm("");     
    setFilterMonth("");     
    setFilterYear("");     
    setFilterSemester("");     
    setFilterAcademicYear("");   
  };   

  const isFiltering = searchTerm !== "" || filterSemester !== "" || filterAcademicYear !== "" || filterMonth !== "" || filterYear !== "";   
  
  const filteredData = data.filter(item => {     
    const matchesSearch = (item.program_name || "").toLowerCase().includes(searchTerm.toLowerCase());     
    const matchesSemester = filterSemester === "" || item.semester === filterSemester;     
    const matchesAcademicYear = filterAcademicYear === "" || item.academic_year === filterAcademicYear;     
    const matchesMonth = filterMonth === "" || item.month === filterMonth;     
    const matchesYear = filterYear === "" || item.year === filterYear;     
    return matchesSearch && matchesSemester && matchesAcademicYear && matchesMonth && matchesYear;   
  });   

  const handleToggleSelectAll = () => {
    if (selectedProgramIds.length === filteredData.length && filteredData.length > 0) {
      setSelectedProgramIds([]);
    } else {
      setSelectedProgramIds(filteredData.map(item => typeof item._id === 'object' ? item._id.$oid : String(item._id)));
    }
  };

  const handleToggleSelectProgram = (id: string) => {
    if (selectedProgramIds.includes(id)) {
      setSelectedProgramIds(selectedProgramIds.filter(item => item !== id));
    } else {
      setSelectedProgramIds([...selectedProgramIds, id]);
    }
  };

  // 📌 4. Tạo mới phiếu đăng ký qua API
  const handleCreateRegistrationFormSave = async (newFormPayload: RegistrationForm) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newFormPayload.title,
          description: newFormPayload.description,
          created_at: newFormPayload.created_at,
          programs: newFormPayload.programs,
        }),
      });

      if (res.ok) {
        await fetchRegistrationForms();
        setShowCreateFormModal(false);
        setSelectedProgramIds([]);
        setViewMode('registrations');
      } else {
        alert('Tạo phiếu đăng ký thất bại!');
      }
    } catch (error) {
      console.error('Lỗi tạo phiếu đăng ký:', error);
    }
  };

  const getProgramId = (item: any): string => {
    if (!item?._id) return '';
    return typeof item._id === 'object' && item._id.$oid ? item._id.$oid : String(item._id);
  };

  if (viewMode === 'registrations') {
    return (
      <RegistrationManager
        forms={createdRegistrationForms}
        onRefresh={fetchRegistrationForms}
        onBack={() => setViewMode('programs')}
      />
    );
  }

  return (     
    <div className="space-y-6 text-black">       
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-[#0054a5] pb-3 gap-3">         
        <div className="flex items-center gap-3">           
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100 transition-transform hover:scale-105">             
            <CalendarDays size={24} />            
          </div>           
          <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">             
            Chương trình hoạt động trong năm          
          </h2>         
        </div>         

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('registrations')}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border-none outline-none cursor-pointer"
          >
            <FileSpreadsheet size={18} className="text-emerald-600" />
            Quản lý phiếu ({createdRegistrationForms.length})
          </button>

          <button
            disabled={selectedProgramIds.length === 0}
            onClick={() => setShowCreateFormModal(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border-none outline-none ${
              selectedProgramIds.length > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-100 cursor-pointer active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FileCheck2 size={18} />
            Tạo phiếu đăng ký ({selectedProgramIds.length})
          </button>

          <button            
            onClick={() => setFormModal({ open: true, mode: 'add', item: null })}           
            className="flex items-center gap-2 bg-[#1d92ff] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-[#0054a5] transition-all active:scale-95 text-xs uppercase tracking-wider border-none outline-none cursor-pointer"         
          >           
            <Plus size={20} /> Thêm chương trình         
          </button>       
        </div>
      </div>       

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">         
        <div className="relative max-w-md">           
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">             
            <Search size={18} className="text-gray-400" />           
          </div>           
          <input             
            type="text"             
            placeholder="Tìm kiếm theo tên hoạt động..."             
            value={searchTerm}             
            onChange={(e) => setSearchTerm(e.target.value)}             
            className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1d92ff] focus:ring-1 focus:ring-[#1d92ff] transition-all font-bold"           
          />         
        </div>         

        <div className="flex flex-wrap gap-4 items-end pt-2 border-t border-gray-100 text-left">           
          <div className="flex items-center gap-2 text-[#0054a5] font-bold mb-1 mr-2 text-sm">             
            <Filter size={16} /> <span>Lọc theo:</span>           
          </div>                      

          <div className="space-y-1">             
            <label className="text-[10px] uppercase font-bold text-gray-400">Tháng</label>             
            <select                
              value={filterMonth}               
              onChange={(e) => setFilterMonth(e.target.value)}               
              className="block w-28 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 cursor-pointer text-black font-bold"             
            >               
              <option value="">Tất cả</option>               
              {Array.from({ length: 12 }, (_, i) => {                 
                const m = (i + 1).toString().padStart(2, '0');                 
                return <option key={m} value={m}>Tháng {m}</option>;               
              })}             
            </select>           
          </div>           

          <div className="space-y-1">             
            <label className="text-[10px] uppercase font-bold text-gray-400">Năm</label>             
            <select                
              value={filterYear}               
              onChange={(e) => setFilterYear(e.target.value)}               
              className="block w-28 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 cursor-pointer text-black font-bold"             
            >               
              <option value="">Tất cả</option>               
              {systemConfig.years.map((y: string, idx: number) => (                 
                <option key={idx} value={y}>{y}</option>               
              ))}             
            </select>           
          </div>           

          <div className="space-y-1">             
            <label className="text-[10px] uppercase font-bold text-gray-400">Học kỳ</label>             
            <select                
              value={filterSemester}               
              onChange={(e) => setFilterSemester(e.target.value)}               
              className="block w-32 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 cursor-pointer text-black font-bold"             
            >               
              <option value="">Tất cả</option>               
              {systemConfig.semesters.map((s: string, idx: number) => (                 
                <option key={idx} value={s}>{s}</option>               
              ))}             
            </select>           
          </div>           

          <div className="space-y-1">             
            <label className="text-[10px] uppercase font-bold text-gray-400">Năm học</label>             
            <select                
              value={filterAcademicYear}               
              onChange={(e) => setFilterAcademicYear(e.target.value)}               
              className="block w-40 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 cursor-pointer text-black font-bold"             
            >               
              <option value="">Tất cả</option>               
              {systemConfig.academicYears.map((ay: string, idx: number) => (                 
                <option key={idx} value={ay}>{ay}</option>               
              ))}             
            </select>           
          </div>           

          {isFiltering && (             
            <button                
              onClick={resetFilters}               
              className="p-2 mb-0.5 text-red-500 hover:bg-red-50 rounded-full transition-all active:rotate-180 duration-500 border-none bg-transparent outline-none cursor-pointer"             
            >               
              <RotateCcw size={20} />             
            </button>           
          )}         
        </div>       
      </div>       

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">         
        <table className="w-full text-sm text-left border-collapse">           
          <thead className="bg-[#0054a5] text-white text-[14px] font-bold">             
            <tr>               
              <th className="px-4 py-4 text-center uppercase w-10">
                <button type="button" onClick={handleToggleSelectAll} className="p-1 text-white hover:opacity-80 border-none bg-transparent outline-none cursor-pointer">
                  {selectedProgramIds.length === filteredData.length && filteredData.length > 0 ? (
                    <CheckSquare size={18} />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
              <th className="px-4 py-4 text-center uppercase w-12">STT</th>               
              <th className="px-4 py-4 text-center">Tên chương trình</th>               
              <th className="px-4 py-4 text-center">Thời gian</th>               
              <th className="px-4 py-4 text-center w-32">Thao tác</th>             
            </tr>           
          </thead>           
          <tbody className="divide-y divide-gray-200">             
            {filteredData.length > 0 ? (               
              filteredData.map((item, index) => {
                const progId = getProgramId(item);
                const isChecked = selectedProgramIds.includes(progId);
                return (                 
                  <tr key={progId} className={`hover:bg-blue-50/40 transition-colors ${isChecked ? 'bg-blue-50/30' : ''}`}>                   
                    <td className="px-4 py-4 text-center">
                      <button type="button" onClick={() => handleToggleSelectProgram(progId)} className="text-[#0054a5] border-none bg-transparent outline-none cursor-pointer">
                        {isChecked ? <CheckSquare size={18} /> : <Square size={18} className="text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-gray-400">{index + 1}</td>                   
                    <td className="px-4 py-4 font-bold text-[#0054a5]">{item.program_name}</td>                   
                    <td className="px-4 py-4 text-center text-gray-600 font-medium whitespace-nowrap">                     
                      {item.month}/{item.year} - {item.semester} - {item.academic_year}                   
                    </td>                   
                    <td className="px-4 py-4 text-center">                     
                      <div className="flex items-center justify-center gap-2">                       
                        <button onClick={() => setFormModal({ open: true, mode: 'view', item })} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border-none bg-transparent outline-none cursor-pointer"><Eye size={18} /></button>                       
                        <button onClick={() => setFormModal({ open: true, mode: 'edit', item })} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors border-none bg-transparent outline-none cursor-pointer"><Edit size={18} /></button>                       
                        <button onClick={() => setDeleteItem(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors border-none bg-transparent outline-none cursor-pointer"><Trash2 size={18} /></button>                     
                      </div>                   
                    </td>                 
                  </tr>               
                );
              })             
            ) : (               
              <tr>                 
                <td colSpan={5} className="p-10 text-center text-gray-400 italic">                   
                  Không tìm thấy hoạt động nào phù hợp.                 
                </td>               
              </tr>             
            )}           
          </tbody>         
        </table>       
      </div>       

      {showCreateFormModal && (
        <CreateFormModal
          selectedPrograms={data.filter(p => selectedProgramIds.includes(getProgramId(p)))}
          onClose={() => setShowCreateFormModal(false)}
          onSave={handleCreateRegistrationFormSave}
        />
      )}

      {formModal.open && (         
        <ProgramForm           
          mode={formModal.mode}           
          data={formModal.item}           
          systemConfig={systemConfig}           
          onClose={() => setFormModal({ open: false, mode: 'view', item: null })}           
          onSave={handleSaveProgram}         
        />       
      )}       

      {deleteItem && (         
        <ConfirmDelete            
          title={deleteItem.program_name}           
          onClose={() => setDeleteItem(null)}           
          onConfirm={handleConfirmDelete}         
        />       
      )}     
    </div>   
  ); 
}