'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, AlignLeft, GraduationCap, Loader2 } from 'lucide-react';
import { AttendanceSession } from './types';

interface Props {
  session: AttendanceSession | null;
  currentUserId: string;
  onClose: () => void;
  onSaved: () => void;
}

const POPULAR_INTAKES = ['2021', '2022', '2023', '2024', '2025', '2026'];

export default function AttendanceSessionModal({ session, currentUserId, onClose, onSaved }: Props) {
  const isEdit = Boolean(session);
  const [title, setTitle] = useState(session?.title || '');
  const [date, setDate] = useState(session?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(session?.start_time || '07:30');
  const [endTime, setEndTime] = useState(session?.end_time || '11:30');
  const [location, setLocation] = useState(session?.location || 'Văn phòng Đoàn khoa');
  const [description, setDescription] = useState(session?.description || '');
  const [targetIntakes, setTargetIntakes] = useState<string[]>(session?.target_intakes || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      setTitle(session.title || '');
      setDate(session.date || '');
      setStartTime(session.start_time || '07:30');
      setEndTime(session.end_time || '11:30');
      setLocation(session.location || '');
      setDescription(session.description || '');
      setTargetIntakes(session.target_intakes || []);
    }
  }, [session]);

  const toggleIntake = (intake: string) => {
    if (targetIntakes.includes(intake)) {
      setTargetIntakes(targetIntakes.filter(i => i !== intake));
    } else {
      setTargetIntakes([...targetIntakes, intake]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const payload = {
        title: title.trim(),
        date,
        start_time: startTime,
        end_time: endTime,
        location: location.trim(),
        description: description.trim(),
        target_intakes: targetIntakes,
        created_by: isEdit ? session?.created_by : currentUserId,
      };

      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/attendance/${session?._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/attendance`;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const err = await res.json();
        alert(err.message || 'Lưu phiên điểm danh thất bại!');
      }
    } catch (e) {
      alert('Không thể kết nối đến máy chủ!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-black">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="bg-[#0054a5] p-5 text-white flex items-center justify-between shrink-0">
          <h3 className="font-bold text-sm uppercase tracking-wider">
            {isEdit ? 'Chỉnh sửa buổi điểm danh' : 'Tạo buổi điểm danh mới'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500">Tên buổi điểm danh / sự kiện *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Họp Ban Chấp hành mở rộng..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#0054a5] focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <Calendar size={13} className="text-[#0054a5]" /> Ngày diễn ra
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5]"
            />
          </div>

          {/* Khung giờ thực tế */}
          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
            <label className="text-[11px] font-bold uppercase text-[#0054a5] flex items-center gap-1">
              <Clock size={13} /> Khung thời gian điểm danh thực tế
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Giờ bắt đầu</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 bg-white border border-blue-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5]"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Giờ kết thúc</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 bg-white border border-blue-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <MapPin size={13} className="text-[#0054a5]" /> Địa điểm
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Phòng B1.14 / Hội trường E..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5]"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <GraduationCap size={13} className="text-[#0054a5]" /> Khóa tham gia
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTargetIntakes([])}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  targetIntakes.length === 0 ? 'bg-[#0054a5] text-white border-[#0054a5]' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Tất cả các khóa
              </button>
              {POPULAR_INTAKES.map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleIntake(k)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    targetIntakes.includes(k) ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {targetIntakes.includes(k) ? `✓ K${k}` : `K${k}`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <AlignLeft size={13} className="text-[#0054a5]" /> Ghi chú / Nội dung
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nội dung tóm tắt buổi làm việc..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0054a5] resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:bg-slate-100 text-xs uppercase border-none bg-transparent cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase shadow-md transition-all border-none cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>{isEdit ? 'Cập nhật' : 'Tạo buổi điểm danh'}</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}