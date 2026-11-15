'use client';

import { useState, useEffect } from "react";
import { Info, Target, ShieldCheck, Award, LayoutDashboard, MapPin, Mail, Facebook, X, Users } from "lucide-react";

let memoryCachedBanners: string[] | null = null;
let memoryCachedConfig: any = null;

export default function GioiThieuPage() {
  const [banners, setBanners] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [config, setConfig] = useState<any>({
    years: [], academicYears: [], semesters: [], classBranches: [], achievements: [],
    contact: { address: "", email: "", fanpage: "", introduction: "", mission: "", vocation: "", structure: "", softwareIntro: "" }
  });

  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

  useEffect(() => {
    if (memoryCachedBanners && memoryCachedBanners.length > 0) {
      setBanners(memoryCachedBanners);
    } else {
      try {
        const localBanners = sessionStorage.getItem('gioithieu_banners');
        if (localBanners) {
          const parsed = JSON.parse(localBanners);
          memoryCachedBanners = parsed;
          setBanners(parsed);
        }
      } catch (e) {}
    }

    if (memoryCachedConfig) {
      setConfig(memoryCachedConfig);
    } else {
      try {
        const localConfig = sessionStorage.getItem('gioithieu_config');
        if (localConfig) {
          const parsed = JSON.parse(localConfig);
          memoryCachedConfig = parsed;
          setConfig(parsed);
        }
      } catch (e) {}
    }

    const fetchData = async () => {
      try {
        const [bannerRes, configRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner-config`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/system-config`)
        ]);

        if (bannerRes.ok) {
          const bannerData = await bannerRes.json();
          if (bannerData && Array.isArray(bannerData.images) && bannerData.images.length > 0) {
            memoryCachedBanners = bannerData.images;
            setBanners(bannerData.images);
            try {
              sessionStorage.setItem('gioithieu_banners', JSON.stringify(bannerData.images));
            } catch (e) {}
          }
        }

        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData) {
            memoryCachedConfig = configData;
            setConfig(configData);
            try {
              sessionStorage.setItem('gioithieu_config', JSON.stringify(configData));
            } catch (e) {}
          }
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu giới thiệu:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  const info = config.contact || {};
  const activeAchievements = config.achievements || [];

  return (
    <div className="space-y-8 text-left relative">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3 pb-2.5">
          <div className="p-2.5 bg-[#0054a5] rounded-2xl text-white shadow-lg shadow-blue-100">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">Giới thiệu</h1>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">
          Thông tin tổng quan về Hệ thống nghiệp vụ công tác Đoàn – Hội của <strong className="text-slate-800">Đoàn khoa – Liên Chi hội khoa Công nghệ Phần mềm</strong>,
          trực thuộc Đoàn trường – Hội Sinh viên Trường Đại học Công nghệ Thông tin, Đại học Quốc gia Thành phố Hồ Chí Minh.
        </p>
      </div>

      {/* Hero Banner */}
      <div className="relative h-72 w-full rounded-2xl overflow-hidden shadow-lg bg-slate-900 block group">
        <img 
          src={banners.length > 0 ? banners[currentIndex] : "/banner-doan.jpg"} 
          alt="Banner Đoàn khoa - Liên Chi hội khoa Công nghệ Phần mềm" 
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 z-0 opacity-90" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#003b75]/90 via-[#0054a5]/65 to-transparent flex items-center px-8 sm:px-10 z-10">
          <div className="text-white max-w-2xl space-y-2.5">
            <h2 className="text-2xl sm:text-3xl font-black leading-tight drop-shadow-xs">
              {config.classBranches && config.classBranches.length > 0 
                ? config.classBranches[config.classBranches.length - 1] 
                : "Đoàn khoa – Liên Chi hội khoa Công nghệ Phần mềm"}
            </h2>
            <p className="text-blue-50 font-medium text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
              {info.introduction}
            </p>
          </div>
        </div>
        {banners.length > 1 && (
          <div className="absolute bottom-4 right-6 z-20 flex gap-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all border-none cursor-pointer ${
                  idx === currentIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sứ mệnh - Nhiệm vụ - Cơ cấu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-blue-50/90 to-white rounded-2xl border border-blue-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-md shadow-blue-200">
            <Target size={24} />
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-2">Sứ mệnh</h3>
          <p className="text-sm text-slate-600 leading-relaxed flex-1">{info.mission}</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-emerald-50/90 to-white rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-md shadow-emerald-200">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-2">Nhiệm vụ</h3>
          <p className="text-sm text-slate-600 leading-relaxed flex-1">{info.vocation}</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-50/90 to-white rounded-2xl border border-purple-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col md:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-md shadow-purple-200">
            <Info size={24} />
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-2">Cơ cấu</h3>
          <p className="text-sm text-slate-600 leading-relaxed flex-1">{info.structure}</p>
        </div>
      </div>

      {/* Thành tích nổi bật */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
              <Award size={20} />
            </span>
            <span>Thành tích nổi bật qua các năm học</span>
          </h3>
        </div>
        
        {activeAchievements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAchievements.map((ach: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => setSelectedAchievement(ach)}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-44 w-full bg-slate-50 overflow-hidden flex items-center justify-center text-slate-300">
                  {ach.image ? (
                    <img src={ach.image} alt={ach.academicYear} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Award size={48} className="text-slate-200" />
                  )}
                  <div className="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide shadow-md">
                    {ach.academicYear}
                  </div>
                </div>
                <div className="p-4 text-center bg-slate-50/70 group-hover:bg-amber-50/50 border-t border-slate-100 transition-colors">
                  <h4 className="font-bold text-slate-800 text-sm">Năm học {ach.academicYear}</h4>
                  <p className="text-xs text-[#0054a5] font-semibold mt-1 group-hover:underline">Xem tóm tắt thành tích ›</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 italic text-slate-400 text-sm font-semibold">
            Chưa có dữ liệu thành tích lịch sử...
          </div>
        )}
      </div>

      {/* Modal chi tiết thành tích */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 text-slate-800">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5 sm:p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Award size={22} />
                <h3 className="font-bold tracking-wide text-sm sm:text-base">Thành tích năm học {selectedAchievement.academicYear}</h3>
              </div>
              <button onClick={() => setSelectedAchievement(null)} className="p-2 hover:bg-white/15 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              {selectedAchievement.image && (
                <div className="w-full h-64 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
                  <img src={selectedAchievement.image} alt="Bìa vinh danh" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-amber-600 tracking-wide">Nội dung chi tiết thành tích đạt được</h4>
                <p className="text-slate-700 text-sm font-medium leading-loose whitespace-pre-line bg-amber-50/40 p-5 rounded-2xl border border-amber-100/80">
                  {selectedAchievement.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phần mềm quản lý & Thông tin liên hệ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[#0054a5] rounded-full"></span>
            <span>Về phần mềm quản lý</span>
          </h3>
          <p className="text-slate-600 text-sm leading-loose whitespace-pre-line">{info.softwareIntro}</p>
        </div>

        <div className="bg-gradient-to-br from-[#0054a5] to-[#003d7a] p-7 sm:p-8 rounded-2xl text-white shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-5 border-b border-white/20 pb-3">Thông tin liên hệ</h3>
            <div className="space-y-4 text-[13px] font-medium opacity-95">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0 mt-0.5 text-blue-200" />
                <p className="leading-relaxed"><strong>Địa chỉ:</strong> {info.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-blue-200" />
                <p><strong>Email:</strong> {info.email}</p>
              </div>
            </div>
          </div>
          {info.fanpage && (
            <div className="pt-6 border-t border-white/15 mt-6">
              <a 
                href={info.fanpage} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl text-xs font-bold transition-all leading-snug"
              >
                <Facebook size={22} className="shrink-0" />
                <span>Fanpage Đoàn - Hội khoa Công nghệ Phần mềm, trường ĐH Công nghệ Thông tin, ĐHQG-HCM</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}