'use client'; 

import { UserCheck, Bell, FileCheck2 } from 'lucide-react'; 

interface TabNavigationProps {   
  activeTab: 'info' | 'notifications' | 'registrations';   
  setActiveTab: (tab: 'info' | 'notifications' | 'registrations') => void;   
  notifCount: number; 
  registrationCount?: number;
}

export default function TabNavigation({ activeTab, setActiveTab, notifCount, registrationCount = 0 }: TabNavigationProps) {   
  return (     
    <div className="flex border-b border-gray-100 px-4 pt-2 bg-gray-50/50">       
      <button         
        onClick={() => setActiveTab('info')}         
        className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition-all cursor-pointer ${           
          activeTab === 'info'             
            ? 'border-[#0054a5] text-[#0054a5] bg-white rounded-t-lg'             
            : 'border-transparent text-gray-400 hover:text-gray-600'         
        }`}       
      >         
        <UserCheck size={18} />         
        <span>Thông tin cá nhân</span>       
      </button>       

      <button         
        onClick={() => setActiveTab('notifications')}         
        className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition-all cursor-pointer ${           
          activeTab === 'notifications'             
            ? 'border-[#0054a5] text-[#0054a5] bg-white rounded-t-lg'             
            : 'border-transparent text-gray-400 hover:text-gray-600'         
        }`}       
      >         
        <Bell size={18} />         
        <span>Thông báo</span>         
        {notifCount > 0 && (           
          <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">             
            {notifCount}           
          </span>         
        )}       
      </button>       

      <button         
        onClick={() => setActiveTab('registrations')}         
        className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-bold transition-all cursor-pointer ${           
          activeTab === 'registrations'             
            ? 'border-[#0054a5] text-[#0054a5] bg-white rounded-t-lg'             
            : 'border-transparent text-gray-400 hover:text-gray-600'         
        }`}       
      >         
        <FileCheck2 size={18} />         
        <span>Đăng ký chương trình</span>       
        {registrationCount > 0 && (
          <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {registrationCount}
          </span>
        )}
      </button>     
    </div>   
  ); 
}