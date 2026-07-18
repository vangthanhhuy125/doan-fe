'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Award, Lightbulb, Flag, ArrowLeft } from "lucide-react";
import SectionBangDiem from "./scorecards/SectionScoreCards";
import SectionMHGP from "./models-solutions/SectionModelSolution";
import SectionCTTN from "./youth-projects/SectionYouthProjects";
import MHGPModal from "./models-solutions/ModelSolutionModal";
import BangDiemModal from "./scorecards/ScoreCardsModal";
import CTTNModal from "./youth-projects/YouthProjectsModal";

function ThiDuaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'menu';

  const [activities, setActivities] = useState<any[]>([]);
  const [mhgpList, setMhgpList] = useState<any[]>([]);
  const [cttnList, setCttnList] = useState<any[]>([]);
  const [bdModal, setBdModal] = useState<any>({ open: false, mode: 'view', data: null });
  const [mhModal, setMhModal] = useState<any>({ open: false, mode: 'view', data: null });
  const [ctModal, setCtModal] = useState<any>({ open: false, mode: 'view', data: null });

  const setActiveTab = (tabName: string) => {
    if (tabName === 'menu') {
      router.push('/emulation-awards');
    } else {
      router.push(`/emulation-awards?tab=${tabName}`);
    }
  };

  const fetchData = async (endpoint: string, setter: Function) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`);
      const data = await res.json();
      setter(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData('performance', setActivities);
    fetchData('solution-models', setMhgpList);
    fetchData('youth-projects', setCttnList);
  }, []);

  const handleSaveCTTN = async (formData: any) => {
    try {
      const isEdit = ctModal.mode === 'edit';
      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_URL}/youth-projects/${ctModal.data._id}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/youth-projects`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchData('youth-projects', setCttnList);
        setCtModal({ ...ctModal, open: false });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCTTN = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/youth-projects/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData('youth-projects', setCttnList);
      setCtModal({ ...ctModal, open: false });
    } catch (error) {
      console.error(error);
    }
  };

  const cards = [
    {
      id: 'scorecards',
      title: 'Bảng điểm thi đua',
      desc: 'Theo dõi, đánh giá các tiêu chí hoạt động và chấm điểm thi đua chi tiết.',
      icon: Award,
      iconColor: 'text-emerald-500 bg-emerald-50'
    },
    {
      id: 'models',
      title: 'Mô hình giải pháp',
      desc: 'Quản lý các sáng kiến, mô hình hoạt động hiệu quả và giải pháp chuyển đổi số.',
      icon: Lightbulb,
      iconColor: 'text-blue-500 bg-blue-50'
    },
    {
      id: 'projects',
      title: 'Công trình thanh niên',
      desc: 'Theo dõi tiến độ các công trình thanh niên phục vụ cộng đồng.',
      icon: Flag,
      iconColor: 'text-[#0054a5] bg-blue-50'
    }
  ];

  return (
    <div className="space-y-6 pb-10 text-left text-black">
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 animate-in fade-in zoom-in-95 duration-200">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col items-center text-center shadow-md hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all duration-300 group"
              >
                <div className={`w-16 h-16 ${card.iconColor} rounded-2xl flex items-center justify-center mb-5 shadow-inner transition-transform group-hover:scale-110`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-base font-black text-slate-800 mb-2">{card.title}</h3>
                <p className="text-xs text-gray-400 font-medium leading-relaxed px-2">{card.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {activeTab !== 'menu' && (
        <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 min-h-[450px] animate-in fade-in slide-in-from-bottom-3 duration-300">
          {activeTab === 'scorecards' && (
            <SectionBangDiem activities={activities} onOpenModal={(m, d) => setBdModal({ open: true, mode: m, data: d })} />
          )}
          {activeTab === 'models' && (
            <SectionMHGP mhgpList={mhgpList} onOpenModal={(m, d) => setMhModal({ open: true, mode: m, data: d })} />
          )}
          {activeTab === 'projects' && (
            <SectionCTTN cttnList={cttnList} onOpenModal={(m, d) => setCtModal({ open: true, mode: m, data: d })} />
          )}
        </div>
      )}

      {bdModal.open && (
        <BangDiemModal
          mode={bdModal.open ? bdModal.mode : 'view'}
          data={bdModal.data}
          onClose={() => setBdModal({ ...bdModal, open: false })}
          onConfirmDelete={async (id: string) => {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/performance/${id}`, { method: 'DELETE' });
            fetchData('performance', setActivities);
            setBdModal({ ...bdModal, open: false });
          }}
          onSave={async (fd: any) => {
            const method = bdModal.mode === 'edit' ? 'PUT' : 'POST';
            const url = bdModal.mode === 'edit' ? `${process.env.NEXT_PUBLIC_API_URL}/performance/${bdModal.data._id}` : `${process.env.NEXT_PUBLIC_API_URL}/performance`;
            await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(fd)});
            fetchData('performance', setActivities);
            setBdModal({ ...bdModal, open: false });
          }}
        />
      )}

      {mhModal.open && (
        <MHGPModal
          mode={mhModal.open ? mhModal.mode : 'view'}
          data={mhModal.data}
          onClose={() => setMhModal({ ...mhModal, open: false })}
          onConfirmDelete={async (id: string) => {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/solution-models/${id}`, { method: 'DELETE' });
            fetchData('solution-models', setMhgpList);
            setMhModal({ ...mhModal, open: false });
          }}
          onSave={async (fd: any) => {
            const method = mhModal.mode === 'edit' ? 'PUT' : 'POST';
            const url = mhModal.mode === 'edit' ? `${process.env.NEXT_PUBLIC_API_URL}/solution-models/${mhModal.data._id}` : `${process.env.NEXT_PUBLIC_API_URL}/solution-models`;
            await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(fd)});
            fetchData('solution-models', setMhgpList);
            setMhModal({ ...mhModal, open: false });
          }}
        />
      )}

      {ctModal.open && (
        <CTTNModal
          mode={ctModal.open ? ctModal.mode : 'view'}
          data={ctModal.data}
          onClose={() => setCtModal({ ...ctModal, open: false })}
          onConfirmDelete={handleDeleteCTTN}
          onSave={handleSaveCTTN}
        />
      )}
    </div>
  );
}

export default function ThiDuaPage() {
  return (
    <Suspense fallback={<div className="p-5 text-center text-sm font-bold text-gray-400">Đang tải...</div>}>
      <ThiDuaContent />
    </Suspense>
  );
}