'use client';

import { useState, useRef, useEffect } from 'react';
import {
  X,
  PlusCircle,
  FileEdit,
  Eye,
  Plus,
  Trash2,
  Check,
  UserCheck,
  Users,
  ListChecks,
  AlertCircle,
} from 'lucide-react';

interface Props {
  mode: 'add' | 'edit' | 'view';
  data?: any;
  personnelList: any[];
  programsList: any[];
  cyclesList: any[];
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

const CLPI_INDICATORS = [
  { code: 'WPI', name: 'Hoàn thành nhiệm vụ', desc: 'Tiến độ, số lượng & chất lượng công việc' },
  { code: 'LEI', name: 'Điều hành & Phối hợp', desc: 'Quản lý nhóm, phân công & xử lý tình huống' },
  { code: 'CEI', name: 'Tương tác tổ chức', desc: 'Kết nối đoàn viên, sinh hoạt & phong trào' },
  { code: 'SDI', name: 'Phát triển cá nhân', desc: 'Tập huấn, rèn luyện kỹ năng & kỷ luật' },
];

export default function AssignTaskModal({
  mode,
  data,
  personnelList = [],
  programsList = [],
  cyclesList = [],
  onClose,
  onSave,
}: Props) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const defaultOpenCycle =
    cyclesList.find((c: any) => ['OPEN', 'SELF_ASSESSMENT'].includes(c.status)) ||
    cyclesList[0];

  const [title, setTitle] = useState<string>(data?.title || '');
  const [cycleId, setCycleId] = useState<string>(
    data?.cycleId || (defaultOpenCycle ? String(defaultOpenCycle._id || defaultOpenCycle.id) : '')
  );
  const [activityId, setActivityId] = useState<string>(data?.activityId || '');
  const [shortDescription, setShortDescription] = useState<string>(data?.shortDescription || '');
  const [description, setDescription] = useState<string>(data?.description || '');
  const [priority, setPriority] = useState<string>(data?.priority || 'NORMAL');
  const [startDate, setStartDate] = useState<string>(
    data?.startDate ? String(data.startDate).slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [deadline, setDeadline] = useState<string>(
    data?.deadline ? String(data.deadline).slice(0, 10) : ''
  );

  // Cán bộ chính (PRIMARY_ASSIGNEE)
  const [primaryAssigneeId, setPrimaryAssigneeId] = useState<string>(
    data?.primaryAssigneeId || ''
  );
  const [assigneeSearch, setAssigneeSearch] = useState<string>(data?.primaryAssigneeName || '');
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const assigneeRef = useRef<HTMLDivElement>(null);

  // Cán bộ phối hợp (COLLABORATORS)
  const [collaborators, setCollaborators] = useState<{ id: string; name: string }[]>(
    Array.isArray(data?.collaborators) ? data.collaborators : []
  );
  const [collabSearch, setCollabSearch] = useState('');
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const collabRef = useRef<HTMLDivElement>(null);

  // Chỉ số CLPI liên quan
  const [indicators, setIndicators] = useState<string[]>(
    Array.isArray(data?.indicators) && data.indicators.length > 0 ? data.indicators : ['WPI']
  );

  // Sản phẩm đầu ra dự kiến (ExpectedOutputs)
  const [expectedOutputs, setExpectedOutputs] = useState<string[]>(
    Array.isArray(data?.expectedOutputs) && data.expectedOutputs.length > 0
      ? data.expectedOutputs
      : ['']
  );
  const [requireEvidence, setRequireEvidence] = useState<boolean>(
    data?.requireEvidence ?? true
  );

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (assigneeRef.current && !assigneeRef.current.contains(e.target as Node)) {
        setIsAssigneeOpen(false);
      }
      if (collabRef.current && !collabRef.current.contains(e.target as Node)) {
        setIsCollabOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleIndicator = (code: string) => {
    if (isView) return;
    setIndicators((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleOutputChange = (idx: number, val: string) => {
    const next = [...expectedOutputs];
    next[idx] = val;
    setExpectedOutputs(next);
  };

  const handleAddOutput = () => {
    setExpectedOutputs([...expectedOutputs, '']);
  };

  const handleRemoveOutput = (idx: number) => {
    if (expectedOutputs.length <= 1) return;
    setExpectedOutputs(expectedOutputs.filter((_, i) => i !== idx));
  };

  const filteredPrimaryPersonnel = personnelList.filter((p: any) => {
    const q = assigneeSearch.toLowerCase().trim();
    const name = (p.full_name || p.name || '').toLowerCase();
    const mssv = (p.student_id || p.mssv || '').toLowerCase();
    return !q || name.includes(q) || mssv.includes(q);
  });

  const filteredCollabPersonnel = personnelList.filter((p: any) => {
    const id = String(p._id || p.id);
    if (id === String(primaryAssigneeId)) return false;
    if (collaborators.some((c) => String(c.id) === id)) return false;
    const q = collabSearch.toLowerCase().trim();
    const name = (p.full_name || p.name || '').toLowerCase();
    const mssv = (p.student_id || p.mssv || '').toLowerCase();
    return !q || name.includes(q) || mssv.includes(q);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView || isSubmitting) return;
    setErrorMsg('');

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanOutputs = expectedOutputs.map((o) => o.trim()).filter(Boolean);

    if (!cleanTitle) {
      setErrorMsg('Vui lòng nhập tên công việc.');
      return;
    }
    if (!primaryAssigneeId) {
      setErrorMsg('Vui lòng chọn Cán bộ chịu trách nhiệm chính.');
      return;
    }
    if (!deadline) {
      setErrorMsg('Vui lòng chọn Hạn hoàn thành (Deadline).');
      return;
    }
    if (startDate && deadline < startDate) {
      setErrorMsg('Hạn hoàn thành không được nhỏ hơn ngày bắt đầu.');
      return;
    }
    if (indicators.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 01 chỉ số CLPI liên quan (WPI/LEI/CEI/SDI).');
      return;
    }
    if (!cleanDesc) {
      setErrorMsg('Vui lòng nhập Mô tả công việc & Yêu cầu.');
      return;
    }
    if (cleanOutputs.length === 0) {
      setErrorMsg('Vui lòng nhập ít nhất 01 sản phẩm đầu ra dự kiến.');
      return;
    }

    const selectedCycle = cyclesList.find(
      (c: any) => String(c._id || c.id) === String(cycleId)
    );
    const selectedProg = programsList.find(
      (p: any) => String(p._id || p.id) === String(activityId)
    );
    const primaryPerson = personnelList.find(
      (p: any) => String(p._id || p.id) === String(primaryAssigneeId)
    );

    let assignedByName = data?.assignedByName || 'Ban Thường vụ Đoàn Khoa';
    let assignedById = data?.assignedById || '';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        const u = parsed.user || parsed;
        assignedById = String(u._id || u.id || u.user_id || '');
        assignedByName = u.full_name || u.displayName || u.username || assignedByName;
      }
    } catch {}

    setIsSubmitting(true);
    try {
      await onSave({
        ...data,
        title: cleanTitle,
        cycleId: cycleId || null,
        cycleName: selectedCycle ? selectedCycle.name : '',
        activityId: activityId || null,
        activityName: selectedProg ? selectedProg.title || selectedProg.name : '',
        shortDescription: shortDescription.trim(),
        description: cleanDesc,
        priority,
        startDate,
        deadline,
        primaryAssigneeId: String(primaryAssigneeId),
        primaryAssigneeName: primaryPerson
          ? primaryPerson.full_name || primaryPerson.name
          : assigneeSearch,
        collaborators,
        indicators,
        expectedOutputs: cleanOutputs,
        requireEvidence,
        assignedById,
        assignedByName,
        status: data?.status || 'NOT_STARTED',
        progress: data?.progress ?? 0,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi giao công việc.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerBg = isView ? 'bg-[#0054a5]' : isAdd ? 'bg-[#0054a5]' : 'bg-amber-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* HEADER */}
        <div className={`${headerBg} px-6 py-5 flex items-center justify-between text-white`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              {isView ? (
                <Eye size={20} />
              ) : isAdd ? (
                <PlusCircle size={20} />
              ) : (
                <FileEdit size={20} />
              )}
            </div>
            <div>
              <h3 className="font-black uppercase tracking-wider text-sm">
                {isView
                  ? 'Chi tiết công việc đã giao'
                  : isAdd
                  ? 'Giao công việc CLPI mới'
                  : 'Cập nhật phân công công việc'}
              </h3>
              <p className="text-[11px] text-white/80 font-medium">
                Gắn chu kỳ đánh giá, chỉ số năng lực, sản phẩm đầu ra và thời hạn hoàn thành
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/15 rounded-full border-none bg-transparent text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[85vh] text-black"
        >
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TÊN CÔNG VIỆC & CHU KỲ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Tên công việc <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={255}
                disabled={isView}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Tổ chức Tập huấn Lập trình GamApp 2026..."
                className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 focus:bg-white focus:border-[#0054a5] outline-none text-sm font-bold disabled:opacity-75"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Chu kỳ CLPI áp dụng
              </label>
              <select
                disabled={isView}
                value={cycleId}
                onChange={(e) => setCycleId(e.target.value)}
                className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 focus:bg-white focus:border-[#0054a5] outline-none text-xs font-bold cursor-pointer disabled:opacity-75"
              >
                <option value="">-- Chọn chu kỳ --</option>
                {cyclesList.map((c: any) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CHƯƠNG TRÌNH & MÔ TẢ NGẮN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Thuộc Chương trình / Hoạt động
              </label>
              <select
                disabled={isView}
                value={activityId}
                onChange={(e) => setActivityId(e.target.value)}
                className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 focus:bg-white focus:border-[#0054a5] outline-none text-xs font-bold cursor-pointer disabled:opacity-75"
              >
                <option value="">-- Công việc thường xuyên (Không gắn chương trình) --</option>
                {programsList.map((prog: any) => (
                  <option key={prog._id || prog.id} value={prog._id || prog.id}>
                    {prog.title || prog.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Tóm tắt vai trò / Mô tả ngắn
              </label>
              <input
                type="text"
                disabled={isView}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="VD: Phụ trách nội dung giảng dạy và tài liệu..."
                className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 focus:bg-white focus:border-[#0054a5] outline-none text-xs font-semibold disabled:opacity-75"
              />
            </div>
          </div>

          {/* PHÂN CÔNG CÁN BỘ CHÍNH & CÁN BỘ PHỐI HỢP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cán bộ chính */}
            <div className="space-y-1.5" ref={assigneeRef}>
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Cán bộ chịu trách nhiệm chính <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserCheck
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0054a5]"
                />
                <input
                  type="text"
                  disabled={isView}
                  value={assigneeSearch}
                  onFocus={() => setIsAssigneeOpen(true)}
                  onChange={(e) => {
                    setAssigneeSearch(e.target.value);
                    setPrimaryAssigneeId('');
                    setIsAssigneeOpen(true);
                  }}
                  placeholder="Gõ tên hoặc MSSV cán bộ chính..."
                  className="w-full p-3.5 pl-10 bg-slate-50 rounded-2xl border border-slate-200/80 focus:bg-white focus:border-[#0054a5] outline-none text-xs font-bold disabled:opacity-75"
                />

                {!isView && isAssigneeOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-48 overflow-y-auto py-1">
                    {filteredPrimaryPersonnel.length > 0 ? (
                      filteredPrimaryPersonnel.map((p: any) => {
                        const pId = String(p._id || p.id);
                        const pName = p.full_name || p.name;
                        const isSelected = String(primaryAssigneeId) === pId;
                        return (
                          <div
                            key={pId}
                            onClick={() => {
                              setPrimaryAssigneeId(pId);
                              setAssigneeSearch(pName);
                              setCollaborators((prev) => prev.filter((c) => c.id !== pId));
                              setIsAssigneeOpen(false);
                            }}
                            className={`px-3.5 py-2.5 text-xs cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-50 text-[#0054a5] font-bold'
                                : 'hover:bg-slate-50 text-slate-700 font-semibold'
                            }`}
                          >
                            <div>
                              <p>{pName}</p>
                              <p className="text-[10px] text-slate-400">
                                {p.student_id || p.mssv} • {p.class || 'Chưa phân lớp'}
                              </p>
                            </div>
                            {isSelected && <Check size={15} className="text-[#0054a5]" />}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400 italic">
                        Không tìm thấy cán bộ phù hợp
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cán bộ phối hợp */}
            <div className="space-y-1.5" ref={collabRef}>
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Cán bộ phối hợp (Tùy chọn)
              </label>
              <div className="relative">
                <div
                  onClick={() => !isView && setIsCollabOpen(true)}
                  className="w-full min-h-[46px] p-2 pl-10 bg-slate-50 rounded-2xl border border-slate-200/80 focus-within:bg-white focus-within:border-[#0054a5] flex flex-wrap items-center gap-1.5"
                >
                  <Users size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  {collaborators.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-[#0054a5] border border-blue-200 text-[11px] font-bold"
                    >
                      {c.name}
                      {!isView && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCollaborators(collaborators.filter((item) => item.id !== c.id));
                          }}
                          className="border-none bg-transparent text-[#0054a5] cursor-pointer p-0 flex items-center"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                  {!isView && (
                    <input
                      type="text"
                      value={collabSearch}
                      onFocus={() => setIsCollabOpen(true)}
                      onChange={(e) => {
                        setCollabSearch(e.target.value);
                        setIsCollabOpen(true);
                      }}
                      placeholder={collaborators.length === 0 ? 'Thêm người phối hợp...' : ''}
                      className="flex-1 min-w-[100px] bg-transparent text-xs font-semibold outline-none py-1"
                    />
                  )}
                </div>

                {!isView && isCollabOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-44 overflow-y-auto py-1">
                    {filteredCollabPersonnel.length > 0 ? (
                      filteredCollabPersonnel.map((p: any) => {
                        const pId = String(p._id || p.id);
                        const pName = p.full_name || p.name;
                        return (
                          <div
                            key={pId}
                            onClick={() => {
                              setCollaborators([...collaborators, { id: pId, name: pName }]);
                              setCollabSearch('');
                            }}
                            className="px-3.5 py-2 text-xs hover:bg-slate-50 cursor-pointer flex items-center justify-between font-semibold text-slate-700"
                          >
                            <span>
                              {pName}{' '}
                              <span className="text-[10px] text-slate-400">
                                ({p.student_id || p.mssv})
                              </span>
                            </span>
                            <Plus size={14} className="text-[#0054a5]" />
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400 italic">
                        Không còn cán bộ khả dụng
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* THỜI GIAN & ĐỘ ƯU TIÊN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                disabled={isView}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-200/80 focus:bg-white focus:border-[#0054a5] outline-none text-xs font-bold disabled:opacity-75"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Hạn hoàn thành <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                disabled={isView}
                value={deadline}
                min={startDate || undefined}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-200/80 focus:bg-white focus:border-[#0054a5] outline-none text-xs font-bold disabled:opacity-75"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
                Độ ưu tiên <span className="text-rose-500">*</span>
              </label>
              <select
                disabled={isView}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-200/80 focus:bg-white focus:border-[#0054a5] outline-none text-xs font-bold cursor-pointer disabled:opacity-75"
              >
                <option value="HIGH">Cao</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="NORMAL">Bình thường</option>
                <option value="LOW">Thấp</option>
              </select>
            </div>
          </div>

          {/* CHỈ SỐ CLPI LIÊN QUAN */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
              Chỉ số CLPI căn cứ đánh giá <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {CLPI_INDICATORS.map((ind) => {
                const checked = indicators.includes(ind.code);
                return (
                  <button
                    key={ind.code}
                    type="button"
                    disabled={isView}
                    onClick={() => toggleIndicator(ind.code)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      checked
                        ? 'bg-blue-50/80 border-[#0054a5] shadow-2xs'
                        : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                    } disabled:cursor-default`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black ${
                          checked ? 'text-[#0054a5]' : 'text-slate-600'
                        }`}
                      >
                        {ind.code}
                      </span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center ${
                          checked
                            ? 'bg-[#0054a5] text-white'
                            : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {checked && <Check size={11} />}
                      </div>
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 mt-1">{ind.name}</p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{ind.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MÔ TẢ CÔNG VIỆC & YÊU CẦU */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">
              Mô tả công việc & Yêu cầu chi tiết <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              disabled={isView}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả rõ phạm vi công việc, yêu cầu chuyên môn và tiêu chuẩn hoàn thành..."
              className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 focus:bg-white focus:border-[#0054a5] outline-none text-xs font-medium leading-relaxed resize-none disabled:opacity-75"
            />
          </div>

          {/* SẢN PHẨM ĐẦU RA DỰ KIẾN */}
          <div className="space-y-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase text-slate-600 flex items-center gap-1.5">
                <ListChecks size={15} className="text-[#0054a5]" />
                Sản phẩm đầu ra dự kiến (Deliverables) <span className="text-rose-500">*</span>
              </label>
              {!isView && (
                <button
                  type="button"
                  onClick={handleAddOutput}
                  className="text-[11px] font-bold text-[#0054a5] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
                >
                  <Plus size={13} /> Thêm đầu ra
                </button>
              )}
            </div>

            <div className="space-y-2">
              {expectedOutputs.map((out, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-[11px] font-black text-slate-500 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    disabled={isView}
                    value={out}
                    onChange={(e) => handleOutputChange(idx, e.target.value)}
                    placeholder="VD: Bộ tài liệu giảng dạy 3 buổi bài giảng..."
                    className="flex-1 p-2.5 bg-white rounded-xl border border-slate-200 focus:border-[#0054a5] outline-none text-xs font-semibold disabled:opacity-75"
                  />
                  {!isView && expectedOutputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOutput(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border-none bg-transparent cursor-pointer"
                      title="Xóa đầu ra này"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={isView}
                checked={requireEvidence}
                onChange={(e) => setRequireEvidence(e.target.checked)}
                className="w-4 h-4 accent-[#0054a5] rounded cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-600">
                Bắt buộc đính kèm minh chứng (File hoặc Link Google Drive) trước khi xác nhận hoàn thành
              </span>
            </label>
          </div>

          {/* FOOTER NÚT HÀNH ĐỘNG */}
          {!isView && (
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 text-xs uppercase tracking-wider border-none cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 ${
                  isAdd ? 'bg-[#0054a5] hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'
                } text-white rounded-2xl font-bold shadow-lg text-xs uppercase tracking-wider border-none cursor-pointer disabled:opacity-50`}
              >
                {isSubmitting ? 'Đang lưu...' : isAdd ? 'Giao công việc' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}