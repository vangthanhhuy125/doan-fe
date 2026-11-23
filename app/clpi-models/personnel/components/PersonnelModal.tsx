'use client';

import { useState } from 'react';
import {
  X,
  PlusCircle,
  FileEdit,
  Eye,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { OfficerItem, CLPI_ROLES } from '../types';

interface Props {
  mode: 'add' | 'edit' | 'view';
  data: OfficerItem | null;
  onClose: () => void;
  onSave: (payload: Omit<OfficerItem, 'id'>, id?: string) => Promise<void>;
}

export default function PersonnelModal({ mode, data, onClose, onSave }: Props) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const [code, setCode] = useState(data?.code || '');
  const [name, setName] = useState(data?.name || '');
  const [position, setPosition] = useState(data?.position || '');
  const [unit, setUnit] = useState(data?.unit || '');
  const [role, setRole] = useState(data?.role || 'Officer');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView || saving) return;
    setErrorMsg('');

    if (!code.trim() || !name.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Mã cán bộ / MSSV và Họ tên.');
      return;
    }

    setSaving(true);
    try {
      await onSave(
        {
          code: code.trim(),
          name: name.trim(),
          position: position.trim() || 'Ủy viên BCH',
          unit: unit.trim() || 'Đoàn Khoa CNPM',
          role,
        },
        data?.id
      );
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể lưu thông tin cán bộ.');
    } finally {
      setSaving(false);
    }
  };

  const headerBg = isView ? 'bg-[#0054a5]' : isAdd ? 'bg-[#0054a5]' : 'bg-amber-500';

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-black">
        {/* HEADER MODAL */}
        <div className={`${headerBg} px-6 py-5 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              {isView ? <Eye size={20} /> : isAdd ? <PlusCircle size={20} /> : <FileEdit size={20} />}
            </div>
            <div>
              <h3 className="font-black uppercase tracking-wider text-sm">
                {isView
                  ? 'Hồ sơ nhân sự CLPI'
                  : isAdd
                  ? 'Thêm cán bộ tham gia CLPI'
                  : 'Cập nhật thông tin & Vai trò CLPI'}
              </h3>
              <p className="text-[11px] text-white/80 font-medium">
                Thiết lập đơn vị trực thuộc và quyền hạn trong chu kỳ đánh giá
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full text-white border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM NỘI DUNG */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Mã CB / MSSV <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={isView}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: 23520001"
                className="w-full p-3 bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-[#0054a5] rounded-2xl font-mono font-bold outline-none disabled:opacity-75"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Họ và tên cán bộ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={isView}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ tên đầy đủ..."
                className="w-full p-3 bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-[#0054a5] rounded-2xl font-bold outline-none disabled:opacity-75"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Chức vụ Đoàn - Hội
              </label>
              <input
                type="text"
                disabled={isView}
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="VD: Bí thư Chi đoàn"
                className="w-full p-3 bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-[#0054a5] rounded-2xl font-semibold outline-none disabled:opacity-75"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Đơn vị / Chi đoàn
              </label>
              <input
                type="text"
                disabled={isView}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="VD: KTPM2025.1"
                className="w-full p-3 bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-[#0054a5] rounded-2xl font-semibold outline-none disabled:opacity-75"
              />
            </div>
          </div>

          {/* PHÂN QUYỀN VAI TRÒ CLPI */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-bold uppercase text-slate-500 ml-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#0054a5]" />
              Vai trò trong hệ thống CLPI <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CLPI_ROLES.map((item) => {
                const selected = role === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={isView}
                    onClick={() => setRole(item.value)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'bg-blue-50/80 border-[#0054a5] shadow-2xs'
                        : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                    } disabled:cursor-default`}
                  >
                    <p
                      className={`font-black text-xs ${
                        selected ? 'text-[#0054a5]' : 'text-slate-800'
                      }`}
                    >
                      {item.value}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                      {item.label.replace(`${item.value} `, '')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl uppercase tracking-wider border-none cursor-pointer"
            >
              {isView ? 'Đóng' : 'Hủy bỏ'}
            </button>

            {!isView && (
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-1.5 px-6 py-2.5 ${
                  isAdd ? 'bg-[#0054a5] hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'
                } text-white font-bold rounded-2xl uppercase tracking-wider shadow-lg border-none cursor-pointer disabled:opacity-50`}
              >
                <CheckCircle2 size={15} />
                <span>{saving ? 'Đang lưu...' : isAdd ? 'Thêm cán bộ' : 'Lưu thay đổi'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}