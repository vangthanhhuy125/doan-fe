'use client';

import { X, Users, Layers } from 'lucide-react';
import { CycleItem } from '../types';

interface Props {
  cycle: CycleItem;
  onClose: () => void;
}

export default function CycleDetailModal({ cycle, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <h3 className="font-black text-sm sm:text-base">{cycle.name}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full text-white border-none bg-transparent cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-slate-400 font-semibold block">Thời gian đánh giá</span>
              <strong className="text-slate-800 mt-0.5 block">
                {cycle.startDate} — {cycle.endDate}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Hạn tự đánh giá</span>
              <strong className="text-rose-600 mt-0.5 block">{cycle.selfDeadline}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Hạn BTV thẩm định</span>
              <strong className="text-[#0054a5] mt-0.5 block">{cycle.reviewDeadline}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Tổng cán bộ tham gia</span>
              <strong className="text-slate-800 mt-0.5 block">
                {cycle.totalOfficers} cán bộ
              </strong>
            </div>
          </div>

          {cycle.weights && (
            <div className="space-y-1.5">
              <span className="font-bold text-slate-500 uppercase text-[11px] flex items-center gap-1">
                <Layers size={13} className="text-[#0054a5]" /> Snapshot trọng số chu kỳ
              </span>
              <div className="grid grid-cols-4 gap-2 text-center font-black text-[#0054a5]">
                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
                  WPI: {cycle.weights.WPI}%
                </div>
                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
                  LEI: {cycle.weights.LEI}%
                </div>
                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
                  CEI: {cycle.weights.CEI}%
                </div>
                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
                  SDI: {cycle.weights.SDI}%
                </div>
              </div>
            </div>
          )}

          {cycle.units && cycle.units.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-slate-500 uppercase text-[11px] flex items-center gap-1">
                <Users size={13} className="text-[#0054a5]" /> Đơn vị trực thuộc tham gia
              </span>
              <div className="flex flex-wrap gap-1.5">
                {cycle.units.map((u) => (
                  <span
                    key={u}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#0054a5] text-white font-bold rounded-xl border-none cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}