'use client';

import { useState, useEffect } from "react";
import { Settings, Save, FolderOpen, ShieldCheck, Award, LayoutTemplate } from "lucide-react";
import CategoriesTab from "./components/CategoriesTab";
import PermissionsTab from "./components/PermissionsTab";
import AchievementsTab from "./components/AchievementsTab";
import AboutTab from "./components/AboutTab";

interface SystemConfigFormProps {
  initialData: any;
  onSave: (data: any) => Promise<void>;
}

type ConfigTab = 'categories' | 'permissions' | 'achievements' | 'about';

export default function SystemConfigForm({ initialData, onSave }: SystemConfigFormProps) {
  const [activeTab, setActiveTab] = useState<ConfigTab>('categories');

  const [years, setYears] = useState<string[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [classBranches, setClassBranches] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [formManagers, setFormManagers] = useState<any[]>([]);
  const [accountsList, setAccountsList] = useState<any[]>([]);
  const [contact, setContact] = useState<any>({
    address: "", email: "", fanpage: "", introduction: "", mission: "", vocation: "", structure: "", softwareIntro: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setPositions(initialData.positions || []);
      setFormManagers(initialData.formManagers || initialData.registrationFormManagers || []);
      setContact(initialData.contact || {
        address: "", email: "", fanpage: "", introduction: "", mission: "", vocation: "", structure: "", softwareIntro: ""
      });
    }
  }, [initialData]);

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
      positions,
      formManagers, 
      contact 
    });
    setIsSubmitting(false);
  };

  const tabs: { id: ConfigTab; label: string; icon: any; count?: number }[] = [
    { id: 'categories', label: 'Danh mục', icon: FolderOpen },
    { id: 'permissions', label: 'Phân quyền', icon: ShieldCheck, count: formManagers.length },
    { id: 'achievements', label: 'Thành tích', icon: Award, count: achievements.length },
    { id: 'about', label: 'Thiết lập trang Giới thiệu', icon: LayoutTemplate },
  ];

  return (
    <div className="space-y-6 text-black text-left">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b-2 border-purple-600 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-100">
            <Settings size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-purple-600 tracking-tight">Cấu hình tham số hệ thống</h2>
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG 4 TAB */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'bg-transparent text-slate-600 hover:text-purple-600 hover:bg-white/70'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-gray-100 shadow-xl bg-white p-6 space-y-8">
        {activeTab === 'categories' && (
          <CategoriesTab
            years={years}
            setYears={setYears}
            academicYears={academicYears}
            setAcademicYears={setAcademicYears}
            semesters={semesters}
            setSemesters={setSemesters}
            classBranches={classBranches}
            setClassBranches={setClassBranches}
            documents={documents}
            setDocuments={setDocuments}
            positions={positions}
            setPositions={setPositions}
          />
        )}

        {activeTab === 'permissions' && (
          <PermissionsTab
            formManagers={formManagers}
            setFormManagers={setFormManagers}
            accountsList={accountsList}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsTab
            achievements={achievements}
            setAchievements={setAchievements}
            academicYears={academicYears}
          />
        )}

        {activeTab === 'about' && (
          <AboutTab
            contact={contact}
            setContact={setContact}
          />
        )}

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