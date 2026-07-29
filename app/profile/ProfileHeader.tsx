'use client';

import { User, Camera, Award } from 'lucide-react';

interface ProfileHeaderProps {
  fullName: string;
  studentId: string;
  className: string;
  imageUrl: string;
  roles: string[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileHeader({
  fullName,
  studentId,
  className,
  imageUrl,
  roles,
  onImageChange,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-6 shadow-sm md:flex-row border border-gray-100">
      <div className="relative group">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[#0054a5] bg-blue-50">
          {imageUrl ? (
            <img src={imageUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <User size={40} className="text-[#0054a5]" />
          )}
        </div>
        <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-[#0054a5] p-2 text-white shadow-md transition-all hover:bg-blue-700">
          <Camera size={14} />
          <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
        </label>
      </div>

      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-2xl font-bold uppercase text-[#0054a5]">
          {'Đoàn viên'}
        </h2>
        <p className="text-sm font-semibold text-gray-500">
          MSSV: <span className="text-gray-800">{studentId || '—'}</span> | Lớp: <span className="text-gray-800">{className || 'Chưa cập nhật'}</span>
        </p>

        <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
          {roles.map((role, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#0054a5]">
              <Award size={12} /> {role}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}