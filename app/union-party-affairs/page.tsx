'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Bell, ShieldCheck, ArrowLeft } from "lucide-react";
import PartyDevelopment from "./PartyWork/page";
import NotificationPage from "./Notification/page";

function CongTacContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'menu';

  const setActiveTab = (tabName: string) => {
    if (tabName === 'menu') {
      router.push('/union-party-affairs');
    } else {
      router.push(`/union-party-affairs?tab=${tabName}`);
    }
  };

  const cards = [
    {
      id: 'notifications',
      title: 'Thông báo - Triển khai',
      desc: 'Quản lý, soạn thảo và theo dõi các thông báo, văn bản chỉ đạo và kế hoạch triển khai.',
      icon: Bell,
      iconColor: 'text-[#1d92ff] bg-blue-50'
    },
    {
      id: 'partywork',
      title: 'Công tác phát triển Đảng',
      desc: 'Quản lý danh sách Đảng viên hiện tại, Đoàn viên ưu tú và theo dõi công tác phát triển Đảng.',
      icon: ShieldCheck,
      iconColor: 'text-red-500 bg-red-50'
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
        <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 min-h-[450px] animate-in fade-in slide-in-from-bottom-3 duration-300">
          {activeTab === 'notifications' && (
            <NotificationPage />
          )}
          {activeTab === 'partywork' && (
            <PartyDevelopment />
          )}
        </div>
      )}
    </div>
  );
}

export default function CongTacPage() {
  return (
    <Suspense fallback={<div className="p-5 text-center text-sm font-bold text-gray-400">Đang tải...</div>}>
      <CongTacContent />
    </Suspense>
  );
}