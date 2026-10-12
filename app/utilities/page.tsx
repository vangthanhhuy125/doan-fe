'use client';

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, UserCheck } from "lucide-react";
import SurveyPage from "./survey/page";
import AttendancePage from "./attendance/page";

function UtilitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'menu';

  const setActiveTab = (tabName: string) => {
    if (tabName === 'menu') {
      router.push('/utilities');
    } else {
      router.push(`/utilities?tab=${tabName}`);
    }
  };

  const cards = [
    {
      id: 'survey',
      title: 'Tạo phiếu khảo sát',
      desc: 'Soạn thảo và phát hành biểu mẫu khảo sát, quản lý câu hỏi và thu thập phản hồi từ sinh viên.',
      icon: ClipboardList,
      iconColor: 'text-[#1d92ff] bg-blue-50'
    },
    {
      id: 'attendance',
      title: 'Điểm danh',
      desc: 'Quản lý danh sách tham gia hoạt động, theo dõi lượt có mặt và xuất báo cáo điểm danh.',
      icon: UserCheck,
      iconColor: 'text-emerald-600 bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-6 pb-10 text-left text-black">
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-200">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col items-center text-center shadow-md hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all duration-300 group"
              >
                <div className={`w-16 h-16 ${card.iconColor} rounded-2xl flex items-center justify-center mb-5 shadow-inner transition-transform group-hover:scale-110`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-base font-black text-slate-800 mb-2">{card.title}</h3>
                <p className="text-xs text-gray-400 font-medium leading-relaxed px-4">{card.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {activeTab !== 'menu' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 min-h-[450px]">
            {activeTab === 'survey' && (
              <SurveyPage />
            )}
            {activeTab === 'attendance' && (
              <AttendancePage />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UtilitiesPage() {
  return (
    <Suspense fallback={<div className="p-5 text-center text-sm font-bold text-gray-400">Đang tải...</div>}>
      <UtilitiesContent />
    </Suspense>
  );
}